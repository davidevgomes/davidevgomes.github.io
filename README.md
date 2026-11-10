# Portfólio — Davi Gomes Araújo

Site pessoal em React, Three.js (React Three Fiber) e GSAP, com trilha e efeitos sonoros gerados via Web Audio API.

## Rodar

```bash
npm install
npm run dev
```

## Editar

- Textos, links e projetos: `src/data/site.js`
- Coreografia do objeto 3D por seção: `src/lib/poses.js`
- Som (trilha e efeitos): `src/audio/engine.js`
- `?debug` na URL pula a tela de carregamento.

## Publicar

Cada `git push` na `main` compila e publica no GitHub Pages (`.github/workflows/deploy.yml`).

As imagens originais ficam em `assets-src/` (fora do repositório). `npm run capture` e `npm run assets` regeram `public/img`.