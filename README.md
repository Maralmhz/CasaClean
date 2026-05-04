# CasaClean

> App de tarefas domésticas com escala semanal, PIN por usuário, medalhas e PWA

## Sobre

O **CasaClean** é um aplicativo web responsivo para gestão de tarefas domésticas. Nele, cada membro da família vê suas tarefas do dia, marca como concluído com foto obrigatória e acompanha seu desempenho por meio de medalhas. Todos veem o dashboard geral, mas cada usuário só pode concluir as próprias tarefas — isso ajuda na cobrança saudável entre todos.

## Funcionalidades

- **Login por PIN** – Cada usuário seleciona seu nome e digita um PIN de 4 dígitos para acessar.
- **Dashboard do dia** – Mostra todas as tarefas do dia, status (pendente/concluído), responsável e horário sugerido.
- **Checklist com foto obrigatória** – Não é possível concluir tarefa sem anexar foto como comprovação.
- **Todos veem tudo, cada um só mexe no seu** – Transparência total, responsabilidade individual.
- **Tarefas extras** – Douglas e Dayane (admins) podem adicionar tarefas extras no dia.
- **Reset diário automático** – A cada novo dia, o checklist é recriado com base na escala semanal fixa.
- **Histórico** – Registro de todas as tarefas concluídas, com data, responsável e foto.
- **Notificações** – Alertas de tarefas pendentes em horários estratégicos (manhã, tarde, noite).
- **Sistema de medalhas** – Conquistas por desempenho (dia perfeito, semana completa, horário certo, etc.).
- **PWA** – Instalável no celular, funciona offline e dispara notificações push.
- **Escuro/Claro** – Tema visual adaptável.

## Usuários

| Nome | Papel | PIN |
|------|-------|-----|
| Douglas | Admin | 1234 |
| Dayane | Admin | 7890 |
| Isadora | Usuário | 5678 |
| Arthur | Usuário | 9012 |
| Ícaro | Usuário | 3456 |

> **Obs:** Douglas e Dayane são os únicos que podem alterar o PIN de qualquer usuário em caso de esquecimento.

## Tarefas fixas

- Louça (inclui fogão + mesa + organização)
- Varrer casa
- Lixo manhã
- Lixo noite
- Banheiro
- Quintal (sábado)
- Colocar lixo pra fora (terça, quinta, sábado)

## Estrutura de arquivos

```
CasaClean/
├── index.html          # Estrutura principal + telas
├── style.css           # Estilos mobile-first (dark/light)
├── data.js             # Escala semanal, usuários, tarefas fixas
├── storage.js          # Persistência (localStorage + Supabase-ready)
├── app.js              # Lógica principal (PIN, dashboard, checklist, histórico, medalhas)
├── manifest.webmanifest # PWA manifest
├── sw.js               # Service Worker para cache e offline
├── README.md           # Este arquivo
└── public/
    └── icons/          # Ícones do PWA
```

## Estrutura de telas

- **Login (PIN)** – Bolinhas com nomes dos usuários + teclado numérico de 4 dígitos.
- **/ (Dashboard)** – Tarefas do dia, status, responsável, foto, botão concluir.
- **/historico** – Histórico de todas as execuções, com filtros por usuário.
- **/medalhas** – Medalhas conquistadas por cada usuário.
- **/config** – Configurações (admin): alterar PINs, adicionar tarefas extras.

## Stack

- **Frontend:** HTML5, CSS3, JavaScript puro (sem frameworks)
- **Persistência (Fase 1):** localStorage
- **Persistência (Fase 2):** Supabase (PostgreSQL + Storage)
- **Deploy:** GitHub Pages → Vercel
- **PWA:** Service Worker + manifest.webmanifest

## Roadmap

- [x] Estrutura inicial do repositório
- [x] README com documentação
- [ ] Tela de login por PIN com bolinhas
- [ ] Dashboard do dia com checklist
- [ ] Upload de foto obrigatório para conclusão
- [ ] Histórico de execuções
- [ ] Sistema de medalhas
- [ ] Notificações de tarefas pendentes
- [ ] Integração com Supabase (backend real)
- [ ] Deploy na Vercel

## Licença

MIT

---
Desenvolvido por Maralmhz
