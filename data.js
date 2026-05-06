// ─── USERS (base - overridden by admin settings in localStorage) ─────────────────
const USERS_DEFAULT = [
  // Admins — topo
  { id: 'douglas',  name: 'Douglas',  pin: '1234', role: 'admin',  color: '#6c63ff', emoji: '👨‍💼' },
  { id: 'dayane',   name: 'Dayane',   pin: '1234', role: 'admin',  color: '#fb923c', emoji: '👩‍👧‍👦', onlyDinner: true },
  // Filhos — ordem: mais velha ao mais novo
  { id: 'isadora',  name: 'Isadora',  pin: '1234', role: 'user',   color: '#f472b6', emoji: '👧' },
  { id: 'arthur',   name: 'Arthur',   pin: '1234', role: 'user',   color: '#38bdf8', emoji: '👦' },
  { id: 'icaro',    name: 'Ícaro',    pin: '1234', role: 'user',   color: '#4ade80', emoji: '👶' },
];

function getUsers() {
  try {
    const saved = localStorage.getItem('casaclean_users');
    return saved ? JSON.parse(saved) : USERS_DEFAULT;
  } catch { return USERS_DEFAULT; }
}

let USERS = getUsers();

function saveUsers(users) {
  USERS = users;
  localStorage.setItem('casaclean_users', JSON.stringify(users));
}

// ─── TASK DEADLINES ──────────────────────────────────────────────────────────────────
const DEADLINES_DEFAULT = {
  'lixo manhã':    '07:30',
  'colocar lixo':  '07:30',
  'varrer casa':   '11:59',
  'banheiro':      '11:59',
  'quintal':       '11:59',
  'lixo noite':    '22:00',
  'louça':         '20:00',
  'jantar':        '23:59',
  'default':       '23:59',
};

function getDeadlines() {
  try {
    const saved = localStorage.getItem('casaclean_deadlines');
    return saved ? { ...DEADLINES_DEFAULT, ...JSON.parse(saved) } : DEADLINES_DEFAULT;
  } catch { return DEADLINES_DEFAULT; }
}

function saveDeadlines(deadlines) {
  localStorage.setItem('casaclean_deadlines', JSON.stringify(deadlines));
}

function getDeadlineForTask(taskName) {
  const dl = getDeadlines();
  const lower = taskName.toLowerCase();
  for (const [k, v] of Object.entries(dl)) {
    if (k !== 'default' && lower.includes(k)) return v;
  }
  return dl['default'] || '23:59';
}

function isTaskOverdue(task) {
  if (task.status === 'done') return false;
  const deadline = getDeadlineForTask(task.task);
  const now = new Date();
  const [h, m] = deadline.split(':').map(Number);
  const limit = new Date();
  limit.setHours(h, m, 0, 0);
  return now > limit;
}

// ─── TASK ICONS ────────────────────────────────────────────────────────────────────────────
const TASK_ICONS = {
  'louça':         '🍽️',
  'varrer':        '🧹',
  'lixo manhã':    '🌅',
  'lixo noite':    '🌙',
  'banheiro':      '🛇',
  'quintal':       '🌿',
  'colocar lixo':  '🗑️',
  'jantar':        '🍲',
};

function getTaskIcon(name) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(TASK_ICONS)) {
    if (lower.includes(k)) return v;
  }
  return '📌';
}

// ─── WEEKLY SCHEDULE ──────────────────────────────────────────────────────────────────────────
const WEEKLY_SCHEDULE_DEFAULT = {
  domingo: [
    { task: 'Louça',        user: 'douglas', time: '08:00' },
    { task: 'Varrer casa',  user: 'isadora', time: '10:00' },
    { task: 'Lixo manhã',   user: 'arthur',  time: '07:00' },
    { task: 'Lixo noite',   user: 'arthur',  time: '21:00' },
    { task: 'Banheiro',     user: 'icaro',   time: '10:00' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
  segunda: [
    { task: 'Louça',        user: 'isadora', time: '08:00' },
    { task: 'Varrer casa',  user: 'arthur',  time: '10:00' },
    { task: 'Lixo manhã',   user: 'icaro',   time: '07:00' },
    { task: 'Lixo noite',   user: 'douglas', time: '21:00' },
    { task: 'Banheiro',     user: 'isadora', time: '10:00' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
  terça: [
    { task: 'Louça',        user: 'arthur',  time: '08:00' },
    { task: 'Varrer casa',  user: 'icaro',   time: '10:00' },
    { task: 'Lixo manhã',   user: 'douglas', time: '07:00' },
    { task: 'Lixo noite',   user: 'isadora', time: '21:00' },
    { task: 'Banheiro',     user: 'arthur',  time: '10:00' },
    { task: 'Colocar lixo', user: 'icaro',   time: '06:30' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
  quarta: [
    { task: 'Louça',        user: 'icaro',   time: '08:00' },
    { task: 'Varrer casa',  user: 'douglas', time: '10:00' },
    { task: 'Lixo manhã',   user: 'isadora', time: '07:00' },
    { task: 'Lixo noite',   user: 'arthur',  time: '21:00' },
    { task: 'Banheiro',     user: 'icaro',   time: '10:00' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
  quinta: [
    { task: 'Louça',        user: 'douglas', time: '08:00' },
    { task: 'Varrer casa',  user: 'isadora', time: '10:00' },
    { task: 'Lixo manhã',   user: 'arthur',  time: '07:00' },
    { task: 'Lixo noite',   user: 'icaro',   time: '21:00' },
    { task: 'Banheiro',     user: 'douglas', time: '10:00' },
    { task: 'Colocar lixo', user: 'isadora', time: '06:30' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
  sexta: [
    { task: 'Louça',        user: 'isadora', time: '08:00' },
    { task: 'Varrer casa',  user: 'arthur',  time: '10:00' },
    { task: 'Lixo manhã',   user: 'icaro',   time: '07:00' },
    { task: 'Lixo noite',   user: 'douglas', time: '21:00' },
    { task: 'Banheiro',     user: 'arthur',  time: '10:00' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
  sábado: [
    { task: 'Louça',        user: 'arthur',  time: '08:00' },
    { task: 'Varrer casa',  user: 'icaro',   time: '10:00' },
    { task: 'Lixo manhã',   user: 'douglas', time: '07:00' },
    { task: 'Lixo noite',   user: 'isadora', time: '21:00' },
    { task: 'Banheiro',     user: 'icaro',   time: '10:00' },
    { task: 'Quintal',      user: 'douglas', time: '09:00' },
    { task: 'Colocar lixo', user: 'arthur',  time: '06:30' },
    { task: 'Jantar',       user: 'dayane',  time: '19:00' },
  ],
};

const WEEKDAY_NAMES = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];

function getWeekdayName(date = new Date()) {
  return WEEKDAY_NAMES[date.getDay()];
}

function getBaseSchedule() {
  try {
    const saved = localStorage.getItem('casaclean_base_schedule');
    return saved ? JSON.parse(saved) : WEEKLY_SCHEDULE_DEFAULT;
  } catch { return WEEKLY_SCHEDULE_DEFAULT; }
}

function saveBaseSchedule(schedule) {
  localStorage.setItem('casaclean_base_schedule', JSON.stringify(schedule));
}

const WEEKLY_SCHEDULE = WEEKLY_SCHEDULE_DEFAULT;

function getTasksForDay(date = new Date()) {
  const day = getWeekdayName(date);
  const base = getBaseSchedule();
  return base[day] || [];
}

function getUserById(id) {
  return USERS.find(u => u.id === id) || null;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── MEDALS ───────────────────────────────────────────────────────────────────────────────
const MEDALS_DEF = [
  { id: 'first',   icon: '🌟', name: 'Primeiro passo',  desc: 'Concluiu a primeira tarefa',        threshold: 1  },
  { id: 'clean10', icon: '💎', name: 'Dedicação',        desc: 'Concluiu 10 tarefas no total',       threshold: 10 },
  { id: 'clean30', icon: '🏆', name: 'Campeão',          desc: 'Concluiu 30 tarefas no total',       threshold: 30 },
  { id: 'photo',   icon: '📸', name: 'Fotógrafo',        desc: 'Enviou 5 comprovantes',              threshold: 5  },
  { id: 'streak3', icon: '🔥', name: '3 dias seguidos',  desc: 'Completou tarefas 3 dias seguidos',  threshold: 3  },
  { id: 'speed',   icon: '⚡', name: 'Relâmpago',        desc: 'Concluiu antes do prazo',            threshold: 1  },
];
