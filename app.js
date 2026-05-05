// ─── STATE ───

let currentUser   = null;
let pinTarget     = null;
let pinBuffer     = '';
let filterMode    = 'all';
let currentScreen = 'home';
let pendingPhotos = {};

// ─── INIT ───

document.addEventListener('DOMContentLoaded', () => {
  buildUserGrid();
  bindNavigation();
  bindPinPad();
  bindConfigTabs();
  bindMedalTabs();
  populateUserSelects();
  bindForms();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

// ─── USER GRID ───

function buildUserGrid() {
  const grid = document.getElementById('userGrid');
  grid.innerHTML = '';
  USERS.forEach(u => {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <div class="av-lg" style="background:${u.color}22;color:${u.color}">${u.emoji}</div>
      <span class="user-name">${u.name}</span>
      <span class="user-role">${u.role === 'admin' ? '👑 Admin' : (u.onlyDinner ? '🍲 Jantar' : '👤 Morador')}</span>
    `;
    card.addEventListener('click', () => openPinModal(u));
    grid.appendChild(card);
  });
}

// ─── PIN MODAL ───

function openPinModal(user) {
  pinTarget = user;
  pinBuffer = '';
  document.getElementById('pinModalTitle').textContent = `Olá, ${user.name}! Digite seu PIN`;
  document.getElementById('pinError').textContent = '';
  updatePinDots();
  document.getElementById('pinModal').classList.remove('hidden');
}

function closePinModal() {
  pinTarget = null;
  pinBuffer = '';
  document.getElementById('pinModal').classList.add('hidden');
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    document.getElementById(`pd${i}`).classList.toggle('filled', i < pinBuffer.length);
  }
}

function bindPinPad() {
  document.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.k;
      if (k === 'cancel') { closePinModal(); return; }
      if (k === 'del')    { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(); return; }
      if (pinBuffer.length >= 4) return;
      pinBuffer += k;
      updatePinDots();
      if (pinBuffer.length === 4) validatePin();
    });
  });
}

function validatePin() {
  if (!pinTarget) return;
  if (pinBuffer === pinTarget.pin) {
    currentUser = pinTarget;
    closePinModal();
    enterApp();
  } else {
    document.getElementById('pinError').textContent = 'PIN incorreto. Tente novamente.';
    pinBuffer = '';
    updatePinDots();
  }
}

// ─── APP ENTRY ───

function enterApp() {
  updateUserBadges();
  navigateTo('home');
  showToast(`Bem-vindo, ${currentUser.name}! 👋`, 'success');
  scheduleNotifications();
}

function logout() {
  currentUser = null;
  filterMode = 'all';
  showScreen('screen-login');
  showToast('Sessão encerrada', 'info');
}

function updateUserBadges() {
  if (!currentUser) return;
  ['currentUser','histUser','medUser','cfgUser'].forEach(prefix => {
    const av   = document.getElementById(`${prefix}Av`);
    const name = document.getElementById(`${prefix}Name`);
    const pill = document.getElementById(`${prefix}Pill`);
    if (av)   { av.textContent = currentUser.emoji; av.style.background = currentUser.color + '22'; }
    if (name) name.textContent = currentUser.name;
    if (pill && currentUser.role === 'admin' && !pill.querySelector('.admin-badge')) {
      const b = document.createElement('span');
      b.className = 'admin-badge';
      b.textContent = 'admin';
      pill.appendChild(b);
    }
  });
}

// ─── NAVIGATION ───

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function navigateTo(screen) {
  currentScreen = screen;
  showScreen(`screen-${screen}`);
  if (screen === 'home')    renderDashboard();
  if (screen === 'history') renderHistory();
  if (screen === 'medals')  renderMedals();
  if (screen === 'config')  renderScheduleView();
}

function bindNavigation() {
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });
}

// ─── DASHBOARD ───

function renderDashboard() {
  const date    = new Date();
  const dateISO = date.toISOString().slice(0, 10);
  const weekday = getWeekdayName(date);
  const tasks   = initDailyTasks(date);

  const dateOpts = { weekday: 'long', day: 'numeric', month: 'long' };
  document.getElementById('dateLabel').textContent    = date.toLocaleDateString('pt-BR', dateOpts);
  document.getElementById('dateSubLabel').textContent = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} · ${tasks.length} tarefas`;
  document.getElementById('dateEmoji').textContent    = getDayEmoji(date.getDay());

  const done    = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.length - done;
  document.getElementById('sumTotal').textContent   = tasks.length;
  document.getElementById('sumDone').textContent    = done;
  document.getElementById('sumPending').textContent = pending;
  document.getElementById('progressFill').style.width = tasks.length ? `${Math.round((done/tasks.length)*100)}%` : '0%';

  const myTasks = tasks.filter(t => t.user === currentUser?.id);
  document.getElementById('taskSubtitle').textContent =
    currentUser ? `${myTasks.length} suas · ${done} concluídas hoje` : 'Selecione um usuário';
  document.getElementById('filterBtn').textContent = filterMode === 'mine' ? 'Minhas' : 'Todas';

  const list   = document.getElementById('tasksList');
  list.innerHTML = '';
  const toShow = filterMode === 'mine' ? tasks.filter(t => t.user === currentUser?.id) : tasks;

  if (!toShow.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">Tudo certo!</div><div class="empty-desc">Sem tarefas para exibir</div></div>`;
    return;
  }

  toShow.forEach(task => {
    const user  = getUserById(task.user);
    const isDone = task.status === 'done';
    const isOwn  = currentUser && task.user === currentUser.id;
    const icon  = getTaskIcon(task.task);

    const item = document.createElement('div');
    item.className = `task-item${isDone ? ' done' : ''}`;
    item.id = `task-${task.id}`;
    item.innerHTML = `
      <div class="task-top">
        <div class="task-icon">${icon}</div>
        <div class="task-info">
          <div class="task-name">${task.task}</div>
          <div class="task-meta">
            <span style="color:${user?.color || '#aaa'}">${user?.emoji || '👤'} ${user?.name || task.user}</span>
            <span>·</span>
            <span>⏰ ${task.time}</span>
            ${task.custom ? '<span class="chip purple" style="font-size:0.6rem;padding:1px 6px">extra</span>' : ''}
          </div>
        </div>
        <span class="task-status ${isDone ? 'done' : 'pending'}">${isDone ? '✓ Feito' : 'Pendente'}</span>
      </div>
      ${!isDone && isOwn ? `
        <div class="task-bottom">
          <label class="upload-zone" for="photo-${task.id}" style="cursor:pointer">
            <span class="upload-icon">📷</span>
            <span class="upload-text">Foto obrigatória para concluir</span>
            <input type="file" id="photo-${task.id}" accept="image/*" capture="environment" style="display:none"
              onchange="handlePhotoSelect(event,'${task.id}','${dateISO}')"/>
          </label>
          <button class="btn btn-success btn-sm" id="btn-${task.id}"
            onclick="handleComplete('${task.id}','${dateISO}')" disabled>Concluir</button>
        </div>
        <div id="preview-${task.id}"></div>
      ` : ''}
      ${isDone && task.proofUrl ? `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 0">
          <img src="${task.proofUrl}" class="proof-thumb" alt="Comprovante">
          <span style="font-size:0.75rem;color:var(--text3)">✅ Concluído às ${new Date(task.completedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      ` : ''}
    `;
    list.appendChild(item);
  });
}

function getDayEmoji(day) {
  return ['🌅','💼','🔥','🌿','⚡','🎉','🌻'][day];
}

function toggleFilter() {
  filterMode = filterMode === 'mine' ? 'all' : 'mine';
  renderDashboard();
}

// ─── PHOTO & COMPLETE ───

function handlePhotoSelect(event, taskId, dateISO) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    pendingPhotos[taskId] = e.target.result;
    const preview = document.getElementById(`preview-${taskId}`);
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:160px;object-fit:cover;border-radius:10px;margin-top:8px;border:1px solid var(--border)">`;
      preview.style.cssText = 'font-size:0.75rem;color:var(--green);display:flex;flex-direction:column;gap:4px';
    }
    const btn = document.getElementById(`btn-${taskId}`);
    if (btn) btn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function handleComplete(taskId, dateISO) {
  const proof = pendingPhotos[taskId];
  if (!proof) { showToast('Selecione uma foto antes de concluir!', 'error'); return; }
  const ok = completeTask(taskId, proof, dateISO);
  if (ok) {
    delete pendingPhotos[taskId];
    showToast('Tarefa concluída! 🎉', 'success');
    renderDashboard();
  } else {
    showToast('Erro ao concluir tarefa', 'error');
  }
}

// ─── HISTORY ───

function renderHistory() {
  const list    = document.getElementById('historyList');
  const history = getHistory().slice().reverse();

  if (!history.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Sem histórico</div><div class="empty-desc">Conclua tarefas para aparecerem aqui</div></div>`;
    return;
  }

  const groups = {};
  history.forEach(h => { (groups[h.date] = groups[h.date] || []).push(h); });
  list.innerHTML = '';

  Object.entries(groups).forEach(([date, items]) => {
    const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
    const group = document.createElement('div');
    group.className = 'history-group';
    group.innerHTML = `<div class="history-date">${dateFormatted}</div>`;
    items.forEach(h => {
      const user = getUserById(h.user);
      const time = h.completedAt ? new Date(h.completedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '--';
      const hi = document.createElement('div');
      hi.className = 'history-item';
      hi.innerHTML = `
        ${h.proofUrl
          ? `<img src="${h.proofUrl}" class="hi-thumb" alt="foto">`
          : `<div class="hi-thumb" style="background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:18px">${getTaskIcon(h.task)}</div>`}
        <div class="hi-info">
          <div class="hi-name">${h.task}</div>
          <div class="hi-meta">${user?.emoji || '👤'} ${user?.name || h.user} · ${time}</div>
        </div>
        <span class="hi-badge">✓ Feito</span>
      `;
      group.appendChild(hi);
    });
    list.appendChild(group);
  });
}

// ─── MEDALS ───

function renderMedals() {
  renderRanking();
  renderMedalsList();
}

function renderRanking() {
  const lb   = getLeaderboard();
  const max  = lb[0]?.count || 1;
  const list = document.getElementById('rankingList');
  const posClass = ['gold','silver','bronze'];
  const posEmoji = ['🥇','🥈','🥉'];
  list.innerHTML = lb.map((u, i) => `
    <div class="ranking-item">
      <div class="ranking-pos ${posClass[i] || ''}">${posEmoji[i] || (i+1)}</div>
      <div style="width:40px;height:40px;border-radius:12px;background:${u.color}22;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${u.emoji}</div>
      <div class="ranking-info">
        <div class="ranking-name">${u.name}</div>
        <div class="ranking-pts">${u.count} tarefa${u.count !== 1 ? 's' : ''} concluídas</div>
      </div>
      <div style="flex:1;min-width:60px">
        <div class="progress-bar" style="margin:0">
          <div class="progress-fill" style="width:${max ? Math.round((u.count/max)*100) : 0}%"></div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderMedalsList() {
  const stats = currentUser ? getUserStats(currentUser.id) : { total: 0, photos: 0 };
  const grid  = document.getElementById('medalsList');
  const earned = m => {
    if (m.id === 'first'   && stats.total  >= 1)  return true;
    if (m.id === 'clean10' && stats.total  >= 10) return true;
    if (m.id === 'photo'   && stats.photos >= 5)  return true;
    return false;
  };
  grid.innerHTML = MEDALS_DEF.map(m => {
    const ok = earned(m);
    return `
      <div class="medal-card" style="${ok ? '' : 'opacity:0.4;filter:grayscale(1)'}">
        <div class="medal-icon">${m.icon}</div>
        <div class="medal-info">
          <div class="medal-name">${m.name}</div>
          <div class="medal-desc">${m.desc}</div>
          <div class="medal-count">${ok ? '✓ Conquistado' : 'Bloqueado'}</div>
        </div>
      </div>
    `;
  }).join('');
}

function bindMedalTabs() {
  document.querySelectorAll('#screen-medals .tab-bar .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.tab-bar').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('rankingTab').style.display = btn.dataset.tab === 'ranking' ? '' : 'none';
      document.getElementById('medalsTab').style.display  = btn.dataset.tab === 'medals'  ? '' : 'none';
    });
  });
}

// ─── CONFIG TABS ───

function bindConfigTabs() {
  const tabBar = document.querySelector('#screen-config .tab-bar');
  if (!tabBar) return;
  tabBar.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      ['add-schedule','add-today','schedule-view'].forEach(id => {
        const el = document.getElementById(`tab-${id}`);
        if (el) el.style.display = id === btn.dataset.tab ? '' : 'none';
      });
      if (btn.dataset.tab === 'schedule-view') renderScheduleView();
    });
  });
}

function populateUserSelects() {
  ['sUser','tUser'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = USERS.map(u => `<option value="${u.id}">${u.emoji} ${u.name}</option>`).join('');
  });
}

function bindForms() {
  const fSched = document.getElementById('formAddSchedule');
  if (fSched) {
    fSched.addEventListener('submit', e => {
      e.preventDefault();
      const dia  = document.getElementById('sDia').value;
      const nome = document.getElementById('sNome').value.trim();
      const user = document.getElementById('sUser').value;
      const hora = document.getElementById('sHora').value;
      if (!dia || !nome || !user) return;
      addToCustomSchedule({ weekday: dia, task: nome, user, time: hora });
      showToast(`"${nome}" adicionada à escala de ${dia}!`, 'success');
      fSched.reset();
    });
  }

  const fToday = document.getElementById('formAddToday');
  if (fToday) {
    fToday.addEventListener('submit', e => {
      e.preventDefault();
      const nome = document.getElementById('tNome').value.trim();
      const user = document.getElementById('tUser').value;
      const hora = document.getElementById('tHora').value;
      if (!nome || !user) return;
      addExtraTaskToday({ task: nome, user, time: hora });
      showToast(`"${nome}" adicionada ao dia de hoje!`, 'success');
      fToday.reset();
      if (currentScreen === 'home') renderDashboard();
    });
  }
}

function renderScheduleView() {
  const container = document.getElementById('scheduleViewList');
  if (!container) return;
  const weekdays = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const custom   = getCustomSchedule();

  container.innerHTML = weekdays.map(day => {
    const base  = WEEKLY_SCHEDULE[day] || [];
    const extra = custom[day] || [];
    const all   = [...base.map(t => ({...t, custom:false})), ...extra];
    const rows  = all.map(t => {
      const user = getUserById(t.user);
      return `
        <div class="history-item">
          <div style="width:36px;height:36px;border-radius:8px;background:${user?.color||'#888'}22;display:flex;align-items:center;justify-content:center;font-size:18px">${getTaskIcon(t.task)}</div>
          <div class="hi-info">
            <div class="hi-name">${t.task} ${t.custom ? '<span class="chip purple" style="font-size:0.6rem">extra</span>' : ''}</div>
            <div class="hi-meta">${user?.emoji||'👤'} ${user?.name||t.user} · ⏰ ${t.time}</div>
          </div>
        </div>
      `;
    }).join('');
    return `
      <div class="history-group">
        <div class="history-date">${day.charAt(0).toUpperCase() + day.slice(1)}</div>
        ${rows || '<p style="color:var(--text3);font-size:0.8rem;padding:8px">Nenhuma tarefa</p>'}
      </div>
    `;
  }).join('');
}

// ─── TOAST ───

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ─── NOTIFICATIONS ───

function requestNotificationPermission() {
  if (!('Notification' in window)) { showToast('Notificações não suportadas', 'error'); return; }
  Notification.requestPermission().then(p => {
    if (p === 'granted') showToast('Notificações ativas! 🔔', 'success');
    else showToast('Permissão negada', 'error');
  });
}

function scheduleNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now   = new Date();
  const times = [ { h:8, m:0, label:'Tarefas da manhã pendentes!' }, { h:18, m:0, label:'Verifique suas tarefas da tarde!' }, { h:21, m:0, label:'Confira as tarefas da noite!' } ];
  times.forEach(({ h, m, label }) => {
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target - now;
    if (diff > 0) setTimeout(() => new Notification('CasaClean 🏠', { body: label, icon: '/icon-192.png' }), diff);
  });
}

// ─── DEBUG ───

function clearTodayData() {
  if (!confirm('Limpar dados de hoje? (para debug)')) return;
  clearTodayData_storage();
  renderDashboard();
  showToast('Dados de hoje limpos', 'info');
}
