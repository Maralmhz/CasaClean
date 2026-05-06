// ─── STORAGE.JS — Firebase Firestore + Storage ───────────────────────────────
// Mantém a mesma API pública do storage.js original (funções síncronas com
// fallback localStorage) e adiciona sincronização assíncrona com Firestore.

// ─── KEYS (localStorage fallback) ────────────────────────────────────────────
const STORAGE_KEYS = {
  tasks:    'casaclean_tasks',
  history:  'casaclean_history',
  schedule: 'casaclean_schedule',
};

// ─── HELPERS LOCAL ────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── FIREBASE SYNC ────────────────────────────────────────────────────────────
async function syncToFirestore(collection, docId, data) {
  try {
    const { db, doc, setDoc } = await import('./firebase.js');
    await setDoc(doc(db, collection, docId), data, { merge: true });
  } catch(e) { console.warn('Firestore sync error:', e); }
}

async function loadFromFirestore(colName, docId) {
  try {
    const { db, doc, getDoc } = await import('./firebase.js');
    const snap = await getDoc(doc(db, colName, docId));
    return snap.exists() ? snap.data() : null;
  } catch(e) { console.warn('Firestore load error:', e); return null; }
}

// ─── UPLOAD FOTO (Storage) ────────────────────────────────────────────────────
export async function uploadProofPhoto(taskId, base64DataUrl) {
  try {
    const { storage, ref, uploadString, getDownloadURL } = await import('./firebase.js');
    const photoRef = ref(storage, `proofs/${todayISO()}/${taskId}.jpg`);
    await uploadString(photoRef, base64DataUrl, 'data_url');
    return await getDownloadURL(photoRef);
  } catch(e) {
    console.warn('Upload error, usando base64 local:', e);
    return base64DataUrl;
  }
}

// ─── CUSTOM SCHEDULE ─────────────────────────────────────────────────────────
function getCustomSchedule() {
  return loadJSON(STORAGE_KEYS.schedule, {});
}

function addToCustomSchedule({ weekday, task, user, time }) {
  const s = getCustomSchedule();
  if (!s[weekday]) s[weekday] = [];
  s[weekday].push({ task, user, time, custom: true, id: Date.now().toString() });
  saveJSON(STORAGE_KEYS.schedule, s);
  syncToFirestore('schedule', 'custom', s);
}

// ─── DAILY TASKS ──────────────────────────────────────────────────────────────
function getDailyTasks(dateISO = todayISO()) {
  const stored = loadJSON(STORAGE_KEYS.tasks, {});
  return stored[dateISO] || null;
}

function saveDailyTasks(tasks, dateISO = todayISO()) {
  const stored = loadJSON(STORAGE_KEYS.tasks, {});
  stored[dateISO] = tasks;
  saveJSON(STORAGE_KEYS.tasks, stored);
  syncToFirestore('tasks', dateISO, { tasks });
}

function initDailyTasks(date = new Date()) {
  const dateISO  = date.toISOString().slice(0, 10);
  const existing = getDailyTasks(dateISO);
  if (existing) return existing;

  const weekday = getWeekdayName(date);
  const base    = getTasksForDay(date).map(t => ({ ...t, custom: false }));
  const extras  = getCustomSchedule()[weekday] || [];
  const all     = [...base, ...extras];

  const tasks = all.map((t, i) => ({
    id:          `${dateISO}-${i}-${t.task.toLowerCase().replace(/\s+/g, '-')}`,
    task:        t.task,
    user:        t.user,
    time:        t.time || '18:00',
    deadline:    getDeadlineForTask(t.task),
    status:      'pending',
    proofUrl:    null,
    completedAt: null,
    custom:      !!t.custom,
  }));

  saveDailyTasks(tasks, dateISO);
  return tasks;
}

async function completeTask(taskId, proofBase64, dateISO = todayISO()) {
  const tasks = getDailyTasks(dateISO);
  if (!tasks) return false;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return false;

  // Upload foto para Storage e pega URL pública
  const proofUrl = await uploadProofPhoto(taskId, proofBase64);

  task.status      = 'done';
  task.proofUrl    = proofUrl;
  task.completedAt = new Date().toISOString();
  saveDailyTasks(tasks, dateISO);
  addToHistory(task, dateISO);
  return true;
}

function addExtraTaskToday({ task, user, time }) {
  const dateISO = todayISO();
  const tasks   = getDailyTasks(dateISO) || initDailyTasks();
  const id      = `${dateISO}-extra-${Date.now()}`;
  tasks.push({
    id, task, user,
    time:        time || '18:00',
    deadline:    getDeadlineForTask(task),
    status:      'pending',
    proofUrl:    null,
    completedAt: null,
    custom:      true,
  });
  saveDailyTasks(tasks, dateISO);
  return id;
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function addToHistory(task, dateISO) {
  const history = loadJSON(STORAGE_KEYS.history, []);
  history.push({ ...task, date: dateISO });
  saveJSON(STORAGE_KEYS.history, history);
  syncToFirestore('history', `${dateISO}-${task.id}`, { ...task, date: dateISO });
}

function getHistory() {
  return loadJSON(STORAGE_KEYS.history, []);
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function getUserStats(userId) {
  const mine = getHistory().filter(h => h.user === userId);
  return { total: mine.length, photos: mine.filter(h => h.proofUrl).length };
}

function getLeaderboard() {
  const counts = {};
  for (const h of getHistory()) counts[h.user] = (counts[h.user] || 0) + 1;
  return USERS
    .filter(u => !u.onlyDinner)
    .map(u => ({ ...u, count: counts[u.id] || 0 }))
    .sort((a, b) => b.count - a.count);
}

// ─── USERS (Firestore sync) ───────────────────────────────────────────────────
function saveUsers(users) {
  USERS = users;
  localStorage.setItem('casaclean_users', JSON.stringify(users));
  syncToFirestore('config', 'users', { users });
}

// ─── DEADLINES (Firestore sync) ──────────────────────────────────────────────
function saveDeadlines(deadlines) {
  localStorage.setItem('casaclean_deadlines', JSON.stringify(deadlines));
  syncToFirestore('config', 'deadlines', deadlines);
}

// ─── CARREGA DADOS DO FIRESTORE NA INICIALIZAÇÃO ─────────────────────────────
async function hydrateFromFirestore() {
  try {
    // Usuários
    const usersDoc = await loadFromFirestore('config', 'users');
    if (usersDoc?.users) {
      localStorage.setItem('casaclean_users', JSON.stringify(usersDoc.users));
      USERS = usersDoc.users;
    }

    // Deadlines
    const dlDoc = await loadFromFirestore('config', 'deadlines');
    if (dlDoc) {
      localStorage.setItem('casaclean_deadlines', JSON.stringify(dlDoc));
    }

    // Tarefas de hoje
    const todayDoc = await loadFromFirestore('tasks', todayISO());
    if (todayDoc?.tasks) {
      const stored = loadJSON(STORAGE_KEYS.tasks, {});
      stored[todayISO()] = todayDoc.tasks;
      saveJSON(STORAGE_KEYS.tasks, stored);
    }

    // Histórico (últimos 30 dias)
    const { db, collection, getDocs, query, orderBy } = await import('./firebase.js');
    const histSnap = await getDocs(collection(db, 'history'));
    if (!histSnap.empty) {
      const history = [];
      histSnap.forEach(d => history.push(d.data()));
      history.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
      saveJSON(STORAGE_KEYS.history, history);
    }

    // Schedule custom
    const schedDoc = await loadFromFirestore('schedule', 'custom');
    if (schedDoc) {
      saveJSON(STORAGE_KEYS.schedule, schedDoc);
    }

    console.log('✅ Firebase hydration completa');
  } catch(e) {
    console.warn('Hydration parcial:', e);
  }
}

// ─── DEBUG ────────────────────────────────────────────────────────────────────
function clearTodayData_storage() {
  const stored = loadJSON(STORAGE_KEYS.tasks, {});
  delete stored[todayISO()];
  saveJSON(STORAGE_KEYS.tasks, stored);
}

// Exporta hydrateFromFirestore para ser chamada no app.js
window.hydrateFromFirestore = hydrateFromFirestore;
window.completeTask = completeTask;
