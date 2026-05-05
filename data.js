// USUÁRIOS
const USERS = [
  { id: 'douglas', name: 'Douglas', pin: '1234', role: 'admin', color: '#FF6B6B', avatar: '👨‍💼' },
  { id: 'dayane', name: 'Dayane', pin: '5678', role: 'admin', color: '#4ECDC4', avatar: '👩‍💼' },
  { id: 'isadora', name: 'Isadora', pin: '2468', role: 'user', color: '#95E1D3', avatar: '👧' },
  { id: 'arthur', name: 'Arthur', pin: '1357', role: 'user', color: '#FFA07A', avatar: '👦' },
  { id: 'icaro', name: 'Ícaro', pin: '9876', role: 'user', color: '#FFB6C1', avatar: '🧒' }
];

// ESCALA SEMANAL FIXA
const WEEKLY_SCHEDULE = {
  'segunda': { responsible: 'douglas', tasks: ['lavar-louça', 'varrer-cozinha'] },
  'terça': { responsible: 'dayane', tasks: ['lavar-louça', 'limpar-banheiro'] },
  'quarta': { responsible: 'isadora', tasks: ['lavar-louça', 'varrer-cozinha'] },
  'quinta': { responsible: 'arthur', tasks: ['lavar-louça', 'limpar-banheiro'] },
  'sexta': { responsible: 'icaro', tasks: ['lavar-louça', 'varrer-cozinha'] },
  'sábado': { responsible: 'douglas', tasks: ['limpeza-geral', 'lavar-carros'] },
  'domingo': { responsible: 'dayane', tasks: ['limpeza-geral', 'organizar-casa'] }
};

// TAREFAS FIXAS
const FIXED_TASKS = [
  { id: 'lavar-louça', name: 'Lavar louça', icon: '🍽️', points: 10 },
  { id: 'varrer-cozinha', name: 'Varrer cozinha', icon: '🧹', points: 15 },
  { id: 'limpar-banheiro', name: 'Limpar banheiro', icon: '🚽', points: 20 },
  { id: 'limpeza-geral', name: 'Limpeza geral', icon: '✨', points: 50 },
  { id: 'lavar-carros', name: 'Lavar carros', icon: '🚗', points: 30 },
  { id: 'organizar-casa', name: 'Organizar casa', icon: '📦', points: 25 },
  { id: 'compras', name: 'Fazer compras', icon: '🛒', points: 30 }
];

// MEDALHAS
const MEDALS = [
  { id: 'perfect_day', title: 'Dia Perfeito', description: 'Completou todas as tarefas do dia', icon: '\ud83c\udf1f' },
  { id: 'perfect_week', title: 'Semana Completa', description: 'Completou todas as tarefas da semana', icon: '\ud83c\udf20' },
  { id: 'on_time', title: 'No Horário', description: '5 tarefas concluídas dentro do horário', icon: '\u23f3' },
  { id: 'photo_streak', title: 'Fotógrafo', description: '10 fotos anexadas com qualidade', icon: '\ud83d\udcf7' }
];

// RETORNA ESCALA DO DIA ATUAL
function getTodaySchedule() {
  const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const dayName = dayNames[new Date().getDay()];
  return WEEKLY_SCHEDULE[dayName];
}

// EXPORTAR
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { USERS, WEEKLY_SCHEDULE, FIXED_TASKS, MEDALS, getTodaySchedule };
}
