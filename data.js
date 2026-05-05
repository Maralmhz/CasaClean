// ─── USERS ───────────────────────────────────────────────────────────────────
const USERS = [
  { id: 'douglas',  name: 'Douglas',  pin: '1234', role: 'admin',  color: '#6c63ff', emoji: '👨‍💼' },
  { id: 'isadora',  name: 'Isadora',  pin: '2345', role: 'user',   color: '#f472b6', emoji: '👩‍🍳' },
  { id: 'arthur',   name: 'Arthur',   pin: '3456', role: 'user',   color: '#38bdf8', emoji: '👦' },
  { id: 'icaro',    name: 'Ícaro',    pin: '4567', role: 'user',   color: '#4ade80', emoji: '🧑' },
  { id: 'dayane',   name: 'Dayane',   pin: '5678', role: 'user',   color: '#fb923c', emoji: '👩', onlyDinner: true },
];

// ─── TASK ICONS ───────────────────────────────────────────────────────────────
const TASK_ICONS = {
  'louça':          '🍽️',
  'varrer':         '🧹',
  'lixo manhã':     '🌅',
  'lixo noite':     '🌙',
  'banheiro':       '🚿',
  'quintal':        '🌿',
  'colocar lixo':   '🗑️',
  'jantar':         '🍲',
};

function getTaskIcon(name) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(TASK_ICONS)) {
    if (lower.includes(k)) return v;
  }
  return '📌';
}

// ─── WEEKLY SCHEDULE ──────────────────────────────────────────────────────────
const WEEKLY_SCHEDULE = {
  domingo: [
    { task: 'Louça',         user: 'douglas', time: '08:00' },
    { task: 'Varrer casa',   user: 'isadora', time: '10:00' },
    { task: 'Lixo manhã',    user: 'arthur',  time: '08:00' },
    { task: 'Lixo noite',    user: 'arthur',  time: '21:00' },
    { task: 'Banheiro',      user: 'icaro',   time: '11:00' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
  segunda: [
    { task: 'Louça',         user: 'isadora', time: '08:00' },
    { task: 'Varrer casa',   user: 'arthur',  time: '10:00' },
    { task: 'Lixo manhã',    user: 'icaro',   time: '08:00' },
    { task: 'Lixo noite',    user: 'douglas', time: '21:00' },
    { task: 'Banheiro',      user: 'isadora', time: '11:00' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
  terça: [
    { task: 'Louça',         user: 'arthur',  time: '08:00' },
    { task: 'Varrer casa',   user: 'icaro',   time: '10:00' },
    { task: 'Lixo manhã',    user: 'douglas', time: '08:00' },
    { task: 'Lixo noite',    user: 'isadora', time: '21:00' },
    { task: 'Banheiro',      user: 'arthur',  time: '11:00' },
    { task: 'Colocar lixo',  user: 'icaro',   time: '06:30' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
  quarta: [
    { task: 'Louça',         user: 'icaro',   time: '08:00' },
    { task: 'Varrer casa',   user: 'douglas', time: '10:00' },
    { task: 'Lixo manhã',    user: 'isadora', time: '08:00' },
    { task: 'Lixo noite',    user: 'arthur',  time: '21:00' },
    { task: 'Banheiro',      user: 'icaro',   time: '11:00' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
  quinta: [
    { task: 'Louça',         user: 'douglas', time: '08:00' },
    { task: 'Varrer casa',   user: 'isadora', time: '10:00' },
    { task: 'Lixo manhã',    user: 'arthur',  time: '08:00' },
    { task: 'Lixo noite',    user: 'icaro',   time: '21:00' },
    { task: 'Banheiro',      user: 'douglas', time: '11:00' },
    { task: 'Colocar lixo',  user: 'isadora', time: '06:30' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
  sexta: [
    { task: 'Louça',         user: 'isadora', time: '08:00' },
    { task: 'Varrer casa',   user: 'arthur',  time: '10:00' },
    { task: 'Lixo manhã',    user: 'icaro',   time: '08:00' },
    { task: 'Lixo noite',    user: 'douglas', time: '21:00' },
    { task: 'Banheiro',      user: 'arthur',  time: '11:00' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
  sábado: [
    { task: 'Louça',         user: 'arthur',  time: '08:00' },
    { task: 'Varrer casa',   user: 'icaro',   time: '10:00' },
    { task: 'Lixo manhã',    user: 'douglas', time: '08:00' },
    { task: 'Lixo noite',    user: 'isadora', time: '21:00' },
    { task: 'Banheiro',      user: 'icaro',   time: '11:00' },
    { task: 'Quintal',       user: 'douglas', time: '09:00' },
    { task: 'Colocar lixo',  user: 'arthur',  time: '06:30' },
    { task: 'Jantar',        user: 'dayane',  time: '19:00' },
  ],
};

const WEEKDAY_NAMES = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];

function getWeekdayName(date = new Date()) {
  return WEEKDAY_NAMES[date.getDay()];
}

function getTasksForDay(date = new Date()) {
  const day = getWeekdayName(date);
  return WEEKLY_SCHEDULE[day] || [];
}

function getUserById(id) {
  return USERS.find(u => u.id === id) || null;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── MEDALS DEFINITIONS ───────────────────────────────────────────────────────
const MEDALS_DEF = [
  { id: 'streak3',   icon: '🔥', name: '3 dias seguidos',   desc: 'Completou tarefas 3 dias consecutivos',  threshold: 3  },
  { id: 'streak7',   icon: '⚡', name: 'Semana perfeita',   desc: 'Completou tarefas 7 dias seguidos',       threshold: 7  },
  { id: 'first',     icon: '🌟', name: 'Primeiro passo',    desc: 'Concluiu a primeira tarefa com foto',     threshold: 1  },
  { id: 'speed',     icon: '⏱️', name: 'Relâmpago',         desc: 'Concluiu tarefa antes do horário',        threshold: 1  },
  { id: 'clean10',   icon: '💎', name: 'Dedicação',         desc: 'Concluiu 10 tarefas no total',            threshold: 10 },
  { id: 'photo',     icon: '📸', name: 'Fotógrafo',         desc: 'Enviou 5 comprovantes de tarefas',        threshold: 5  },
];
