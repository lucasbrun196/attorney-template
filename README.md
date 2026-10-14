# Rodrigues & Silva Advogados — template de landing page

Site estático (HTML, CSS e JS puros, sem build). Os dados são fictícios, feitos para demonstração.

## Rodar localmente

```bash
python -m http.server 5510
```

Depois abra http://localhost:5510

## Estrutura

- `index.html`: todo o conteúdo (textos, sócios, áreas, publicações, FAQ)
- `css/style.css`: as cores ficam em `:root` (`--gold`, `--ink`, `--paper`…)
- `js/main.js`: animações, menu, acordeões, depoimentos e o formulário de demonstração (não envia dados)
- `assets/img/`: foto do escritório, logo completa e monograma com fundo transparente

## Personalizar para um cliente

- **Fotos dos sócios:** coloque `<img src="..." alt="...">` dentro de cada `.person__photo`; as iniciais somem sozinhas.
- **Formulário:** troque o `setTimeout` em `js/main.js` por um `fetch` para o seu backend ou serviço de formulários.
- **WhatsApp:** altere o número no link `wa.me` no fim do `index.html`.
