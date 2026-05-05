// ─── KEYS ────────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  tasks:    'casaclean_tasks',
  history:  'casaclean_history',
  schedule: 'casaclean_schedule',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

// ─── CUSTOM SCHEDULE (extras) ────────────────────────────────────────────────
function getCustomSchedule() {
  return loadJSON(STORAGE_KEYS.schedule, {});
}

function addToCustomSchedule({ weekday, task, user, time }) {
  const s = getCustomSchedule();
  if (!s[weekday]) s[weekday] = [];
  s[weekday].push({ task, user, time, custom: true, id: Date.now().toString() });
  saveJSON(STORAGE_KEYS.schedule, s);
}

// ─── DAILY TASKS ─────────────────────────────────────────────────────────────
function getDailyTasks(dateISO = todayISO()) {
  const stored = loadJSON(STORAGE_KEYS.tasks, {});
  return stored[dateISO] || null;
}

function saveDailyTasks(tasks, dateISO = todayISO()) {
  const stored = loadJSON(STORAGE_KEYS.tasks, {});
  stored[dateISO] = tasks;
  saveJSON(STORAGE_KEYS.tasks, stored);
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

function completeTask(taskId, proofUrl, dateISO = todayISO()) {
  const tasks = getDailyTasks(dateISO);
  if (!tasks) return false;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return false;
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

// ─── HISTORY ─────────────────────────────────────────────────────────────────
function addToHistory(task, dateISO) {
  const history = loadJSON(STORAGE_KEYS.history, []);
  history.push({ ...task, date: dateISO });
  saveJSON(STORAGE_KEYS.history, history);
}

function getHistory() {
  return loadJSON(STORAGE_KEYS.history, []);
}

// ─── STATS ───────────────────────────────────────────────────────────────────
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

// ─── DEBUG ───────────────────────────────────────────────────────────────────
function clearTodayData_storage() {
  const stored = loadJSON(STORAGE_KEYS.tasks, {});
  delete stored[todayISO()];
  saveJSON(STORAGE_KEYS.tasks, stored);
}
