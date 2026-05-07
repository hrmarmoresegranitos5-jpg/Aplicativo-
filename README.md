# HR Mármores e Granitos — Sistema de Gestão

## Estrutura de Arquivos

```
hr-marmores/
├── index.html          ← Página principal (HTML + carrega todos os JS)
├── styles.css          ← Todo o CSS (estilos, animações, layout)
├── manifest.json       ← PWA manifest (já existente)
├── sw.js               ← Service Worker (já existente)
├── icon-192.png        ← Ícone do app (já existente)
└── js/
    ├── data.js         ← Dados: imagens cubas (base64), DB, SYNC Supabase, DEF_*
    ├── app.js          ← Init, layout engine, navegação, dispatch de eventos
    ├── orcamento.js    ← Material, ambientes, serviços, cálculo do orçamento
    ├── pdf-agenda.js   ← Geração de PDF, agenda (salvar, renderizar, jobs)
    ├── financas.js     ← Finanças (lançamentos, saldo, custos fixos)
    ├── catalogos.js    ← Catálogo pedras/cubas/acessórios, empresa, config
    ├── historico.js    ← Histórico de orçamentos (filtro, editar, copiar)
    ├── contrato.js     ← Geração de contrato PDF completo
    └── pwa.js          ← PWA install, service worker, micro-interactions
```

## Ordem de carregamento (importante)

Os scripts são carregados nesta ordem no `index.html`:

1. `data.js` — precisa ser o primeiro (define CUBA_IMGS, DB, CFG, SYNC, DEF_*)
2. `app.js` — init geral, depende de data.js
3. `orcamento.js` — depende de app.js e data.js
4. `pdf-agenda.js` — depende de orcamento.js
5. `financas.js` — independente, só precisa de DB
6. `catalogos.js` — depende de CFG
7. `historico.js` — depende de DB
8. `contrato.js` — depende de pendQ e CFG
9. `pwa.js` — independente, último a carregar

## Como editar cada módulo

| O que quer editar | Arquivo |
|---|---|
| Estilo/layout/cores | `styles.css` |
| Preços padrão das pedras | `js/data.js` → `DEF_STONES` |
| Preços padrão dos serviços | `js/data.js` → `DEF_SV` |
| Dados das cubas de cozinha | `js/data.js` → `DEF_COZ` |
| Dados das cubas de banheiro | `js/data.js` → `DEF_LAV` |
| Dados da empresa | `js/data.js` → `DEF_EMP` |
| Sync Supabase | `js/data.js` → `SYNC` |
| Navegação entre páginas | `js/app.js` → `go()`, `dispatch()` |
| Layout portrait/landscape | `js/app.js` → `setLayout()` |
| Cálculo do orçamento | `js/orcamento.js` → `calcular()` |
| Ambientes e serviços | `js/orcamento.js` → `renderAmbientes()` |
| Geração PDF orçamento | `js/pdf-agenda.js` → `gerarPDF()` |
| Agenda de serviços | `js/pdf-agenda.js` → `renderAg()`, `saveJob()` |
| Finanças e saldo | `js/financas.js` → `renderFin()` |
| Catálogo pedras/cubas | `js/catalogos.js` → `buildCatalog()`, `buildCubaList()` |
| Configurações (edição) | `js/catalogos.js` → `buildCfg()` |
| Histórico de orçamentos | `js/historico.js` → `renderOrc()`, `filterOrc()` |
| Geração de contrato | `js/contrato.js` → `gerarContrato()` |
| PWA e instalação | `js/pwa.js` |
| HTML das páginas/modais | `index.html` |

## GitHub Pages

Para hospedar no GitHub Pages, basta colocar todos os arquivos na raiz do repositório (ou pasta `/docs`) e ativar o GitHub Pages nas configurações do repo.

O arquivo `index.html` já referencia os JS com caminho relativo `js/arquivo.js`, então funciona em qualquer subdiretório.
