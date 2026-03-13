# Backstage Admin — Frontend

> **Stack:** React 18 · Vite · React Router v6 · MapLibre GL (react-map-gl) · react-calendar · react-hot-toast

Painel administrativo para gerenciar **teatros**, **performances** e **sessões**, com visualização geoespacial interativa.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Páginas e rotas](#páginas-e-rotas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Fluxo de uso](#fluxo-de-uso)
- [Comunicação com a API](#comunicação-com-a-api)
- [Build de produção](#build-de-produção)
- [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18+ (recomendado 20+) |
| npm | 9+ |

Verifique:

```bash
node -v
npm -v
```

---

## Instalação e execução

```bash
# Instala dependências
npm install

# Copia variáveis de ambiente
cp .env.example .env   # macOS/Linux
copy .env.example .env  # Windows

# Sobe o servidor de desenvolvimento
npm run dev
# → http://127.0.0.1:5173
```

> O backend precisa estar rodando em paralelo. Veja o README da API.

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | URL base da API FastAPI |

---

## Páginas e rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Home` | Boas-vindas |
| `/theaters` | `TheatersHome` | Lista de teatros |
| `/theaters/new` | `TheaterForm` | Cadastro de novo teatro |
| `/theaters/:id` | `TheaterForm (mode=view)` | Visualização + sessões |
| `/theaters/:id/edit` | `TheaterForm (mode=edit)` | Edição de teatro |
| `/theaters/edit` | `TheatersEditList` | Seleção para edição em massa |
| `/performances` | `PerformancesPage` | Lista de performances com sessões |
| `/performances/:id/edit` | `PerformanceEditPage` | Edição de performance |
| `/map` | `MapGLPage` | Mapa interativo com teatros |

---

## Estrutura de pastas

```
src/
├── api/
│   ├── client.js          # fetch wrapper genérico (GET/POST/PATCH/DELETE)
│   ├── theaters.js        # chamadas específicas de teatros
│   ├── performances.js    # chamadas específicas de performances
│   └── sessions.js        # chamadas específicas de sessões
│
├── components/
│   ├── BackstageNavbar.jsx        # Navegação principal
│   ├── theaters/
│   │   ├── TheaterForm.jsx        # Formulário de criação/edição/view
│   │   └── TheaterManager.jsx     # Lista para edição
│   └── performances/
│       ├── PerformanceForm.jsx    # Formulário multi-step (metadados → sessões → tickets)
│       ├── SessionWizard.jsx      # Criação de sessões (manual ou por recorrência)
│       ├── TicketLinksEditor.jsx  # Links de ingresso por teatro
│       └── CrewEditor.jsx         # Produção técnica (função + pessoas)
│
├── pages/
│   ├── TheatersHome.jsx
│   ├── TheatersEditList.jsx
│   ├── Performances.jsx       # Listagem com painel lateral de sessões
│   ├── PerformanceEdit.jsx    # Edição completa de performance
│   └── MapGl.jsx              # Mapa com marcadores de teatros
│
├── App.jsx     # Roteador principal
└── main.jsx    # Entry point
```

---

## Fluxo de uso

### Cadastrar um teatro

1. Acesse `/theaters/new`
2. Preencha nome, endereço, coordenadas e contatos
3. Opcionalmente adicione foto (base64)
4. Salve → teatro aparece no mapa (`/map`) e nas sessões de performances

### Cadastrar uma performance

1. Acesse `/performances` → botão **"Nova Performance"**
2. **Passo 1 — Metadados:** nome, sinopse, elenco, direção, dramaturgia, crew, classificação, temporada, duração
3. **Passo 2 — Sessões:** crie por recorrência semanal (regras) ou manualmente (lista de datetimes)
4. **Passo 3 — Ingressos:** adicione URL de venda por teatro

### Editar sessions de uma performance existente

- Na listagem `/performances`, clique no card para expandir o painel de sessões
- Adicione novas sessões ou remova individualmente

---

## Comunicação com a API

Toda comunicação passa pelo `api/client.js`:

```js
// Exemplo de uso
import { api } from "./api/client";

const theaters = await api.get("/theaters");
const created  = await api.post("/performances", payload);
await api.del(`/sessions/${id}`);
```

O cliente lança um `Error` com a mensagem do campo `detail` da API em caso de resposta não-2xx.

---

## Build de produção

```bash
npm run build    # gera /dist
npm run preview  # serve /dist localmente em :5174
```

Para deploy, aponte `VITE_API_BASE_URL` para a URL pública da API antes do build.

---

## Troubleshooting

| Problema | Causa provável | Solução |
|---|---|---|
| Tela em branco / erro de rede | API não está rodando | Subir o backend (`uvicorn app.main:app --reload`) |
| `CORS error` no console | Origin não permitida na API | Adicionar `http://localhost:5173` em `CORS_ORIGINS` no `.env` do backend |
| Mapa não carrega | Falta tile provider ou chave | Verificar configuração em `MapGl.jsx` |
| Sessões não aparecem | performance_id inválido | Verificar integridade dos dados no backend |
| Teatro não aparece no select de sessões | Cache desatualizado | Recarregar a página |

---

## Changelog

| Versão | Mudança |
|---|---|
| atual | Mapa MapLibre GL; SessionWizard (recorrência + manual); TicketLinksEditor; CrewEditor; banner upload |
| anterior | Formulários básicos de teatro e performance; listagem simples |
