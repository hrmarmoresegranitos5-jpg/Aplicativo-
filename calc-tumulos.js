// ══════════════════════════════════════════════════════════════════════
// CALC-TUMULOS.JS — Medidas Principais & Cálculo Estrutural Automático
// HR Mármores e Granitos
// ──────────────────────────────────────────────────────────────────────
// Este módulo centraliza as 4 medidas-mestre do túmulo:
//   • Largura (m)
//   • Comprimento (m)
//   • Altura da estrutura base (m)
//   • Quantidade de gavetas
//
// Qualquer alteração nessas medidas propaga automaticamente para:
//   pedras → estrutura civil → materiais → mão de obra → totais
// ══════════════════════════════════════════════════════════════════════

var CALC_TUM = {

  // ──────────────────────────────────────────────────────────────────
  // MEDIDAS PRINCIPAIS (fonte única da verdade)
  // ──────────────────────────────────────────────────────────────────
  medidas: {
    largura:    0.90,   // (m) largura externa do túmulo
    comprimento: 2.20,  // (m) comprimento externo
    altura:     0.40,   // (m) altura da base/estrutura (sem gavetas)
    gavetas:    1,      // quantidade de compartimentos p/ caixão
  },

  // ──────────────────────────────────────────────────────────────────
  // PARÂMETROS CONSTRUTIVOS (editáveis, mas com padrão técnico)
  // ──────────────────────────────────────────────────────────────────
  params: {
    altPorGaveta: 0.70,  // altura por compartimento (m)
    espParede:    0.15,  // espessura das paredes (m)
    espLaje:      0.10,  // espessura da laje de cobertura (m)
    espTampa:     0.03,  // espessura da tampa de granito (m)
    perdaPedra:   15,    // % de perda no corte/polimento
  },

  // ──────────────────────────────────────────────────────────────────
  // RESULTADO DO CÁLCULO (preenchido por calcular())
  // ──────────────────────────────────────────────────────────────────
  resultado: {},
};

// ══════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL — aplica medidas ao TUM.q e recalcula tudo
// ══════════════════════════════════════════════════════════════════════

/**
 * Aplica as medidas principais ao estado global TUM.q e
 * dispara o recálculo completo (pedras, estrutura, materiais, MO).
 *
 * @param {object} [novas] - Objeto com medidas a sobrescrever (opcional).
 *   Ex: { largura: 1.0, gavetas: 2 }
 */
function calcTumAplicar(novas) {
  if (typeof TUM === 'undefined') {
    console.error('[calc-tumulos] TUM não encontrado.');
    return;
  }

  // Mescla novas medidas se fornecidas
  if (novas && typeof novas === 'object') {
    Object.keys(novas).forEach(function(k) {
      if (CALC_TUM.medidas.hasOwnProperty(k)) {
        CALC_TUM.medidas[k] = +novas[k];
      }
    });
  }

  var m = CALC_TUM.medidas;
  var p = CALC_TUM.params;

  // ── Validação básica ─────────────────────────────────────────────
  if (m.largura     <= 0) m.largura     = 0.10;
  if (m.comprimento <= 0) m.comprimento = 0.10;
  if (m.altura      <  0) m.altura      = 0;
  if (m.gavetas     <  0) m.gavetas     = 0;
  m.gavetas = Math.min(m.gavetas, 8); // máximo 8 gavetas

  // ── Propaga para TUM.q.dims ──────────────────────────────────────
  TUM.q.dims.larg      = m.largura;
  TUM.q.dims.comp      = m.comprimento;
  TUM.q.dims.altEst    = m.altura;
  TUM.q.dims.espParede = p.espParede;
  TUM.q.dims.espLaje   = p.espLaje;
  TUM.q.dims.espTampa  = p.espTampa;

  // ── Propaga gavetas ──────────────────────────────────────────────
  TUM.q.gavetas     = m.gavetas;
  TUM.q.altPorGaveta = p.altPorGaveta;
  TUM.q.perda        = p.perdaPedra;

  // ── Reseta flags manuais para recalcular tudo ────────────────────
  _calcTumResetFlags();

  // ── Dispara o pipeline de cálculo estrutural ─────────────────────
  CALC_TUM.resultado = calcTumEstrutura();

  // ── Atualiza a engine principal do app ───────────────────────────
  if (typeof _tumAutoCalc === 'function') _tumAutoCalc();
  if (typeof _tumCalc     === 'function') TUM.calc = _tumCalc();

  // ── Re-renderiza a interface ─────────────────────────────────────
  if (typeof _tumRenderTab === 'function') _tumRenderTab();
  var hv = document.querySelector('.tum-hero-val');
  if (hv && TUM.calc) {
    hv.textContent = TUM.calc.venda > 0 ? 'R$ ' + fm(TUM.calc.venda) : '—';
  }

  return CALC_TUM.resultado;
}

// ══════════════════════════════════════════════════════════════════════
// CÁLCULO ESTRUTURAL — derivado das 4 medidas principais
// ══════════════════════════════════════════════════════════════════════

/**
 * Calcula todas as quantidades estruturais a partir das
 * medidas principais. Retorna um objeto completo com todas as
 * dimensões, áreas e volumes derivados.
 */
function calcTumEstrutura() {
  var m   = CALC_TUM.medidas;
  var p   = CALC_TUM.params;

  var C   = m.comprimento;    // comprimento externo (m)
  var L   = m.largura;        // largura externa (m)
  var H   = m.altura;         // altura da base/estrutura (m)
  var G   = m.gavetas;        // quantidade de gavetas
  var ag  = p.altPorGaveta;   // altura por gaveta (m)
  var ep  = p.espParede;      // espessura de parede (m)
  var el  = p.espLaje;        // espessura de laje (m)
  var et  = p.espTampa;       // espessura de tampa (m)

  // ── Alturas derivadas ────────────────────────────────────────────
  var altGavetas = G * ag;              // altura do bloco de gavetas
  var altTotal   = H + altGavetas + el + et; // altura total da estrutura

  // ── Dimensões internas ───────────────────────────────────────────
  var Ci = _r2(C - 2 * ep);            // comprimento interno livre
  var Li = _r2(L - 2 * ep);            // largura interna livre

  // ── Perímetro ────────────────────────────────────────────────────
  var perim = _r2((C + L) * 2);        // perímetro externo (m)

  // ══════════════════════════════════════════════════════════════════
  // PEÇAS DE PEDRA — áreas em m²
  // ══════════════════════════════════════════════════════════════════
  var pedras = {
    tampa:      _r2(C * L),                          // face superior
    laterais:   _r2(C * altTotal * 2),               // 2 faces longas
    frente:     _r2(L * altTotal),                   // face frontal
    fundo:      _r2(L * altTotal),                   // face do fundo
    lapide:     _r2(0.60 * 0.40),                    // lápide padrão
    revestExt:  _r2((C * 2 + L * 2) * altTotal),    // revestimento completo
    moldura_ml: _r2(perim),                          // moldura em metros lineares
    pingadeira_ml: _r2(perim),                       // pingadeira em metros lineares
  };

  // Total líquido de pedra (peças ativas padrão: tampa + laterais + frente)
  var m2Liq   = _r2(pedras.tampa + pedras.laterais + pedras.frente);
  var m2Total = _r2(m2Liq * (1 + p.perdaPedra / 100));

  // ══════════════════════════════════════════════════════════════════
  // ESTRUTURA CIVIL
  // ══════════════════════════════════════════════════════════════════
  var estrutura = {
    // Fundação: laje de concreto com 20 cm de espessura sob toda a base
    fundacao_m3: _r2(C * L * 0.20),

    // Paredes/alvenaria: área total das faces externas × altura total
    paredes_m2:  _r2((C * 2 + L * 2) * altTotal),

    // Laje armada de cobertura
    laje_m2:     _r2(C * L),

    // Ferragem: base proporcional à área + reforço por gaveta
    reforco_kg:  _r2(C * L * 8 + G * 15),

    // Concreto armado: laje + septos das gavetas
    concreto_m3: _r2(C * L * el + G * 0.12),

    // Volume total bruto (usado em materiais)
    volTotal:    _r2(C * L * altTotal),

    // Área de alvenaria p/ estimativa de argamassa
    areaAlv:     _r2(C * L * 2 + C * altTotal * 2 + L * altTotal * 2),
  };

  // ══════════════════════════════════════════════════════════════════
  // MATERIAIS DE CONSTRUÇÃO — quantidades automáticas
  // ══════════════════════════════════════════════════════════════════
  var vol = estrutura.volTotal;

  var materiais = {
    cimento_sc:    Math.ceil(vol * 6),                    // sc 50kg
    areia_m3:      _r2(vol * 0.06),
    brita_m3:      _r2(vol * 0.04),
    argamassa_sc:  Math.ceil(estrutura.areaAlv / 8),      // ~8m² por sc
    cola_sc:       Math.ceil(pedras.tampa + pedras.laterais + pedras.frente),
    rejunte_kg:    _r2((pedras.tampa + pedras.laterais) * 0.50),
    ferro_kg:      estrutura.reforco_kg,
    tijolos_un:    G > 0 ? Math.ceil(Ci * Li * G * 13) : 0, // ~13 blocos/m²
  };

  // ══════════════════════════════════════════════════════════════════
  // MÃO DE OBRA — dias baseados em gavetas e complexidade
  // ══════════════════════════════════════════════════════════════════
  // Regra: 1 dia base (simples) + 1 dia por gaveta para pedreiro/ajudante
  var diasPedreiro   = Math.max(1, 1 + G);
  var diasAjudante   = diasPedreiro;
  var diasMarmorista = Math.max(1, 1 + Math.floor(G / 2));

  var mdo = {
    pedreiro_dias:   diasPedreiro,
    ajudante_dias:   diasAjudante,
    marmorista_dias: diasMarmorista,
    prazoTotal_dias: diasPedreiro + diasMarmorista,
  };

  // ══════════════════════════════════════════════════════════════════
  // RESULTADO CONSOLIDADO
  // ══════════════════════════════════════════════════════════════════
  return {
    // Medidas de entrada
    largura:       L,
    comprimento:   C,
    alturaBase:    H,
    gavetas:       G,

    // Alturas
    altPorGaveta:  ag,
    altGavetas:    altGavetas,
    altTotal:      _r2(altTotal),

    // Dimensões internas
    compInterno:   Ci,
    largInterno:   Li,

    // Perímetro
    perimetro:     perim,

    // Pedras
    pedras:        pedras,
    m2Liq:         m2Liq,
    m2Total:       m2Total,

    // Estrutura civil
    estrutura:     estrutura,

    // Materiais
    materiais:     materiais,

    // Mão de obra
    mdo:           mdo,
  };
}

// ══════════════════════════════════════════════════════════════════════
// SETTERS INDIVIDUAIS — atualizam 1 medida e propagam tudo
// ══════════════════════════════════════════════════════════════════════

/** Define a largura (m) e recalcula. */
function calcTumLargura(v) {
  calcTumAplicar({ largura: +v });
}

/** Define o comprimento (m) e recalcula. */
function calcTumComprimento(v) {
  calcTumAplicar({ comprimento: +v });
}

/** Define a altura da base/estrutura (m) e recalcula. */
function calcTumAltura(v) {
  calcTumAplicar({ altura: +v });
}

/** Define a quantidade de gavetas e recalcula. */
function calcTumGavetas(n) {
  calcTumAplicar({ gavetas: Math.max(0, Math.min(8, Math.round(+n))) });
}

// ══════════════════════════════════════════════════════════════════════
// SINCRONIZADOR — lê TUM.q e sincroniza CALC_TUM.medidas
// ══════════════════════════════════════════════════════════════════════

/**
 * Lê as dimensões atuais do TUM.q e sincroniza com CALC_TUM.medidas.
 * Útil para manter consistência quando o app carrega dados salvos.
 */
function calcTumSync() {
  if (typeof TUM === 'undefined') return;
  CALC_TUM.medidas.largura      = TUM.q.dims.larg    || CALC_TUM.medidas.largura;
  CALC_TUM.medidas.comprimento  = TUM.q.dims.comp    || CALC_TUM.medidas.comprimento;
  CALC_TUM.medidas.altura       = TUM.q.dims.altEst  || CALC_TUM.medidas.altura;
  CALC_TUM.medidas.gavetas      = TUM.q.gavetas      != null ? TUM.q.gavetas : CALC_TUM.medidas.gavetas;
  CALC_TUM.params.altPorGaveta  = TUM.q.altPorGaveta || CALC_TUM.params.altPorGaveta;
  CALC_TUM.params.espParede     = TUM.q.dims.espParede || CALC_TUM.params.espParede;
  CALC_TUM.params.espLaje       = TUM.q.dims.espLaje   || CALC_TUM.params.espLaje;
  CALC_TUM.params.espTampa      = TUM.q.dims.espTampa  || CALC_TUM.params.espTampa;
  CALC_TUM.params.perdaPedra    = TUM.q.perda           || CALC_TUM.params.perdaPedra;
  CALC_TUM.resultado = calcTumEstrutura();
}

// ══════════════════════════════════════════════════════════════════════
// RENDER — painel de medidas principais (injeta no DOM)
// ══════════════════════════════════════════════════════════════════════

/**
 * Gera o HTML do painel de medidas principais.
 * Pode ser embutido em qualquer aba do TUM (ex: aba Projeto).
 */
function calcTumPainelHTML() {
  var m = CALC_TUM.medidas;
  var p = CALC_TUM.params;
  var r = CALC_TUM.resultado;

  // Altura total calculada para exibição
  var altTotal = m.altura + m.gavetas * p.altPorGaveta + p.espLaje + p.espTampa;

  var h = '';

  // ── Cabeçalho ─────────────────────────────────────────────────────
  h += '<div class="ctum-painel">';
  h += '<div class="ctum-header">';
  h += '<span class="ctum-icon">📐</span>';
  h += '<div>';
  h += '<div class="ctum-title">Medidas Principais</div>';
  h += '<div class="ctum-sub">Controlam todo o cálculo estrutural automaticamente</div>';
  h += '</div>';
  h += '</div>';

  // ── 4 campos de medida ────────────────────────────────────────────
  h += '<div class="ctum-grid4">';

  // Largura
  h += '<div class="ctum-campo">';
  h += '<label class="ctum-lbl">📏 Largura</label>';
  h += '<div class="ctum-input-wrap">';
  h += '<input class="ctum-in" type="number" step="0.05" min="0.30" max="5.00" ';
  h += 'value="' + m.largura + '" ';
  h += 'onchange="calcTumLargura(this.value)">';
  h += '<span class="ctum-unid">m</span>';
  h += '</div>';
  h += '<div class="ctum-hint">Lateral do túmulo</div>';
  h += '</div>';

  // Comprimento
  h += '<div class="ctum-campo">';
  h += '<label class="ctum-lbl">📏 Comprimento</label>';
  h += '<div class="ctum-input-wrap">';
  h += '<input class="ctum-in" type="number" step="0.05" min="0.50" max="10.00" ';
  h += 'value="' + m.comprimento + '" ';
  h += 'onchange="calcTumComprimento(this.value)">';
  h += '<span class="ctum-unid">m</span>';
  h += '</div>';
  h += '<div class="ctum-hint">Frente ao fundo</div>';
  h += '</div>';

  // Altura da base
  h += '<div class="ctum-campo">';
  h += '<label class="ctum-lbl">📐 Altura Base</label>';
  h += '<div class="ctum-input-wrap">';
  h += '<input class="ctum-in" type="number" step="0.05" min="0.10" max="2.00" ';
  h += 'value="' + m.altura + '" ';
  h += 'onchange="calcTumAltura(this.value)">';
  h += '<span class="ctum-unid">m</span>';
  h += '</div>';
  h += '<div class="ctum-hint">Sem gavetas</div>';
  h += '</div>';

  // Gavetas — controle +/−
  h += '<div class="ctum-campo">';
  h += '<label class="ctum-lbl">⬛ Gavetas</label>';
  h += '<div class="ctum-gav-ctrl">';
  h += '<button class="ctum-gav-btn" onclick="calcTumGavetas(' + Math.max(0, m.gavetas - 1) + ')">−</button>';
  h += '<div class="ctum-gav-num">' + m.gavetas + '</div>';
  h += '<button class="ctum-gav-btn" onclick="calcTumGavetas(' + (m.gavetas + 1) + ')">+</button>';
  h += '</div>';
  h += '<div class="ctum-hint">' + (m.gavetas === 0 ? 'sem compart.' : m.gavetas + ' caixão' + (m.gavetas > 1 ? 'ões' : '')) + '</div>';
  h += '</div>';

  h += '</div>'; // ctum-grid4

  // ── Altura total calculada ────────────────────────────────────────
  h += '<div class="ctum-alt-result">';
  h += '<div class="ctum-alt-label">Altura total calculada</div>';
  h += '<div class="ctum-alt-value">' + altTotal.toFixed(2) + ' m</div>';
  h += '<div class="ctum-alt-formula">';
  h += 'base ' + m.altura.toFixed(2) + 'm';
  if (m.gavetas > 0) h += ' + ' + m.gavetas + '×' + p.altPorGaveta.toFixed(2) + 'm (gavetas)';
  h += ' + laje ' + p.espLaje.toFixed(2) + 'm + tampa ' + p.espTampa.toFixed(2) + 'm';
  h += '</div>';
  h += '</div>';

  // ── Resumo estrutural derivado ────────────────────────────────────
  if (r && r.pedras) {
    h += '<div class="ctum-resumo">';
    h += '<div class="ctum-resumo-title">Quantidades derivadas das medidas</div>';
    h += '<div class="ctum-resumo-grid">';

    h += _ctumR('Tampa', _r2(r.pedras.tampa) + ' m²');
    h += _ctumR('Laterais (×2)', _r2(r.pedras.laterais) + ' m²');
    h += _ctumR('Frente', _r2(r.pedras.frente) + ' m²');
    h += _ctumR('Pedra líquida', r.m2Liq + ' m²');
    h += _ctumR('Pedra c/ ' + p.perdaPedra + '% perda', r.m2Total + ' m²');

    h += _ctumR('Fundação', r.estrutura.fundacao_m3 + ' m³');
    h += _ctumR('Alvenaria', r.estrutura.paredes_m2 + ' m²');
    h += _ctumR('Laje', r.estrutura.laje_m2 + ' m²');
    h += _ctumR('Ferragem', r.estrutura.reforco_kg + ' kg');
    h += _ctumR('Concreto armado', r.estrutura.concreto_m3 + ' m³');

    h += _ctumR('Cimento', r.materiais.cimento_sc + ' sc');
    h += _ctumR('Areia', r.materiais.areia_m3 + ' m³');
    h += _ctumR('Brita', r.materiais.brita_m3 + ' m³');
    h += _ctumR('Ferro', r.materiais.ferro_kg + ' kg');

    h += _ctumR('Pedreiro', r.mdo.pedreiro_dias + ' dias');
    h += _ctumR('Marmorista', r.mdo.marmorista_dias + ' dias');
    h += _ctumR('Prazo total', r.mdo.prazoTotal_dias + ' dias úteis');

    h += '</div>';
    h += '</div>';
  }

  h += '</div>'; // ctum-painel
  return h;
}

// ══════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO — sobrescreve _tabProjeto para incluir o painel
// ══════════════════════════════════════════════════════════════════════

/**
 * Patch na aba Projeto: injeta o painel de medidas principais
 * logo após a seção de dimensões existente.
 * Chame calcTumPatch() UMA vez após carregar calc-tumulos.js.
 */
function calcTumPatch() {
  if (typeof _tabProjeto !== 'function') return;

  // Guarda referência à função original
  var _tabProjetoOrig = _tabProjeto;

  // Sobrescreve com versão que injeta o painel
  _tabProjeto = function() {
    // Sincroniza medidas do CALC_TUM com o estado atual do TUM.q
    calcTumSync();

    var html = _tabProjetoOrig();

    // Injeta painel de medidas logo após o início da aba
    // (antes da seção de dimensões existente)
    var inject = calcTumPainelHTML();

    // Insere antes do bloco de dimensões original (marcador "📐 Dimensões")
    var marker = 'tum-sec-lbl" style="margin-top:16px;">📐 Dimensões';
    if (html.indexOf(marker) > -1) {
      html = html.replace(
        '<div class="' + marker,
        inject + '<div class="' + marker
      );
    } else {
      // Fallback: injeta no início do body da aba
      html = html.replace('<div class="tum-sec">', '<div class="tum-sec">' + inject);
    }

    return html;
  };
}

// ══════════════════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ══════════════════════════════════════════════════════════════════════

function _r2(v) { return Math.round(v * 100) / 100; }

function _ctumR(label, val) {
  return '<div class="ctum-r-row">' +
    '<span class="ctum-r-l">' + label + '</span>' +
    '<span class="ctum-r-v">' + val  + '</span>' +
    '</div>';
}

function _calcTumResetFlags() {
  if (typeof TUM === 'undefined') return;

  // Reseta flags manuais de pedras
  if (TUM.q.pedras) {
    Object.keys(TUM.q.pedras).forEach(function(k) {
      delete TUM.q.pedras[k]._manual;
      delete TUM.q.pedras[k]._ml_manual;
    });
  }

  // Reseta flags manuais de estrutura
  if (TUM.q.estrutura) {
    Object.keys(TUM.q.estrutura).forEach(function(k) {
      delete TUM.q.estrutura[k]._manual;
    });
  }

  // Reseta flags manuais de materiais
  if (TUM.q.mat) {
    Object.keys(TUM.q.mat).forEach(function(k) {
      delete TUM.q.mat[k]._manual;
    });
  }

  // Reseta MO
  if (TUM.q.mdo) {
    ['pedreiro', 'ajudante', 'marmorista'].forEach(function(k) {
      if (TUM.q.mdo[k]) delete TUM.q.mdo[k]._manual;
    });
  }
}

// ══════════════════════════════════════════════════════════════════════
// CSS DO PAINEL DE MEDIDAS PRINCIPAIS
// ══════════════════════════════════════════════════════════════════════
(function _injectCalcTumCSS() {
  var s = document.createElement('style');
  s.id  = 'calc-tum-css';
  if (document.getElementById('calc-tum-css')) return; // evita duplicata
  s.textContent = `

    /* ── PAINEL PRINCIPAL ── */
    .ctum-painel {
      background: linear-gradient(135deg, rgba(201,168,76,.06), rgba(201,168,76,.02));
      border: 1.5px solid rgba(201,168,76,.35);
      border-radius: 16px;
      padding: 14px;
      margin-bottom: 16px;
    }

    /* ── CABEÇALHO ── */
    .ctum-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .ctum-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .ctum-title {
      font-size: .76rem;
      font-weight: 800;
      color: var(--gold2);
      letter-spacing: .3px;
    }
    .ctum-sub {
      font-size: .58rem;
      color: var(--t4);
      margin-top: 2px;
      line-height: 1.4;
    }

    /* ── GRID DOS 4 CAMPOS ── */
    .ctum-grid4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    @media (max-width: 500px) {
      .ctum-grid4 { grid-template-columns: 1fr 1fr; }
    }

    /* ── CAMPO ── */
    .ctum-campo {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ctum-lbl {
      font-size: .54rem;
      letter-spacing: .8px;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 700;
    }
    .ctum-input-wrap {
      position: relative;
    }
    .ctum-in {
      width: 100%;
      box-sizing: border-box;
      background: var(--s2);
      border: 1.5px solid rgba(201,168,76,.4);
      border-radius: 10px;
      padding: 10px 32px 10px 10px;
      color: var(--tx);
      font-family: Outfit, sans-serif;
      font-size: .88rem;
      font-weight: 700;
      outline: none;
      transition: border-color .15s;
    }
    .ctum-in:focus {
      border-color: var(--gold);
      background: rgba(201,168,76,.05);
    }
    .ctum-unid {
      position: absolute;
      right: 9px;
      top: 50%;
      transform: translateY(-50%);
      font-size: .62rem;
      color: var(--gold3);
      font-weight: 600;
      pointer-events: none;
    }
    .ctum-hint {
      font-size: .54rem;
      color: var(--t4);
      text-align: center;
    }

    /* ── CONTROLE DE GAVETAS ── */
    .ctum-gav-ctrl {
      display: flex;
      align-items: center;
      background: var(--s2);
      border: 1.5px solid rgba(201,168,76,.4);
      border-radius: 10px;
      overflow: hidden;
    }
    .ctum-gav-btn {
      flex-shrink: 0;
      width: 34px;
      height: 38px;
      background: rgba(201,168,76,.1);
      border: none;
      color: var(--gold2);
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      font-family: Outfit, sans-serif;
      transition: background .12s;
    }
    .ctum-gav-btn:active { background: rgba(201,168,76,.25); }
    .ctum-gav-num {
      flex: 1;
      text-align: center;
      font-size: 1.05rem;
      font-weight: 900;
      color: var(--gold2);
      font-family: Outfit, sans-serif;
      line-height: 38px;
    }

    /* ── RESULTADO DE ALTURA ── */
    .ctum-alt-result {
      background: rgba(201,168,76,.07);
      border: 1px solid rgba(201,168,76,.25);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ctum-alt-label {
      font-size: .58rem;
      color: var(--t4);
      text-transform: uppercase;
      letter-spacing: .8px;
      flex-shrink: 0;
    }
    .ctum-alt-value {
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--gold2);
      flex-shrink: 0;
    }
    .ctum-alt-formula {
      font-size: .56rem;
      color: var(--t4);
      line-height: 1.5;
      flex: 1;
    }

    /* ── RESUMO DERIVADO ── */
    .ctum-resumo {
      background: var(--s2);
      border: 1px solid var(--bd2);
      border-radius: 10px;
      padding: 10px 12px;
      margin-top: 4px;
    }
    .ctum-resumo-title {
      font-size: .56rem;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: var(--t4);
      margin-bottom: 8px;
    }
    .ctum-resumo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2px;
    }
    @media (max-width: 400px) {
      .ctum-resumo-grid { grid-template-columns: 1fr 1fr; }
    }
    .ctum-r-row {
      display: flex;
      flex-direction: column;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(255,255,255,.02);
    }
    .ctum-r-l {
      font-size: .52rem;
      color: var(--t4);
      margin-bottom: 2px;
    }
    .ctum-r-v {
      font-size: .68rem;
      font-weight: 700;
      color: var(--t2);
    }
  `;
  document.head.appendChild(s);
})();

// ══════════════════════════════════════════════════════════════════════
// AUTO-INIT — sincroniza e aplica patch assim que o script carrega
// ══════════════════════════════════════════════════════════════════════
(function _calcTumInit() {
  function _tryInit() {
    if (typeof TUM === 'undefined' || typeof _tabProjeto === 'undefined') {
      // TUM ou _tabProjeto ainda não carregaram; aguarda 150ms
      setTimeout(_tryInit, 150);
      return;
    }
    calcTumSync();    // sincroniza medidas com TUM.q atual
    calcTumPatch();   // injeta painel na aba Projeto
  }
  _tryInit();
})();
