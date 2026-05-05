// LOCALSTOGE - PERSISTÊNCIA DE DADOS

class Storage {
  // SALVA USUÁRIOS E PINOS
  saveUsers(users) {
    localStorage.setItem('casaclean_users', JSON.stringify(users));
  }

  loadUsers() {
    const data = localStorage.getItem('casaclean_users');
    return data ? JSON.parse(data) : null;
  }

  // SALVA TAREFAS DO DIA
  saveDailyTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`casaclean_tasks_${today}`, JSON.stringify(tasks));
  }

  loadDailyTasks() {
    const today = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(`casaclean_tasks_${today}`);
    return data ? JSON.parse(data) : [];
  }

  // SALVA HISTÓRICO COMPLETO
  saveTaskHistory(history) {
    localStorage.setItem('casaclean_history', JSON.stringify(history));
  }

  loadTaskHistory() {
    const data = localStorage.getItem('casaclean_history');
    return data ? JSON.parse(data) : [];
  }

  // SALVA USUÁRIO LOGADO
  saveCurrentUser(userId) {
    localStorage.setItem('casaclean_current_user', userId);
  }

  loadCurrentUser() {
    return localStorage.getItem('casaclean_current_user');
  }

  // SALVA MEDALHAS DO USUÁRIO
  saveMedals(userId, medals) {
    localStorage.setItem(`casaclean_medals_${userId}`, JSON.stringify(medals));
  }

  loadMedals(userId) {
    const data = localStorage.getItem(`casaclean_medals_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  // LIMPA DADOS (para desenvolvimento)
  clearAll() {
    localStorage.clear();
  }

  // ADICIONA TAREFA AO HISTÓRICO
  addToHistory(task) {
    const history = this.loadTaskHistory();
    history.push({
      ...task,
      completedAt: new Date().toISOString(),
      photo: task.photo || null
    });
    this.saveTaskHistory(history);
  }
}

const storage = new Storage();
