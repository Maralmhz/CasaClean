# 🏠 CasaClean

> App de gestão de tarefas domésticas — mobile-first, PWA, com painel admin completo.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/Repo-GitHub-181717?logo=github)](https://github.com/Maralmhz/CasaClean)

---

## ✨ Features

- 📅 **Escala semanal** — tarefas geradas automaticamente por dia
- ✅ **Checklist diário** — com responsável, horário e prazo
- ⏰ **Prazos configuráveis** — lixo manhã até 07:30, louça até 20:00, jantar até 23:59
- 📷 **Foto obrigatória** — não é possível concluir sem comprovante
- ⚠️ **Tarefas atrasadas** — destaque laranja para tarefas fora do prazo
- 📋 **Histórico** — tudo registrado com data, hora e foto
- 🏆 **Ranking & Medalhas** — gamificação para engajamento
- 👑 **Painel Admin** — Douglas pode trocar PINs, editar prazos e ver escala completa
- ➕ **Adicionar tarefas** — extra só para hoje
- 🔔 **Notificações** — lembretes nos horários críticos
- 📱 **PWA** — instalável no celular, funciona offline

---

## 👥 Usuários

| Nome    | PIN  | Papel   | Obs                     |
|---------|------|---------|-------------------------|
| Douglas | 1234 | Admin   | Vê e edita tudo         |
| Isadora | 2345 | Morador | —                       |
| Arthur  | 3456 | Morador | —                       |
| Ícaro   | 4567 | Morador | —                       |
| Dayane  | 5678 | Jantar  | Apenas tarefa de jantar |

> ⚠️ Altere os PINs pelo painel admin dentro do app.

---

## ⏰ Prazos padrão

| Tarefa            | Prazo  |
|-------------------|--------|
| Colocar lixo      | 07:30  |
| Lixo manhã        | 07:30  |
| Varrer casa       | 11:59  |
| Banheiro          | 11:59  |
| Quintal           | 11:59  |
| Louça             | 20:00  |
| Lixo noite        | 22:00  |
| Jantar            | 23:59  |

Todos editáveis pelo admin em **Config → ⏰ Prazos**.

---

## 🗂️ Estrutura

```
CasaClean/
├── index.html
├── style.css
├── app.js
├── data.js
├── storage.js
├── sw.js
├── manifest.webmanifest
└── vercel.json
```

---

## 🚀 Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `CasaClean`
3. Framework: **Other** — deixe build e output vazios
4. Clique em **Deploy**

---

## 🛠️ Desenvolvimento local

```bash
npx serve .
# ou
python3 -m http.server 3000
```
