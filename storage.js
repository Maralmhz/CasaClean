// ─── STORAGE.JS — Firestore (sem Firebase Storage) ───────────────────────────
// Fotos são salvas como base64 diretamente no Firestore (plano gratuito Spark)

const STORAGE_KEYS = {
  tasks:    'casaclean_tasks',
  history:  'casaclean_history',
  schedule: 'casaclean_schedule',
};

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

// ─── FIRESTORE SYNC ────────────────────────────────────────────────────────
async function syncToFirestore(col, docId, data) {
  try {
    const { db, doc, setDoc } = await import('./firebase.js');
    await setDoc(doc(db, col, docId), data, { merge: true });
  } catch(e) { console.warn('Firestore sync error:', e); }
}

async function loadFromFirestore(col, docId) {
  try {
    const { db, doc, getDoc } = await import('./firebase.js');
    const snap = await getDoc(doc(db, col, docId));
    return snap.exists() ? snap.data() : null;
  } catch(e) { console.warn('Firestore load error:', e); return null; }
}

// ─── FOTO: comprime base64 e salva no Firestore ────────────────────────────
async function compressAndSavePhoto(taskId, base64DataUrl, dateISO) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 400;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      canvas.width  = img.width  * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.5);
      // Salva foto separadamente no Firestore
      syncToFirestore('photos', `${dateISO}-${taskId}`, { photo: compressed, taskId, date: dateISO });
      resolve(compressed);
    };
    img.onerror = () => resolve(base64DataUrl);
    img.src = base64DataUrl;
  });
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
  // Não salva base64 no documento principal de tarefas (evita documento grande)
  const tasksClean = tasks.map(t => ({ ...t, proofUrl: t.proofUrl?.startsWith('data:') ? '[foto-local]' : t.proofUrl }));
  stored[dateISO] = tasks; // local com base64
  saveJSON(STORAGE_KEYS.tasks, stored);
  syncToFirestore('tasks', dateISO, { tasks: tasksClean }); // Firestore sem base64 pesado
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

  // Comprime foto e salva no Firestore como doc separado
  const proofUrl = await compressAndSavePhoto(taskId, proofBase64, dateISO);

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
  // Salva no histórico sem base64
  const taskClean = { ...task, date: dateISO, proofUrl: task.proofUrl?.startsWith('data:') ? '[foto-local]' : task.proofUrl };
  syncToFirestore('history', `${dateISO}-${task.id}`, taskClean);
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

// ─── USERS ────────────────────────────────────────────────────────────────────
function saveUsers(users) {
  USERS = users;
  localStorage.setItem('casaclean_users', JSON.stringify(users));
  syncToFirestore('config', 'users', { users });
}

// ─── DEADLINES ───────────────────────────────────────────────────────────────
function saveDeadlines(deadlines) {
  localStorage.setItem('casaclean_deadlines', JSON.stringify(deadlines));
  syncToFirestore('config', 'deadlines', deadlines);
}

// ─── HYDRATE DO FIRESTORE NA INICIALIZAÇÃO ─────────────────────────────────
async function hydrateFromFirestore() {
  try {
    const usersDoc = await loadFromFirestore('config', 'users');
    if (usersDoc?.users) {
      localStorage.setItem('casaclean_users', JSON.stringify(usersDoc.users));
      USERS = usersDoc.users;
    }

    const dlDoc = await loadFromFirestore('config', 'deadlines');
    if (dlDoc) localStorage.setItem('casaclean_deadlines', JSON.stringify(dlDoc));

    const todayDoc = await loadFromFirestore('tasks', todayISO());
    if (todayDoc?.tasks) {
      const stored = loadJSON(STORAGE_KEYS.tasks, {});
      stored[todayISO()] = todayDoc.tasks;
      saveJSON(STORAGE_KEYS.tasks, stored);
    }

    const { db, collection, getDocs } = await import('./firebase.js');
    const histSnap = await getDocs(collection(db, 'history'));
    if (!histSnap.empty) {
      const history = [];
      histSnap.forEach(d => history.push(d.data()));
      history.sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));
      saveJSON(STORAGE_KEYS.history, history);
    }

    const schedDoc = await loadFromFirestore('schedule', 'custom');
    if (schedDoc) saveJSON(STORAGE_KEYS.schedule, schedDoc);

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

window.hydrateFromFirestore = hydrateFromFirestore;
window.completeTask = completeTask;
