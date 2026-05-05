# 🏠 CasaClean

> App de gestão de tarefas domésticas — mobile-first, PWA, sem dependências.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/Repo-GitHub-181717?logo=github)](https://github.com/Maralmhz/CasaClean)

---

## ✨ Features

- 📅 **Escala semanal fixa** — tarefas geradas automaticamente por dia da semana
- ✅ **Checklist diário** — cada tarefa tem responsável, horário e status
- 📷 **Foto obrigatória** — não é possível concluir sem comprovante
- 📋 **Histórico completo** — tudo registrado com data, hora e foto
- 🏆 **Ranking & Medalhas** — gamificação para engajamento
- ➕ **Adicionar tarefas** — na escala semanal ou só no dia de hoje
- 🔔 **Notificações** — lembretes em horários fixos
- 📱 **PWA** — instalável no celular, funciona offline
- 🔒 **PIN por usuário** — cada morador tem acesso individual

---

## 👥 Usuários

| Nome     | PIN  | Papel  | Obs                     |
|----------|------|--------|-------------------------|
| Douglas  | 1234 | Admin  | Vê e edita tudo         |
| Isadora  | 2345 | Morador| —                       |
| Arthur   | 3456 | Morador| —                       |
| Ícaro    | 4567 | Morador| —                       |
| Dayane   | 5678 | Jantar | Apenas tarefa de jantar |

> ⚠️ Altere os PINs em `data.js` antes de publicar.

---

## 📋 Tarefas fixas na escala

- 🍽️ Louça (fogão + mesa + organização)
- 🧹 Varrer casa
- 🌅 Lixo manhã
- 🌙 Lixo noite
- 🚿 Banheiro
- 🌿 Quintal (sábado)
- 🗑️ Colocar lixo pra fora (terça, quinta, sábado)
- 🍲 Jantar (Dayane — todos os dias)

---

## 🗂️ Estrutura

```
CasaClean/
├── index.html          # UI completa (login, dashboard, histórico, medalhas, config)
├── style.css           # Design system dark, mobile-first
├── app.js              # Lógica principal
├── data.js             # Usuários, escala semanal, ícones, medalhas
├── storage.js          # Persistência localStorage + Supabase-ready
├── sw.js               # Service Worker (PWA/offline)
└── manifest.webmanifest
```

---

## 🚀 Deploy

### Vercel (recomendado)

1. Importe este repositório no [Vercel](https://vercel.com/new)
2. Framework: **Other** (site estático)
3. Build command: *(deixe vazio)*
4. Output dir: *(deixe vazio ou `.`)*
5. Clique em **Deploy**

Pronto — qualquer `git push` na `main` faz deploy automático.

---

## 🗄️ Próxima fase: Supabase

Tabelas previstas:

```sql
profiles          -- usuários da casa
weekly_schedule   -- escala semanal no banco
task_runs         -- execuções diárias
notifications_log -- log de notificações
```

Bucket: `task-proofs/{date}/{id}.jpg`

---

## 🛠️ Desenvolvimento local

```bash
# Qualquer servidor estático funciona
npx serve .
# ou
python3 -m http.server 3000
```

Abra `http://localhost:3000`
