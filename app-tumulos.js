// ══════════════════════════════════════════════════════════════════════
// MÓDULO TÚMULOS — Sistema Profissional de Orçamento Funerário
// HR Mármores e Granitos ERP v5
// Cobertura: pedras, mão de obra, pedreiro, materiais, margem, resumo
// ══════════════════════════════════════════════════════════════════════

var TUM = {

  // ── Estado atual do orçamento ──────────────────────────────────────
  q: {
    cli:'', falecido:'', cemiterio:'', quadra:'', lote:'',
    tipo:'simples',
    stoneId: null, stonePrice: 0,
    dims:{ comp:2.20, larg:0.90, alt:0.60, esp:3, gavetas:1 },

    pedras:{
      tampa:    { on:true,  qty:1,  m2:0, extra:0  },
      detalhe:  { on:false, qty:1,  m2:0, extra:0  },
      laterais: { on:true,  qty:2,  m2:0, extra:0  },
      frontais: { on:true,  qty:2,  m2:0, extra:0  },
      base:     { on:true,  qty:1,  m2:0, extra:0  },
      gavetas:  { on:false, qty:1,  m2:0, extra:0  },
      moldura:  { on:false, ml:0,   vlrMl:120, extra:0 },
      pingadeira:{ on:false,ml:0,   vlrMl:80,  extra:0 },
      sainha:   { on:false, qty:1,  m2:0, extra:0  },
      recortes: { on:false, qty:0,  vlrUn:80   },
      perda:    15
    },

    mdo:{
      marmorista:  { on:true,  horas:8,  diaria:400 },
      ajudante:    { on:true,  horas:8,  diaria:220 },
      instalacao:  { on:true,  vlr:350  },
      acabamento:  { on:true,  vlr:200  },
      montagem:    { on:false, vlr:300  },
      transporte:  { on:true,  vlr:150  },
      riscoQuebra: { on:true,  perc:3   },
      dificuldade: { on:false, perc:0   }
    },

    obra:{
      fundacao:    { on:true,  dias:1, diaria:350, equipe:1 },
      levantamento:{ on:false, dias:1, diaria:350, equipe:1 },
      reboco:      { on:false, dias:1, diaria:350, equipe:1 },
      contraPiso:  { on:false, dias:1, diaria:350, equipe:1 },
      gavetas:     { on:false, dias:1, diaria:350, equipe:1 },
      concreto:    { on:false, dias:1, diaria:350, equipe:1 },
      acabOb:      { on:false, dias:1, diaria:350, equipe:1 }
    },

    mat:{
      cimento:  { on:true,  qty:0, preco:38,  unid:'sc'  },
      areia:    { on:true,  qty:0, preco:200, unid:'m³'  },
      brita:    { on:false, qty:0, preco:220, unid:'m³'  },
      ferro:    { on:false, qty:0, preco:14,  unid:'kg'  },
      tijolos:  { on:false, qty:0, preco:1.20,unid:'un'  },
      blocos:   { on:false, qty:0, preco:5.50,unid:'un'  },
      massa:    { on:true,  qty:0, preco:32,  unid:'sc'  },
      cola:     { on:true,  qty:0, preco:48,  unid:'sc'  },
      rejunte:  { on:true,  qty:0, preco:14,  unid:'kg'  },
      agua:     { on:false, vlr:0  },
      frete:    { on:true,  vlr:0  }
    },

    margem: 40,
    desconto: 0,
    obs: ''
  },

  calc: {},   // resultado dos cálculos

  // ── Presets por tipo de túmulo ─────────────────────────────────────
  TIPOS: {
    simples: {
      label:'Túmulo Simples', icon:'⬛',
      desc:'Tampa + laterais + frontais + base básica',
      dims:{ comp:2.20, larg:0.90, alt:0.60, esp:3, gavetas:1 },
      pedras:['tampa','laterais','frontais','base'],
      mdo:['marmorista','ajudante','instalacao','acabamento','transporte','riscoQuebra'],
      obra:['fundacao'],
      mat:['cimento','areia','massa','cola','rejunte'],
      diasMdo:2, diasObra:2, tempoTotal:4
    },
    gaveta_dupla: {
      label:'Gaveta Dupla', icon:'📦',
      desc:'2 compartimentos de enterramento, estrutura elevada',
      dims:{ comp:2.20, larg:0.90, alt:1.20, esp:3, gavetas:2 },
      pedras:['tampa','laterais','frontais','gavetas','base'],
      mdo:['marmorista','ajudante','instalacao','acabamento','montagem','transporte','riscoQuebra'],
      obra:['fundacao','levantamento','reboco','gavetas'],
      mat:['cimento','areia','brita','tijolos','massa','cola','rejunte'],
      diasMdo:4, diasObra:5, tempoTotal:9
    },
    gaveta_tripla: {
      label:'Gaveta Tripla', icon:'🗃️',
      desc:'3 compartimentos, estrutura reforçada com concreto',
      dims:{ comp:2.40, larg:0.90, alt:1.80, esp:3, gavetas:3 },
      pedras:['tampa','laterais','frontais','gavetas','base','moldura'],
      mdo:['marmorista','ajudante','instalacao','acabamento','montagem','transporte','riscoQuebra','dificuldade'],
      obra:['fundacao','levantamento','reboco','gavetas','concreto'],
      mat:['cimento','areia','brita','ferro','tijolos','blocos','massa','cola','rejunte'],
      diasMdo:6, diasObra:7, tempoTotal:13
    },
    capela: {
      label:'Capela / Monumento', icon:'⛪',
      desc:'Estrutura monumental com cobertura, paredes e acabamento completo',
      dims:{ comp:2.60, larg:1.60, alt:2.20, esp:3, gavetas:2 },
      pedras:['tampa','detalhe','laterais','frontais','gavetas','base','moldura','pingadeira','sainha'],
      mdo:['marmorista','ajudante','instalacao','acabamento','montagem','transporte','riscoQuebra','dificuldade'],
      obra:['fundacao','levantamento','reboco','contraPiso','gavetas','concreto','acabOb'],
      mat:['cimento','areia','brita','ferro','tijolos','blocos','massa','cola','rejunte','agua','frete'],
      diasMdo:12, diasObra:15, tempoTotal:27
    },
    revestimento: {
      label:'Revestimento / Reforma Pedra', icon:'🪨',
      desc:'Somente pedra — reveste estrutura existente',
      dims:{ comp:2.20, larg:0.90, alt:0.80, esp:2, gavetas:1 },
      pedras:['tampa','laterais','frontais','moldura','recortes'],
      mdo:['marmorista','ajudante','acabamento','transporte','riscoQuebra'],
      obra:[],
      mat:['cola','rejunte'],
      diasMdo:2, diasObra:0, tempoTotal:2
    },
    reforma: {
      label:'Reforma Completa', icon:'🔧',
      desc:'Substituição de pedras + reparos estruturais',
      dims:{ comp:2.20, larg:0.90, alt:0.80, esp:3, gavetas:1 },
      pedras:['tampa','laterais','frontais','base'],
      mdo:['marmorista','ajudante','instalacao','acabamento','transporte','riscoQuebra'],
      obra:['fundacao','reboco'],
      mat:['cimento','areia','massa','cola','rejunte'],
      diasMdo:3, diasObra:2, tempoTotal:5
    },
    jazigo: {
      label:'Jazigo Completo', icon:'🏛️',
      desc:'Jazigo familiar com múltiplas gavetas, estrutura completa',
      dims:{ comp:3.00, larg:2.00, alt:2.40, esp:4, gavetas:4 },
      pedras:['tampa','detalhe','laterais','frontais','gavetas','base','moldura','pingadeira','sainha'],
      mdo:['marmorista','ajudante','instalacao','acabamento','montagem','transporte','riscoQuebra','dificuldade'],
      obra:['fundacao','levantamento','reboco','contraPiso','gavetas','concreto','acabOb'],
      mat:['cimento','areia','brita','ferro','tijolos','blocos','massa','cola','rejunte','agua','frete'],
      diasMdo:16, diasObra:20, tempoTotal:36
    }
  },

  PEDRA_LABELS: {
    tampa:'Tampa', detalhe:'Detalhe Superior', laterais:'Laterais (×2)',
    frontais:'Frontais (×2)', base:'Base', gavetas:'Frentes de Gaveta',
    moldura:'Moldura (ml)', pingadeira:'Pingadeira (ml)',
    sainha:'Sainha', recortes:'Recortes / Furos', perda:'% Perda'
  },

  MDO_LABELS: {
    marmorista:'Marmorista', ajudante:'Ajudante', instalacao:'Instalação',
    acabamento:'Acabamento', montagem:'Montagem', transporte:'Transporte',
    riscoQuebra:'Risco de Quebra (%)', dificuldade:'Dificuldade (%)'
  },

  OBRA_LABELS: {
    fundacao:'Fundação', levantamento:'Levantamento de Alvenaria',
    reboco:'Reboco / Chapisco', contraPiso:'Contra-piso',
    gavetas:'Gavetas (estrutura)', concreto:'Concreto Armado', acabOb:'Acabamento Final'
  },

  MAT_LABELS: {
    cimento:'Cimento', areia:'Areia', brita:'Brita', ferro:'Ferro / Tela',
    tijolos:'Tijolos', blocos:'Blocos de Concreto', massa:'Massa Pronta',
    cola:'Cola p/ Granito', rejunte:'Rejunte', agua:'Água (caminhão)',
    frete:'Frete / Entrega'
  }
};

// ══════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ══════════════════════════════════════════════════════════════════════
function tumInit() {
  renderTum();
}

function renderTum() {
  var pg = document.getElementById('pg9');
  if (!pg) return;
  tumAutoCalcDims();
  tumAutoMatQty();
  var res = tumCalc();
  TUM.calc = res;

  pg.innerHTML =
    _tumHero() +
    _tumTabs() +
    '<div id="tumBody"></div>' +
    '<div style="height:80px;"></div>';

  _tumRenderTab();
}

// ══════════════════════════════════════════════════════════════════════
// HERO + TABS
// ══════════════════════════════════════════════════════════════════════
function _tumHero() {
  var q = TUM.q;
  var res = TUM.calc;
  var vf = res.venda || 0;
  return '<div class="tum-hero">' +
    '<div class="tum-hero-row">' +
    '<div>' +
    '<div class="tum-hero-title">⚰️ Orçamento Funerário</div>' +
    '<div class="tum-hero-sub">' + (TUM.TIPOS[q.tipo] ? TUM.TIPOS[q.tipo].label : '') + '</div>' +
    '</div>' +
    '<div class="tum-hero-val">' + (vf > 0 ? 'R$ ' + fm(vf) : '—') + '</div>' +
    '</div>' +
    '</div>';
}

var _tumTab = 'cliente';
function _tumTabs() {
  var tabs = [
    { k:'cliente',  i:'👤', l:'Cliente' },
    { k:'pedras',   i:'🪨', l:'Pedras' },
    { k:'mdo',      i:'🔨', l:'Mão Obra' },
    { k:'obra',     i:'🧱', l:'Pedreiro' },
    { k:'mat',      i:'🪣', l:'Materiais' },
    { k:'resumo',   i:'💰', l:'Resumo' }
  ];
  var h = '<div class="tum-tabs">';
  tabs.forEach(function(t) {
    h += '<div class="tum-tab' + (_tumTab===t.k?' on':'') + '" onclick="tumTab(\''+t.k+'\')">' +
      '<span>' + t.i + '</span><span>' + t.l + '</span>' +
      '</div>';
  });
  h += '</div>';
  return h;
}

function tumTab(t) {
  _tumTab = t;
  renderTum();
}

function _tumRenderTab() {
  var body = document.getElementById('tumBody');
  if (!body) return;
  if (_tumTab === 'cliente') body.innerHTML = _tumCliente();
  else if (_tumTab === 'pedras')  body.innerHTML = _tumPedras();
  else if (_tumTab === 'mdo')     body.innerHTML = _tumMdo();
  else if (_tumTab === 'obra')    body.innerHTML = _tumObra();
  else if (_tumTab === 'mat')     body.innerHTML = _tumMat();
  else if (_tumTab === 'resumo')  body.innerHTML = _tumResumo();
}

// ══════════════════════════════════════════════════════════════════════
// ABA CLIENTE + TIPO + DIMENSÕES
// ══════════════════════════════════════════════════════════════════════
function _tumCliente() {
  var q = TUM.q;
  var h = '<div class="tum-sec">';

  // Client info
  h += '<div class="tum-sec-lbl">👤 Identificação</div>';
  h += '<div class="tum-grid2">';
  h += _tumInput('text', 'Cliente / Contratante', q.cli, "tumSet('cli',this.value)", 'Família Oliveira...');
  h += _tumInput('text', 'Falecido', q.falecido, "tumSet('falecido',this.value)", 'Nome do falecido');
  h += _tumInput('text', 'Cemitério', q.cemiterio, "tumSet('cemiterio',this.value)", 'Ex: Cemitério Municipal');
  h += _tumInput('text', 'Quadra / Lote', q.quadra||q.lote, "tumSet('quadra',this.value)", 'Q04 L15');
  h += '</div>';

  // Tomb type selector
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">⚰️ Tipo de Serviço</div>';
  h += '<div class="tum-tipos-grid">';
  Object.keys(TUM.TIPOS).forEach(function(k) {
    var t = TUM.TIPOS[k];
    h += '<div class="tum-tipo-card' + (q.tipo===k?' on':'') + '" onclick="tumSetTipo(\''+k+'\')">' +
      '<div class="tum-tipo-icon">' + t.icon + '</div>' +
      '<div class="tum-tipo-label">' + t.label + '</div>' +
      '<div class="tum-tipo-desc">' + t.desc + '</div>' +
      '</div>';
  });
  h += '</div>';

  // Dimensions
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">📐 Dimensionamento</div>';
  h += '<div class="tum-grid3">';
  h += _tumDimInput('Comprimento (m)', 'comp', q.dims.comp, 'Ex: 2.20');
  h += _tumDimInput('Largura (m)',     'larg', q.dims.larg, 'Ex: 0.90');
  h += _tumDimInput('Altura (m)',      'alt',  q.dims.alt,  'Ex: 0.60');
  h += _tumDimInput('Espessura pedra (cm)', 'esp', q.dims.esp, 'Ex: 3');
  h += _tumDimInput('Nº de Gavetas',   'gavetas', q.dims.gavetas, 'Ex: 1');
  h += '</div>';

  // Auto area preview
  var c = q.dims.comp, l = q.dims.larg, a = q.dims.alt;
  var m2tampa   = c * l;
  var m2laterais= c * a * 2;
  var m2frontais= l * a * 2;
  var m2total   = m2tampa + m2laterais + m2frontais + (c * l); // + base
  var perda = q.pedras.perda || 15;
  var m2com = m2total * (1 + perda/100);

  h += '<div class="tum-dims-preview">';
  h += '<div class="tum-dp-title">📏 Prévia de Área (sem molduras e extras)</div>';
  h += '<div class="tum-dp-grid">';
  h += _dpItem('Tampa', fm(m2tampa) + ' m²');
  h += _dpItem('Laterais (×2)', fm(m2laterais) + ' m²');
  h += _dpItem('Frontais (×2)', fm(m2frontais) + ' m²');
  h += _dpItem('Base', fm(c * l) + ' m²');
  h += _dpItem('TOTAL', fm(m2total) + ' m²');
  h += _dpItem('c/ ' + perda + '% perda', fm(m2com) + ' m²');
  h += '</div></div>';

  // Stone picker
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">🪨 Pedra Selecionada</div>';
  h += '<div class="tum-stone-row">';
  var sel = q.stoneId ? (CFG && CFG.stones ? CFG.stones.find(function(s){return s.id===q.stoneId;}) : null) : null;
  if (sel) {
    h += '<div class="tum-stone-sel">' +
      '<div class="tum-stone-nm">' + sel.nm + '</div>' +
      '<div class="tum-stone-pr">R$ ' + fm(sel.pr) + '/m²</div>' +
      '</div>';
  } else {
    h += '<div class="tum-stone-empty">Nenhuma pedra selecionada</div>';
  }
  h += '<button class="btn btn-o" style="font-size:.7rem;" onclick="tumOpenStonePick()">Escolher Pedra</button>';
  h += '</div>';

  // Perda
  h += '<div class="tum-sec-lbl" style="margin-top:12px;">Perda / Desperdício (%)</div>';
  h += '<input class="tum-in" type="number" value="' + perda + '" min="5" max="40" ' +
    'onchange="TUM.q.pedras.perda=+this.value;tumRecalc()" style="max-width:100px;">';

  h += '<div class="tum-nav-row">';
  h += '<button class="btn btn-g" onclick="tumTab(\'pedras\')">Próximo: Pedras →</button>';
  h += '</div>';

  h += '</div>';
  return h;
}

function _tumInput(type, label, val, onchange, ph) {
  return '<div class="tum-f">' +
    '<label class="tum-lbl">' + label + '</label>' +
    '<input class="tum-in" type="' + type + '" value="' + (val||'') + '" placeholder="' + (ph||'') + '" onchange="' + onchange + '"></div>';
}
function _tumDimInput(label, key, val, ph) {
  return '<div class="tum-f">' +
    '<label class="tum-lbl">' + label + '</label>' +
    '<input class="tum-in" type="number" step="0.01" value="' + val + '" placeholder="' + ph + '" ' +
    'onchange="tumSetDim(\'' + key + '\',+this.value)"></div>';
}
function _dpItem(label, val) {
  return '<div class="tum-dp-item"><span class="tum-dp-l">' + label + '</span>' +
    '<span class="tum-dp-v">' + val + '</span></div>';
}

// ══════════════════════════════════════════════════════════════════════
// ABA PEDRAS — detalhamento de peças
// ══════════════════════════════════════════════════════════════════════
function _tumPedras() {
  var q = TUM.q;
  var p = q.pedras;
  var dims = q.dims;
  var stonePrice = q.stonePrice || 0;
  var sel = q.stoneId ? (CFG && CFG.stones ? CFG.stones.find(function(s){return s.id===q.stoneId;}) : null) : null;
  if (sel) stonePrice = sel.pr;

  var h = '<div class="tum-sec">';
  h += '<div class="tum-sec-lbl">🪨 Peças de Pedra</div>';

  if (!stonePrice) {
    h += '<div class="tum-warn">⚠️ Selecione uma pedra na aba Cliente para ver os valores.</div>';
  }

  var items = ['tampa','detalhe','laterais','frontais','base','gavetas','sainha'];
  var totalM2 = 0;
  var totalPedra = 0;

  h += '<div class="tum-peca-list">';
  items.forEach(function(k) {
    var peca = p[k];
    if (!peca) return;
    var label = TUM.PEDRA_LABELS[k];
    var m2 = peca.m2 || 0;
    var custo = m2 * stonePrice;
    if (peca.on) { totalM2 += m2; totalPedra += custo; }

    h += '<div class="tum-peca-row' + (peca.on?'':' tum-peca-off') + '">';
    h += '<div class="tum-peca-header">';
    h += '<label class="tum-tog"><input type="checkbox"' + (peca.on?' checked':'') +
      ' onchange="tumTogPeca(\'' + k + '\',this.checked)"><span class="tum-tog-slider"></span></label>';
    h += '<div class="tum-peca-label">' + label + '</div>';
    if (peca.on) {
      h += '<div class="tum-peca-val">' + fm(m2) + ' m²' + (stonePrice?'  =  R$ '+fm(custo):'') + '</div>';
    }
    h += '</div>';

    if (peca.on) {
      h += '<div class="tum-peca-detail">';
      h += '<div class="tum-grid3">';
      h += '<div class="tum-f"><label class="tum-lbl">Área (m²)</label>' +
        '<input class="tum-in" type="number" step="0.01" value="' + m2 + '" ' +
        'onchange="tumSetPeca(\'' + k + '\',\'m2\',+this.value)"></div>';
      h += '<div class="tum-f"><label class="tum-lbl">Qtd peças</label>' +
        '<input class="tum-in" type="number" min="1" value="' + (peca.qty||1) + '" ' +
        'onchange="tumSetPeca(\'' + k + '\',\'qty\',+this.value)"></div>';
      h += '<div class="tum-f"><label class="tum-lbl">Acréscimo R$</label>' +
        '<input class="tum-in" type="number" min="0" value="' + (peca.extra||0) + '" ' +
        'onchange="tumSetPeca(\'' + k + '\',\'extra\',+this.value)"></div>';
      h += '</div></div>';
    }
    h += '</div>';
  });

  // Moldura
  var mol = p.moldura;
  var m2moldura = (mol.ml || 0) * 0.12;
  var custoMoldura = mol.on ? m2moldura * stonePrice : 0;
  if (mol.on) { totalM2 += m2moldura; totalPedra += custoMoldura; }

  h += '<div class="tum-peca-row' + (mol.on?'':' tum-peca-off') + '">';
  h += '<div class="tum-peca-header">';
  h += '<label class="tum-tog"><input type="checkbox"' + (mol.on?' checked':'') +
    ' onchange="tumTogPeca(\'moldura\',this.checked)"><span class="tum-tog-slider"></span></label>';
  h += '<div class="tum-peca-label">Moldura (ml)</div>';
  if (mol.on) h += '<div class="tum-peca-val">' + fm(mol.ml) + ' ml' + (stonePrice?'  =  R$ '+fm(custoMoldura):'') + '</div>';
  h += '</div>';
  if (mol.on) {
    h += '<div class="tum-peca-detail"><div class="tum-grid3">';
    h += '<div class="tum-f"><label class="tum-lbl">Metros lineares</label>' +
      '<input class="tum-in" type="number" step="0.01" value="' + (mol.ml||0) + '" onchange="tumSetPecaML(\'moldura\',+this.value)"></div>';
    h += '<div class="tum-f"><label class="tum-lbl">Valor/ml R$</label>' +
      '<input class="tum-in" type="number" value="' + (mol.vlrMl||120) + '" onchange="TUM.q.pedras.moldura.vlrMl=+this.value;tumRecalc()"></div>';
    h += '</div></div>';
  }
  h += '</div>';

  // Pingadeira
  var ping = p.pingadeira;
  var m2ping = (ping.ml || 0) * 0.08;
  var custoPing = ping.on ? m2ping * stonePrice : 0;
  if (ping.on) { totalM2 += m2ping; totalPedra += custoPing; }

  h += '<div class="tum-peca-row' + (ping.on?'':' tum-peca-off') + '">';
  h += '<div class="tum-peca-header">';
  h += '<label class="tum-tog"><input type="checkbox"' + (ping.on?' checked':'') +
    ' onchange="tumTogPeca(\'pingadeira\',this.checked)"><span class="tum-tog-slider"></span></label>';
  h += '<div class="tum-peca-label">Pingadeira (ml)</div>';
  if (ping.on) h += '<div class="tum-peca-val">' + fm(ping.ml) + ' ml' + (stonePrice?'  =  R$ '+fm(custoPing):'') + '</div>';
  h += '</div>';
  if (ping.on) {
    h += '<div class="tum-peca-detail"><div class="tum-grid3">';
    h += '<div class="tum-f"><label class="tum-lbl">Metros lineares</label>' +
      '<input class="tum-in" type="number" step="0.01" value="' + (ping.ml||0) + '" onchange="tumSetPecaML(\'pingadeira\',+this.value)"></div>';
    h += '<div class="tum-f"><label class="tum-lbl">Valor/ml R$</label>' +
      '<input class="tum-in" type="number" value="' + (ping.vlrMl||80) + '" onchange="TUM.q.pedras.pingadeira.vlrMl=+this.value;tumRecalc()"></div>';
    h += '</div></div>';
  }
  h += '</div>';

  // Recortes
  var rec = p.recortes;
  h += '<div class="tum-peca-row' + (rec.on?'':' tum-peca-off') + '">';
  h += '<div class="tum-peca-header">';
  h += '<label class="tum-tog"><input type="checkbox"' + (rec.on?' checked':'') +
    ' onchange="tumTogPeca(\'recortes\',this.checked)"><span class="tum-tog-slider"></span></label>';
  h += '<div class="tum-peca-label">Recortes / Furos</div>';
  if (rec.on) h += '<div class="tum-peca-val">' + (rec.qty||0) + ' un  =  R$ ' + fm((rec.qty||0)*(rec.vlrUn||80)) + '</div>';
  h += '</div>';
  if (rec.on) {
    h += '<div class="tum-peca-detail"><div class="tum-grid3">';
    h += '<div class="tum-f"><label class="tum-lbl">Qtd recortes</label>' +
      '<input class="tum-in" type="number" min="0" value="' + (rec.qty||0) + '" onchange="TUM.q.pedras.recortes.qty=+this.value;tumRecalc()"></div>';
    h += '<div class="tum-f"><label class="tum-lbl">Valor unitário R$</label>' +
      '<input class="tum-in" type="number" value="' + (rec.vlrUn||80) + '" onchange="TUM.q.pedras.recortes.vlrUn=+this.value;tumRecalc()"></div>';
    h += '</div></div>';
  }
  h += '</div>';

  h += '</div>'; // .tum-peca-list

  // Totals
  var m2comPerda = totalM2 * (1 + (p.perda||15)/100);
  var custoComPerda = m2comPerda * stonePrice;
  h += '<div class="tum-total-box">';
  h += '<div class="tum-total-row"><span>Área total líquida</span><span>' + fm(totalM2) + ' m²</span></div>';
  h += '<div class="tum-total-row"><span>Com ' + (p.perda||15) + '% perda</span><span>' + fm(m2comPerda) + ' m²</span></div>';
  if (stonePrice) {
    h += '<div class="tum-total-row tum-total-big"><span>💎 Custo Total Pedra</span><span>R$ ' + fm(custoComPerda) + '</span></div>';
  }
  h += '</div>';

  h += '<div class="tum-nav-row">';
  h += '<button class="btn btn-o" style="font-size:.7rem;" onclick="tumTab(\'cliente\')">← Cliente</button>';
  h += '<button class="btn btn-g" style="font-size:.7rem;" onclick="tumTab(\'mdo\')">Próximo: Mão de Obra →</button>';
  h += '</div>';
  h += '</div>';
  return h;
}

// ══════════════════════════════════════════════════════════════════════
// ABA MÃO DE OBRA
// ══════════════════════════════════════════════════════════════════════
function _tumMdo() {
  var mdo = TUM.q.mdo;
  var h = '<div class="tum-sec">';
  h += '<div class="tum-sec-lbl">🔨 Mão de Obra — Marmorista</div>';
  h += '<div class="tum-peca-list">';

  // Marmorista
  h += _mdoBlock('marmorista', 'Marmorista', mdo.marmorista, true);
  h += _mdoBlock('ajudante', 'Ajudante', mdo.ajudante, true);

  // Fixed values
  ['instalacao','acabamento','montagem','transporte'].forEach(function(k) {
    var item = mdo[k];
    var label = TUM.MDO_LABELS[k];
    h += '<div class="tum-peca-row' + (item.on?'':' tum-peca-off') + '">';
    h += '<div class="tum-peca-header">';
    h += _togHtml('tumTogMdo', k, item.on);
    h += '<div class="tum-peca-label">' + label + '</div>';
    if (item.on) h += '<div class="tum-peca-val">R$ ' + fm(item.vlr||0) + '</div>';
    h += '</div>';
    if (item.on) {
      h += '<div class="tum-peca-detail"><div class="tum-grid3">';
      h += '<div class="tum-f"><label class="tum-lbl">Valor R$</label>' +
        '<input class="tum-in" type="number" min="0" value="' + (item.vlr||0) + '" ' +
        'onchange="TUM.q.mdo.' + k + '.vlr=+this.value;tumRecalc()"></div>';
      h += '</div></div>';
    }
    h += '</div>';
  });

  // Percentages
  ['riscoQuebra','dificuldade'].forEach(function(k) {
    var item = mdo[k];
    var label = TUM.MDO_LABELS[k];
    h += '<div class="tum-peca-row' + (item.on?'':' tum-peca-off') + '">';
    h += '<div class="tum-peca-header">';
    h += _togHtml('tumTogMdo', k, item.on);
    h += '<div class="tum-peca-label">' + label + '</div>';
    if (item.on) h += '<div class="tum-peca-val">' + (item.perc||0) + '%</div>';
    h += '</div>';
    if (item.on) {
      h += '<div class="tum-peca-detail"><div class="tum-grid3">';
      h += '<div class="tum-f"><label class="tum-lbl">Percentual %</label>' +
        '<input class="tum-in" type="number" min="0" max="50" step="0.5" value="' + (item.perc||0) + '" ' +
        'onchange="TUM.q.mdo.' + k + '.perc=+this.value;tumRecalc()"></div>';
      h += '</div></div>';
    }
    h += '</div>';
  });

  h += '</div>';

  // MDO subtotal
  var res = TUM.calc;
  h += '<div class="tum-total-box">';
  h += '<div class="tum-total-row tum-total-big"><span>🔨 Total Mão de Obra</span><span>R$ ' + fm(res.custoMdo || 0) + '</span></div>';
  h += '</div>';

  h += '<div class="tum-nav-row">';
  h += '<button class="btn btn-o" style="font-size:.7rem;" onclick="tumTab(\'pedras\')">← Pedras</button>';
  h += '<button class="btn btn-g" style="font-size:.7rem;" onclick="tumTab(\'obra\')">Próximo: Pedreiro →</button>';
  h += '</div>';
  h += '</div>';
  return h;
}

function _mdoBlock(k, label, item, isHora) {
  var vlr = isHora ? (item.horas||0) * (item.diaria||0) / 8 * (item.horas||0) : (item.vlr||0);
  // Simplified: days = horas/8, daily rate applies
  var dias = Math.ceil((item.horas||0) / 8);
  vlr = dias * (item.diaria||0);
  var h = '<div class="tum-peca-row' + (item.on?'':' tum-peca-off') + '">';
  h += '<div class="tum-peca-header">';
  h += _togHtml('tumTogMdo', k, item.on);
  h += '<div class="tum-peca-label">' + label + '</div>';
  if (item.on) h += '<div class="tum-peca-val">' + item.horas + 'h  =  R$ ' + fm(vlr) + '</div>';
  h += '</div>';
  if (item.on) {
    h += '<div class="tum-peca-detail"><div class="tum-grid3">';
    h += '<div class="tum-f"><label class="tum-lbl">Horas</label>' +
      '<input class="tum-in" type="number" min="0" value="' + (item.horas||0) + '" ' +
      'onchange="TUM.q.mdo.' + k + '.horas=+this.value;tumRecalc()"></div>';
    h += '<div class="tum-f"><label class="tum-lbl">Diária R$</label>' +
      '<input class="tum-in" type="number" min="0" value="' + (item.diaria||0) + '" ' +
      'onchange="TUM.q.mdo.' + k + '.diaria=+this.value;tumRecalc()"></div>';
    h += '</div></div>';
  }
  h += '</div>';
  return h;
}

// ══════════════════════════════════════════════════════════════════════
// ABA PEDREIRO / CONSTRUÇÃO
// ══════════════════════════════════════════════════════════════════════
function _tumObra() {
  var obra = TUM.q.obra;
  var h = '<div class="tum-sec">';
  h += '<div class="tum-sec-lbl">🧱 Serviços de Pedreiro</div>';
  h += '<div class="tum-peca-list">';

  Object.keys(TUM.OBRA_LABELS).forEach(function(k) {
    var item = obra[k];
    if (!item) return;
    var label = TUM.OBRA_LABELS[k];
    var vlr = (item.dias||0) * (item.diaria||350) * (item.equipe||1);
    h += '<div class="tum-peca-row' + (item.on?'':' tum-peca-off') + '">';
    h += '<div class="tum-peca-header">';
    h += _togHtml('tumTogObra', k, item.on);
    h += '<div class="tum-peca-label">' + label + '</div>';
    if (item.on) h += '<div class="tum-peca-val">' + item.dias + 'd × ' + item.equipe + ' pess.  =  R$ ' + fm(vlr) + '</div>';
    h += '</div>';
    if (item.on) {
      h += '<div class="tum-peca-detail"><div class="tum-grid3">';
      h += '<div class="tum-f"><label class="tum-lbl">Dias</label>' +
        '<input class="tum-in" type="number" min="0" step="0.5" value="' + (item.dias||0) + '" ' +
        'onchange="TUM.q.obra.' + k + '.dias=+this.value;tumRecalc()"></div>';
      h += '<div class="tum-f"><label class="tum-lbl">Diária R$</label>' +
        '<input class="tum-in" type="number" min="0" value="' + (item.diaria||350) + '" ' +
        'onchange="TUM.q.obra.' + k + '.diaria=+this.value;tumRecalc()"></div>';
      h += '<div class="tum-f"><label class="tum-lbl">Equipe</label>' +
        '<input class="tum-in" type="number" min="1" value="' + (item.equipe||1) + '" ' +
        'onchange="TUM.q.obra.' + k + '.equipe=+this.value;tumRecalc()"></div>';
      h += '</div></div>';
    }
    h += '</div>';
  });

  h += '</div>';

  var res = TUM.calc;
  h += '<div class="tum-total-box">';
  h += '<div class="tum-total-row tum-total-big"><span>🧱 Total Pedreiro</span><span>R$ ' + fm(res.custoObra || 0) + '</span></div>';
  h += '</div>';

  h += '<div class="tum-nav-row">';
  h += '<button class="btn btn-o" style="font-size:.7rem;" onclick="tumTab(\'mdo\')">← Mão de Obra</button>';
  h += '<button class="btn btn-g" style="font-size:.7rem;" onclick="tumTab(\'mat\')">Próximo: Materiais →</button>';
  h += '</div>';
  h += '</div>';
  return h;
}

// ══════════════════════════════════════════════════════════════════════
// ABA MATERIAIS DE CONSTRUÇÃO
// ══════════════════════════════════════════════════════════════════════
function _tumMat() {
  var mat = TUM.q.mat;
  var h = '<div class="tum-sec">';
  h += '<div class="tum-sec-lbl">🪣 Materiais de Construção</div>';

  // Auto-recalc hint
  h += '<div class="tum-info-box">💡 Quantidades estimadas automaticamente. Ajuste conforme necessário.</div>';
  h += '<div class="tum-peca-list">';

  var fixedKeys = ['cimento','areia','brita','ferro','tijolos','blocos','massa','cola','rejunte'];
  fixedKeys.forEach(function(k) {
    var item = mat[k];
    if (!item) return;
    var label = TUM.MAT_LABELS[k];
    var vlr = (item.qty||0) * (item.preco||0);
    h += '<div class="tum-peca-row' + (item.on?'':' tum-peca-off') + '">';
    h += '<div class="tum-peca-header">';
    h += _togHtml('tumTogMat', k, item.on);
    h += '<div class="tum-peca-label">' + label + '</div>';
    if (item.on) h += '<div class="tum-peca-val">' + fm(item.qty) + ' ' + item.unid + '  =  R$ ' + fm(vlr) + '</div>';
    h += '</div>';
    if (item.on) {
      h += '<div class="tum-peca-detail"><div class="tum-grid3">';
      h += '<div class="tum-f"><label class="tum-lbl">Qtd (' + item.unid + ')</label>' +
        '<input class="tum-in" type="number" min="0" step="0.1" value="' + (item.qty||0) + '" ' +
        'onchange="TUM.q.mat.' + k + '.qty=+this.value;tumRecalc()"></div>';
      h += '<div class="tum-f"><label class="tum-lbl">Preço/' + item.unid + '</label>' +
        '<input class="tum-in" type="number" min="0" step="0.01" value="' + (item.preco||0) + '" ' +
        'onchange="TUM.q.mat.' + k + '.preco=+this.value;tumRecalc()"></div>';
      h += '</div></div>';
    }
    h += '</div>';
  });

  // Água e Frete (valor livre)
  ['agua','frete'].forEach(function(k) {
    var item = mat[k];
    if (!item) return;
    var label = TUM.MAT_LABELS[k];
    h += '<div class="tum-peca-row' + (item.on?'':' tum-peca-off') + '">';
    h += '<div class="tum-peca-header">';
    h += _togHtml('tumTogMat', k, item.on);
    h += '<div class="tum-peca-label">' + label + '</div>';
    if (item.on) h += '<div class="tum-peca-val">R$ ' + fm(item.vlr||0) + '</div>';
    h += '</div>';
    if (item.on) {
      h += '<div class="tum-peca-detail"><div class="tum-grid3">';
      h += '<div class="tum-f"><label class="tum-lbl">Valor R$</label>' +
        '<input class="tum-in" type="number" min="0" value="' + (item.vlr||0) + '" ' +
        'onchange="TUM.q.mat.' + k + '.vlr=+this.value;tumRecalc()"></div>';
      h += '</div></div>';
    }
    h += '</div>';
  });

  h += '</div>';

  var res = TUM.calc;
  h += '<div class="tum-total-box">';
  h += '<div class="tum-total-row tum-total-big"><span>🪣 Total Materiais</span><span>R$ ' + fm(res.custoMat || 0) + '</span></div>';
  h += '</div>';

  h += '<div class="tum-nav-row">';
  h += '<button class="btn btn-o" style="font-size:.7rem;" onclick="tumTab(\'obra\')">← Pedreiro</button>';
  h += '<button class="btn btn-g" style="font-size:.7rem;" onclick="tumTab(\'resumo\')">Ver Resumo →</button>';
  h += '</div>';
  h += '</div>';
  return h;
}

// ══════════════════════════════════════════════════════════════════════
// ABA RESUMO — ORÇAMENTO PROFISSIONAL
// ══════════════════════════════════════════════════════════════════════
function _tumResumo() {
  var q = TUM.q;
  var r = TUM.calc;
  var tipo = TUM.TIPOS[q.tipo] || {};

  var h = '<div class="tum-sec">';

  // Summary cards
  h += '<div class="tum-res-cards">';
  h += _resCard('💎', 'Custo Pedra',       r.custoPedra,  'gold');
  h += _resCard('🔨', 'Mão de Obra',       r.custoMdo,    'blue');
  h += _resCard('🧱', 'Pedreiro',          r.custoObra,   'grn');
  h += _resCard('🪣', 'Materiais',         r.custoMat,    'yel');
  h += _resCard('📦', 'Custo Real Total',  r.custoTotal,  'whi');
  h += '</div>';

  // Margem + Desconto
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">💼 Precificação</div>';
  h += '<div class="tum-prec-box">';
  h += '<div class="tum-grid2">';
  h += '<div class="tum-f"><label class="tum-lbl">Margem de Lucro (%)</label>' +
    '<input class="tum-in" type="number" min="0" max="200" value="' + (q.margem||40) + '" ' +
    'onchange="TUM.q.margem=+this.value;tumRecalc()"></div>';
  h += '<div class="tum-f"><label class="tum-lbl">Desconto R$</label>' +
    '<input class="tum-in" type="number" min="0" value="' + (q.desconto||0) + '" ' +
    'onchange="TUM.q.desconto=+this.value;tumRecalc()"></div>';
  h += '</div>';

  // Price breakdown
  h += '<div class="tum-prec-breakdown">';
  h += '<div class="tum-prec-row"><span>Custo real</span><span>R$ ' + fm(r.custoTotal) + '</span></div>';
  h += '<div class="tum-prec-row"><span>Lucro (' + (q.margem||40) + '%)</span><span class="grn">+ R$ ' + fm(r.lucro) + '</span></div>';
  if (q.desconto > 0) h += '<div class="tum-prec-row"><span>Desconto</span><span class="red">− R$ ' + fm(q.desconto) + '</span></div>';
  h += '<div class="tum-prec-final"><span>💰 VALOR FINAL</span><span>R$ ' + fm(r.venda) + '</span></div>';
  h += '</div></div>';

  // Chronogram
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">📅 Cronograma Estimado</div>';
  h += '<div class="tum-crono">';
  var diasMdo  = tipo.diasMdo  || 0;
  var diasObra = tipo.diasObra || 0;
  var total    = tipo.tempoTotal || (diasMdo + diasObra);
  h += '<div class="tum-crono-row">';
  h += '<div class="tum-crono-item" style="flex:' + (diasObra||1) + '">' +
    '<div class="tum-crono-bar tum-crono-obra"></div>' +
    '<div class="tum-crono-lbl">Construção<br>' + diasObra + ' dias</div>' +
    '</div>';
  h += '<div class="tum-crono-item" style="flex:' + (diasMdo||1) + '">' +
    '<div class="tum-crono-bar tum-crono-mdo"></div>' +
    '<div class="tum-crono-lbl">Marmoraria<br>' + diasMdo + ' dias</div>' +
    '</div>';
  h += '</div>';
  h += '<div class="tum-crono-total">⏱ Prazo total estimado: <strong>' + total + ' dias úteis</strong></div>';
  h += '</div>';

  // Technical summary
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">📋 Resumo Técnico</div>';
  h += '<div class="tum-tech-box">';
  h += _techRow('Tipo', tipo.label || q.tipo);
  h += _techRow('Cliente', q.cli || '—');
  if (q.falecido) h += _techRow('Falecido', q.falecido);
  if (q.cemiterio) h += _techRow('Cemitério', q.cemiterio);
  var sel = q.stoneId ? (CFG && CFG.stones ? CFG.stones.find(function(s){return s.id===q.stoneId;}) : null) : null;
  h += _techRow('Pedra', sel ? sel.nm : 'Não selecionada');
  h += _techRow('Dimensões', q.dims.comp + 'm × ' + q.dims.larg + 'm × ' + q.dims.alt + 'm');
  if (q.dims.gavetas > 0) h += _techRow('Gavetas', q.dims.gavetas + ' compartimento(s)');
  h += _techRow('Espessura', q.dims.esp + ' cm');
  h += _techRow('Área c/ perda', fm(r.m2total) + ' m²');
  h += _techRow('Custo/m² pedra', sel ? 'R$ ' + fm(sel.pr) : '—');
  h += _techRow('Data', new Date().toLocaleDateString('pt-BR'));
  h += '</div>';

  // Obs
  h += '<div class="tum-sec-lbl" style="margin-top:16px;">📝 Observações</div>';
  h += '<textarea class="tum-obs" rows="3" placeholder="Observações técnicas..." onchange="TUM.q.obs=this.value">' + (q.obs||'') + '</textarea>';

  // Action buttons
  h += '<div class="tum-action-btns">';
  h += '<button class="btn btn-g" onclick="tumSalvar()">💾 Salvar Orçamento</button>';
  h += '<button class="btn btn-o" onclick="tumNovo()">🆕 Novo Orçamento</button>';
  h += '</div>';

  h += '</div>';
  return h;
}

function _resCard(icon, label, val, color) {
  return '<div class="tum-res-card">' +
    '<div class="tum-res-icon">' + icon + '</div>' +
    '<div class="tum-res-label">' + label + '</div>' +
    '<div class="tum-res-val ' + (color||'') + '">R$ ' + fm(val||0) + '</div>' +
    '</div>';
}
function _techRow(l, v) {
  return '<div class="tum-tech-row"><span class="tum-tech-l">' + l + '</span><span class="tum-tech-v">' + v + '</span></div>';
}

// ══════════════════════════════════════════════════════════════════════
// CÁLCULO PRINCIPAL
// ══════════════════════════════════════════════════════════════════════
function tumCalc() {
  var q = TUM.q;
  var p = q.pedras;
  var mdo = q.mdo;
  var obra = q.obra;
  var mat = q.mat;
  var dims = q.dims;

  var sel = q.stoneId ? (CFG && CFG.stones ? CFG.stones.find(function(s){return s.id===q.stoneId;}) : null) : null;
  var stPr = sel ? sel.pr : (q.stonePrice || 0);

  // — Custo pedra —
  var m2Liq = 0;
  ['tampa','detalhe','laterais','frontais','base','gavetas','sainha'].forEach(function(k) {
    if (p[k] && p[k].on) m2Liq += (p[k].m2 || 0);
  });
  if (p.moldura && p.moldura.on) m2Liq += (p.moldura.ml || 0) * 0.12;
  if (p.pingadeira && p.pingadeira.on) m2Liq += (p.pingadeira.ml || 0) * 0.08;

  var m2Total = m2Liq * (1 + (p.perda || 15) / 100);
  var custoPedra = m2Total * stPr;
  // Add extras
  ['tampa','detalhe','laterais','frontais','base','gavetas','sainha'].forEach(function(k) {
    if (p[k] && p[k].on) custoPedra += (p[k].extra || 0);
  });
  // Molduras por ml (custom price)
  if (p.moldura && p.moldura.on) custoPedra += (p.moldura.ml || 0) * (p.moldura.vlrMl || 120) - (p.moldura.ml || 0) * 0.12 * stPr;
  if (p.pingadeira && p.pingadeira.on) custoPedra += (p.pingadeira.ml || 0) * (p.pingadeira.vlrMl || 80) - (p.pingadeira.ml || 0) * 0.08 * stPr;
  // Recortes
  if (p.recortes && p.recortes.on) custoPedra += (p.recortes.qty || 0) * (p.recortes.vlrUn || 80);

  // — Custo mão de obra —
  var custoMdo = 0;
  var baseMdo = 0; // for percentage calcs
  if (mdo.marmorista && mdo.marmorista.on) { var d=Math.ceil((mdo.marmorista.horas||0)/8); custoMdo += d*(mdo.marmorista.diaria||400); baseMdo += d*(mdo.marmorista.diaria||400); }
  if (mdo.ajudante && mdo.ajudante.on)    { var d=Math.ceil((mdo.ajudante.horas||0)/8);    custoMdo += d*(mdo.ajudante.diaria||220); }
  if (mdo.instalacao && mdo.instalacao.on) custoMdo += (mdo.instalacao.vlr || 0);
  if (mdo.acabamento && mdo.acabamento.on) custoMdo += (mdo.acabamento.vlr || 0);
  if (mdo.montagem && mdo.montagem.on) custoMdo += (mdo.montagem.vlr || 0);
  if (mdo.transporte && mdo.transporte.on) custoMdo += (mdo.transporte.vlr || 0);
  // Percentages apply over custoPedra
  if (mdo.riscoQuebra && mdo.riscoQuebra.on) custoMdo += custoPedra * (mdo.riscoQuebra.perc || 0) / 100;
  if (mdo.dificuldade && mdo.dificuldade.on) custoMdo += custoPedra * (mdo.dificuldade.perc || 0) / 100;

  // — Custo pedreiro —
  var custoObra = 0;
  Object.keys(obra).forEach(function(k) {
    var item = obra[k];
    if (item && item.on) custoObra += (item.dias||0) * (item.diaria||350) * (item.equipe||1);
  });

  // — Custo materiais —
  var custoMat = 0;
  ['cimento','areia','brita','ferro','tijolos','blocos','massa','cola','rejunte'].forEach(function(k) {
    var item = mat[k];
    if (item && item.on) custoMat += (item.qty||0) * (item.preco||0);
  });
  if (mat.agua && mat.agua.on) custoMat += (mat.agua.vlr || 0);
  if (mat.frete && mat.frete.on) custoMat += (mat.frete.vlr || 0);

  var custoTotal = custoPedra + custoMdo + custoObra + custoMat;
  var lucro  = custoTotal * (q.margem || 40) / 100;
  var venda  = custoTotal + lucro - (q.desconto || 0);
  var margem = custoTotal > 0 ? (lucro / venda * 100) : 0;

  return {
    m2total: m2Total, m2liq: m2Liq,
    custoPedra: custoPedra, custoMdo: custoMdo,
    custoObra: custoObra, custoMat: custoMat,
    custoTotal: custoTotal, lucro: lucro, venda: venda,
    margemReal: margem
  };
}

// ══════════════════════════════════════════════════════════════════════
// AUTO CÁLCULO DE DIMENSÕES → m²
// ══════════════════════════════════════════════════════════════════════
function tumAutoCalcDims() {
  var q = TUM.q;
  var d = q.dims;
  var p = q.pedras;
  var c = d.comp, l = d.larg, a = d.alt, g = d.gavetas || 1;

  if (p.tampa)    p.tampa.m2    = roundM(c * l);
  if (p.detalhe)  p.detalhe.m2  = roundM((c + l) * 2 * 0.10);  // 10cm band
  if (p.laterais) p.laterais.m2 = roundM(c * a * 2);
  if (p.frontais) p.frontais.m2 = roundM(l * a * 2);
  if (p.base)     p.base.m2     = roundM(c * l);
  if (p.gavetas)  p.gavetas.m2  = roundM(l * (a / g) * g);     // frentes
  if (p.sainha)   p.sainha.m2   = roundM((c + l) * 2 * 0.15);  // 15cm base band
  if (p.moldura)  p.moldura.ml  = p.moldura.ml || roundM((c + l) * 2);
  if (p.pingadeira) p.pingadeira.ml = p.pingadeira.ml || roundM((c + l) * 2);
}

function tumAutoMatQty() {
  var q = TUM.q;
  var d = q.dims;
  var mat = q.mat;
  var vol = d.comp * d.larg;

  // Cimento (sc): ~4 sc p/ m² de fundação + assentamento
  if (mat.cimento) mat.cimento.qty = Math.ceil(vol * 5);
  // Areia (m³): ~0.04 m³/m²
  if (mat.areia) mat.areia.qty = Math.round(vol * 0.04 * 100) / 100;
  // Cola para granito: 1 sc / 4m²
  var m2Total = (TUM.calc && TUM.calc.m2total) || (d.comp * d.larg * 3);
  if (mat.cola) mat.cola.qty = Math.ceil(m2Total / 4);
  // Rejunte: 0.5 kg/m²
  if (mat.rejunte) mat.rejunte.qty = Math.ceil(m2Total * 0.5);
  // Massa: 1 sc / 8m²
  if (mat.massa) mat.massa.qty = Math.ceil(m2Total / 8);
  // Tijolos: ~70/m² parede
  var m2Parede = d.comp * d.alt * 2 + d.larg * d.alt * 2;
  if (mat.tijolos) mat.tijolos.qty = Math.ceil(m2Parede * 70);
  // Blocos: ~15/m²
  if (mat.blocos) mat.blocos.qty = Math.ceil(m2Parede * 15);
  // Brita: 0.02 m³/m² fundação
  if (mat.brita) mat.brita.qty = Math.round(vol * 0.02 * 100) / 100;
  // Ferro: 2 kg/m² estrutural
  if (mat.ferro) mat.ferro.qty = Math.ceil(m2Parede * 2);
}

function roundM(v) { return Math.round(v * 100) / 100; }

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════
function _togHtml(fn, k, checked) {
  return '<label class="tum-tog"><input type="checkbox"' + (checked?' checked':'') +
    ' onchange="' + fn + '(\'' + k + '\',this.checked)"><span class="tum-tog-slider"></span></label>';
}

function tumSet(key, val) { TUM.q[key] = val; }

function tumSetDim(key, val) {
  TUM.q.dims[key] = val;
  tumAutoCalcDims();
  tumRecalc();
}

function tumSetTipo(t) {
  TUM.q.tipo = t;
  var preset = TUM.TIPOS[t];
  if (!preset) { renderTum(); return; }
  // Apply preset dims
  TUM.q.dims = Object.assign({}, preset.dims);
  // Reset toggles
  Object.keys(TUM.q.pedras).forEach(function(k){ if(typeof TUM.q.pedras[k]==='object'&&'on' in TUM.q.pedras[k]) TUM.q.pedras[k].on=false; });
  Object.keys(TUM.q.mdo).forEach(function(k){if(TUM.q.mdo[k])TUM.q.mdo[k].on=false;});
  Object.keys(TUM.q.obra).forEach(function(k){if(TUM.q.obra[k])TUM.q.obra[k].on=false;});
  Object.keys(TUM.q.mat).forEach(function(k){if(TUM.q.mat[k]&&'on' in TUM.q.mat[k])TUM.q.mat[k].on=false;});
  // Enable preset items
  preset.pedras.forEach(function(k){if(TUM.q.pedras[k])TUM.q.pedras[k].on=true;});
  preset.mdo.forEach(function(k){if(TUM.q.mdo[k])TUM.q.mdo[k].on=true;});
  preset.obra.forEach(function(k){if(TUM.q.obra[k])TUM.q.obra[k].on=true;});
  preset.mat.forEach(function(k){if(TUM.q.mat[k]&&'on' in TUM.q.mat[k])TUM.q.mat[k].on=true;});
  // Set labor days from preset
  if (preset.diasMdo) {
    var horasMarmorista = preset.diasMdo * 8;
    if (TUM.q.mdo.marmorista) TUM.q.mdo.marmorista.horas = horasMarmorista;
    if (TUM.q.mdo.ajudante) TUM.q.mdo.ajudante.horas = horasMarmorista;
  }
  if (preset.diasObra) {
    ['fundacao','levantamento','reboco','contraPiso','gavetas','concreto','acabOb'].forEach(function(k) {
      if (TUM.q.obra[k] && TUM.q.obra[k].on) TUM.q.obra[k].dias = Math.max(1, Math.round(preset.diasObra / 3));
    });
  }
  tumAutoCalcDims();
  tumAutoMatQty();
  TUM.calc = tumCalc();
  renderTum();
}

function tumSetPeca(k, prop, val) {
  TUM.q.pedras[k][prop] = val;
  tumRecalc();
}
function tumSetPecaML(k, val) {
  TUM.q.pedras[k].ml = val;
  tumRecalc();
}
function tumTogPeca(k, on) {
  TUM.q.pedras[k].on = on;
  tumRecalc();
}
function tumTogMdo(k, on) {
  TUM.q.mdo[k].on = on;
  tumRecalc();
}
function tumTogObra(k, on) {
  TUM.q.obra[k].on = on;
  tumRecalc();
}
function tumTogMat(k, on) {
  TUM.q.mat[k].on = on;
  tumRecalc();
}

function tumRecalc() {
  tumAutoCalcDims();
  tumAutoMatQty();
  TUM.calc = tumCalc();
  _tumRenderTab();
  // Update hero
  var hero = document.querySelector('.tum-hero-val');
  if (hero) hero.textContent = TUM.calc.venda > 0 ? 'R$ ' + fm(TUM.calc.venda) : '—';
}

// ── Stone picker ────────────────────────────────────────────────────
function tumOpenStonePick() {
  if (!CFG || !CFG.stones) { toast('Configuração de pedras não encontrada'); return; }
  var h = '<div class="tum-stone-pick">';
  CFG.stones.forEach(function(s) {
    h += '<div class="tum-sp-row' + (TUM.q.stoneId===s.id?' on':'') + '" onclick="tumPickStone(\'' + s.id + '\')">' +
      '<div class="tum-sp-nm">' + s.nm + '</div>' +
      '<div class="tum-sp-pr">R$ ' + fm(s.pr) + '/m²</div>' +
      '</div>';
  });
  h += '</div>';
  var md = document.getElementById('tumStoneMd');
  if (md) { document.getElementById('tumStoneList').innerHTML = h; md.classList.add('on'); }
}

function tumPickStone(id) {
  TUM.q.stoneId = id;
  var sel = CFG.stones.find(function(s){return s.id===id;});
  if (sel) TUM.q.stonePrice = sel.pr;
  var md = document.getElementById('tumStoneMd');
  if (md) md.classList.remove('on');
  tumRecalc();
  renderTum();
}

// ── Save / New ───────────────────────────────────────────────────────
function tumSalvar() {
  var res = TUM.calc;
  if (!TUM.q.cli) { toast('Informe o cliente'); return; }
  var sel = TUM.q.stoneId ? (CFG && CFG.stones ? CFG.stones.find(function(s){return s.id===TUM.q.stoneId;}) : null) : null;
  var q = {
    id: Date.now(),
    tipo: 'Túmulo — ' + (TUM.TIPOS[TUM.q.tipo] ? TUM.TIPOS[TUM.q.tipo].label : TUM.q.tipo),
    cli: TUM.q.cli,
    mat: sel ? sel.nm : 'Pedra',
    vista: res.venda,
    prazo: res.venda,
    ent:   res.venda * 0.5,
    custo: res.custoTotal,
    lucro: res.lucro,
    obs: TUM.q.obs,
    tum: JSON.parse(JSON.stringify(TUM.q)),
    tumCalc: JSON.parse(JSON.stringify(res)),
    dt: td()
  };
  DB.q.unshift(q);
  DB.sv();
  toast('✅ Orçamento de túmulo salvo!');
}

function tumNovo() {
  if (!confirm('Limpar orçamento atual?')) return;
  TUM.q.cli=''; TUM.q.falecido=''; TUM.q.cemiterio=''; TUM.q.quadra=''; TUM.q.lote='';
  TUM.q.stoneId=null; TUM.q.stonePrice=0; TUM.q.obs='';
  tumSetTipo('simples');
}
