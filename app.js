// LÓGICA PRINCIPAL DA APLICAÇÃO

class CasaClean {
  constructor() {
    this.currentUser = null;
    this.users = USERS;
    this.allUsers = USERS;
    this.dailyTasks = [];
  }

  // VALIDA PIN E FAZ LOGIN
  login(userId, pin) {
    const user = this.users.find(u => u.id === userId);
    if (user && user.pin === pin) {
      this.currentUser = user;
      storage.saveCurrentUser(userId);
      return true;
    }
    return false;
  }

  // LOGOUT
  logout() {
    this.currentUser = null;
    storage.saveCurrentUser(null);
  }

  // CARREGA TAREFAS DO DIA
  loadTodayTasks() {
    const schedule = getTodaySchedule();
    const dailyTasks = FIXED_TASKS.filter(task => 
      schedule.tasks.includes(task.id)
    ).map(task => ({
      ...task,
      responsible: schedule.responsible,
      completed: false,
      photo: null
    }));
    this.dailyTasks = dailyTasks;
    return dailyTasks;
  }

  // COMPLETA TAREFA COM FOTO
  completeTask(taskId, photoData) {
    const task = this.dailyTasks.find(t => t.id === taskId);
    if (task && this.currentUser.id === task.responsible) {
      task.completed = true;
      task.photo = photoData;
      storage.addToHistory(task);
      this.checkMedals();
      return true;
    }
    return false;
  }

  // VERIFICA MEDALHAS CONQUISTADAS
  checkMedals() {
    const medals = storage.loadMedals(this.currentUser.id) || [];
    const tasksCompleted = this.dailyTasks.filter(t => t.completed).length;
    const totalTasks = this.dailyTasks.length;

    // MEDAL: Dia Perfeito
    if (tasksCompleted === totalTasks && !medals.find(m => m.id === 'perfect_day')) {
      medals.push(MEDALS[0]);
    }

    storage.saveMedals(this.currentUser.id, medals);
  }

  // ALTERA PIN (ADMIN)
  changePIN(newPin) {
    if (this.currentUser.role === 'admin') {
      const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
      this.users[userIndex].pin = newPin;
      return true;
    }
    return false;
  }

  // ALTERA PIN DE OUTRO USUÁRIO (ADMIN)
  changeUserPIN(userId, newPin) {
    if (this.currentUser.role === 'admin') {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.pin = newPin;
        return true;
      }
    }
    return false;
  }

  // ADICIONA TAREFA EXTRA (ADMIN)
  addExtraTask(taskName, icon, points) {
    if (this.currentUser.role === 'admin') {
      const newTask = {
        id: `extra_${Date.now()}`,
        name: taskName,
        icon: icon,
        points: points
      };
      FIXED_TASKS.push(newTask);
      return newTask;
    }
    return null;
  }
}

const app = new CasaClean();
