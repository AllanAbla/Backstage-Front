# Backstage Admin (Frontend)

Painel simples em **React + Vite** para cadastrar:
- **Teatros** (theaters)
- **Performances** (espetáculos), com **banner base64**, **crew** (produção técnica) e **múltiplas sessões** por teatro e horário.

> Backend esperado: a API que você já tem rodando em `FastAPI + MongoDB`, com as rotas:
> - `POST /theaters`, `GET /theaters`
> - `POST /performances`, `GET /performances`
>
> Garanta que o CORS está habilitado no backend (veja a seção **Backend / CORS** abaixo).

---

## Sumário
- [Pré-requisitos](#pré-requisitos)
- [Backend / CORS](#backend--cors)
- [Configuração (.env)](#configuração-env)
- [Rodando o projeto](#rodando-o-projeto)
- [Build e Preview](#build-e-preview)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como usar (fluxo)](#como-usar-fluxo)
- [Campos e validações](#campos-e-validações)
- [Erros comuns (Troubleshooting)](#erros-comuns-troubleshooting)
- [Proxy opcional (sem CORS)](#proxy-opcional-sem-cors)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Pré-requisitos
- **Node.js 18+** (recomendado 20+)
- **npm** (ou **pnpm**/**yarn**, adapte os comandos)
- Backend rodando (ver abaixo)

Verifique:
```bash
node -v
npm -v


## Configuração
Crie o arquivo .env na raiz do front (copie do exemplo):
cp .env.example .env


Ajuste o valor para apontar para sua API em desenvolvimento ou produção.

Rodando o projeto
Instale as dependências e suba o dev server:
npm install
npm run dev
# abra http://127.0.0.1:5173


Se preferir outro host/porta, ajuste no vite.config.js e/ou .env.
Build e Preview

Gerar build de produção e visualizar localmente:
npm run build
npm run preview
# (abre em http://127.0.0.1:5174 por padrão)