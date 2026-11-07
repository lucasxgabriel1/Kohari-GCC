/**
 * Grand Chase Classic - Dados e Probabilidades Oficiais de Runas (KOG)
 */

export type RuneTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
export type RuneRank = 'Normal' | 'Rara' | 'Épica' | 'Lendária';
export type RuneShape = 'Círculo' | 'Triângulo' | 'Quadrado' | 'Pentágono' | 'Hexágono';

export interface TierInfo {
  tier: RuneTier;
  name: string;
  probability: number; // Porcentagem (0-100)
  color: string;
  badgeBg: string;
  borderColor: string;
  maxSubStats: number;
  baseMainStatT5Factor: number;
}

export const TIER_DATA: Record<RuneTier, TierInfo> = {
  T1: {
    tier: 'T1',
    name: 'Tier 1 (Básica)',
    probability: 16.85,
    color: 'text-stone-300',
    badgeBg: 'bg-stone-800/80 text-stone-300 border-stone-600',
    borderColor: 'border-stone-500',
    maxSubStats: 1,
    baseMainStatT5Factor: 0.35,
  },
  T2: {
    tier: 'T2',
    name: 'Tier 2 (Intermediária)',
    probability: 24.00,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
    borderColor: 'border-emerald-500',
    maxSubStats: 2,
    baseMainStatT5Factor: 0.50,
  },
  T3: {
    tier: 'T3',
    name: 'Tier 3 (Avançada)',
    probability: 25.25,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-700',
    borderColor: 'border-blue-500',
    maxSubStats: 3,
    baseMainStatT5Factor: 0.65,
  },
  T4: {
    tier: 'T4',
    name: 'Tier 4 (Superior)',
    probability: 26.25,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700',
    borderColor: 'border-purple-500',
    maxSubStats: 3,
    baseMainStatT5Factor: 0.82,
  },
  T5: {
    tier: 'T5',
    name: 'Tier 5 (Suprema / Harrier)',
    probability: 7.65,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-600',
    borderColor: 'border-amber-400',
    maxSubStats: 3,
    baseMainStatT5Factor: 1.0,
  },
};

export interface RankInfo {
  rank: RuneRank;
  name: string;
  probability: number; // Porcentagem geral (0-100)
  color: string;
  textColor: string;
  bgGlow: string;
  borderClass: string;
  subStatsUnlockedAtStart: number;
}

export const RANK_DATA: Record<RuneRank, RankInfo> = {
  Normal: {
    rank: 'Normal',
    name: 'Normal',
    probability: 21.25,
    color: 'text-gray-300',
    textColor: 'text-gray-300',
    bgGlow: 'from-gray-500/10 to-transparent',
    borderClass: 'border-gray-500/50',
    subStatsUnlockedAtStart: 0,
  },
  Rara: {
    rank: 'Rara',
    name: 'Rara',
    probability: 25.25,
    color: 'text-sky-400',
    textColor: 'text-sky-400',
    bgGlow: 'from-sky-500/20 to-transparent',
    borderClass: 'border-sky-500/70',
    subStatsUnlockedAtStart: 1,
  },
  Épica: {
    rank: 'Épica',
    name: 'Épica',
    probability: 26.50,
    color: 'text-purple-400',
    textColor: 'text-purple-400',
    bgGlow: 'from-purple-500/25 to-transparent',
    borderClass: 'border-purple-500/80',
    subStatsUnlockedAtStart: 2,
  },
  Lendária: {
    rank: 'Lendária',
    name: 'Lendária',
    probability: 27.00,
    color: 'text-amber-400',
    textColor: 'text-amber-300',
    bgGlow: 'from-amber-500/30 via-orange-500/20 to-transparent',
    borderClass: 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    subStatsUnlockedAtStart: 3,
  },
};

// ==========================================
// DADOS OFICIAIS RUNES-BR (THEARESIUS / KOG)
// ==========================================

export const RUNES_BR_PRIMARY_BASE: Record<string, number> = {
  'Ataque': 1730,
  'Defesa': 1225,
  'HP': 930,
  'Vitalidade': 930,
  'Ataque Especial': 1540,
  'Defesa Especial': 1030,
  'Crítico': 6.5,
  'Chance de Crítico': 6.5,
  'Dano Crítico': 50,
  'Recuperar HP': 31.7,
  'Recuperação de HP': 31.7,
  'Recuperar MP': 11,
  'Recuperação de MP/AP': 11,
  'Defesa de Counter': 9,
  'Redução Custo de MP/AP no Contra-Ataque': 9,
  'Resistência Counter': 9,
  'Resistência a Dano Crítico': 13,
  'Dano Crítico Recebido (-)': 13,
  'Resistência a Contaminação': 13.8,
};

export const RUNES_BR_TIER_INDEX: Record<RuneTier, number> = {
  T1: 0,
  T2: 1,
  T3: 2,
  T4: 3,
  T5: 4,
};

export const RUNES_BR_TIER_RARITY_MULT: Record<RuneRank, number[]> = {
  Normal: [0.15, 0.26, 0.37, 0.48, 0.59],
  Rara: [0.21, 0.32, 0.43, 0.54, 0.65],
  Épica: [0.27, 0.38, 0.49, 0.60, 0.71],
  Lendária: [0.33, 0.44, 0.55, 0.66, 0.77],
};

// Enhancement multiplier para refino +9 máximo oficial (1.300)
export const RUNES_BR_ENHANCEMENT_9 = 1.300;

// Base de Sub-Atributos (Secondary Stats) Runes-BR
export const RUNES_BR_SECONDARY_BASE: Record<string, number> = {
  attack: 554,
  defense: 392,
  hp: 298,
  special_atk: 493,
  special_def: 329.6,
  crit_rate: 2.1,
  crit_damage: 16,
  counter_res: 2.9,
  hp_recovery: 10.2,
  mp_recovery: 3.6,
  gp_gain: 4,
  hell_spear: 200,
  crit_resist: 4.2,
  harrier_res: 4.42,
};

export const RUNES_BR_SECONDARY_NAME_TO_ID: Record<string, string> = {
  'Ataque': 'attack',
  'Defesa': 'defense',
  'Vitalidade': 'hp',
  'HP': 'hp',
  'Vitalidade / HP': 'hp',
  'Resistência a Contaminação': 'harrier_res',
  'Resistência a Contaminação (%)': 'harrier_res',
  'Resistência a Harrier / Inferno (%)': 'harrier_res',
  'Ataque Especial': 'special_atk',
  'Aumento de Chance de Crítico': 'crit_rate',
  'Crítico': 'crit_rate',
  'Chance de Crítico': 'crit_rate',
  'Acerto Crítico (%)': 'crit_rate',
  'Dano Crítico': 'crit_damage',
  'Dano Crítico (%)': 'crit_damage',
  'Recuperação de MP/AP': 'mp_recovery',
  'Recuperar MP': 'mp_recovery',
  'Recuperação de MP': 'mp_recovery',
  'Recuperação de MP (%)': 'mp_recovery',
  'Recuperação de HP': 'hp_recovery',
  'Recuperar HP': 'hp_recovery',
  'Recuperação de HP (%)': 'hp_recovery',
  'Redução Custo de MP/AP no Contra-Ataque': 'counter_res',
  'Defesa de Counter': 'counter_res',
  'Resistência Counter': 'counter_res',
  'Dano Crítico Recebido (-)': 'crit_resist',
  'Resistência a Dano Crítico': 'crit_resist',
  'Resistência a Dano Crítico (%)': 'crit_resist',
  'Defesa Especial': 'special_def',
  'Dano da Lança Infernal': 'hell_spear',
  'Lança Infernal': 'hell_spear',
  'Ganho de GP Adicional': 'gp_gain',
  'Ganho de GP': 'gp_gain',
  'Ganho de GP (%)': 'gp_gain',
  'Aumento de GP (%)': 'gp_gain',
};

export const RUNES_BR_SECONDARY_TIER_MULT: Record<RuneTier, number> = {
  T1: 0.33,
  T2: 0.44,
  T3: 0.55,
  T4: 0.66,
  T5: 0.77,
};

export const RUNES_BR_SECONDARY_ENHANCEMENT = [1.000, 1.150, 1.300]; // 0, 1, 2 melhorias (+0 / +1 / +2)

// Valores oficiais de Ataque por Tier e Raridade calculados via Runes-BR
export const ATTACK_VALUES_BY_TIER: Record<RuneTier, Record<RuneRank, number>> = {
  T5: {
    'Lendária': 1731,
    'Épica': 1596,
    'Rara': 1461,
    'Normal': 1326,
  },
  T4: {
    'Lendária': 1484,
    'Épica': 1349,
    'Rara': 1214,
    'Normal': 1079,
  },
  T3: {
    'Lendária': 1236,
    'Épica': 1102,
    'Rara': 967,
    'Normal': 832,
  },
  T2: {
    'Lendária': 989,
    'Épica': 854,
    'Rara': 719,
    'Normal': 584,
  },
  T1: {
    'Lendária': 742,
    'Épica': 607,
    'Rara': 472,
    'Normal': 337,
  },
};

export const T5_ATTACK_VALUES = ATTACK_VALUES_BY_TIER.T5;

export const getAttackValue = (tier: RuneTier, rank: RuneRank): number => {
  return ATTACK_VALUES_BY_TIER[tier]?.[rank] ?? 1731;
};

// Valores oficiais de Dano Crítico por Tier e Raridade calculados via Runes-BR
export const CRIT_DAMAGE_MAIN_STAT_BY_TIER: Record<RuneTier, Record<RuneRank, number>> = {
  T5: {
    'Lendária': 50.05,
    'Épica': 46.15,
    'Rara': 42.25,
    'Normal': 38.35,
  },
  T4: {
    'Lendária': 42.90,
    'Épica': 39.00,
    'Rara': 35.10,
    'Normal': 31.20,
  },
  T3: {
    'Lendária': 35.75,
    'Épica': 31.85,
    'Rara': 27.95,
    'Normal': 24.05,
  },
  T2: {
    'Lendária': 28.60,
    'Épica': 24.70,
    'Rara': 20.80,
    'Normal': 16.90,
  },
  T1: {
    'Lendária': 21.45,
    'Épica': 17.55,
    'Rara': 13.65,
    'Normal': 9.75,
  },
};

export const getMainStatUnit = (statName: string): string => {
  const percentageStats = [
    'Dano Crítico',
    'Chance de Crítico',
    'Crítico',
    'Recuperação de MP/AP',
    'Recuperação de MP',
    'Recuperar MP',
    'Recuperação de HP',
    'Recuperar HP',
    'Resistência a Contaminação',
    'Redução Custo de MP/AP no Contra-Ataque',
    'Defesa de Counter',
    'Resistência Counter',
    'Dano Crítico Recebido (-)',
    'Resistência a Dano Crítico',
    'Ganho de GP',
    'Aumento de GP (%)',
  ];
  return percentageStats.includes(statName) ? '%' : '';
};

// Função unificada que calcula o valor oficial do Atributo Principal segundo a fórmula do Runes-BR
export const getMainStatValue = (
  statName: string,
  tier: RuneTier,
  rank: RuneRank,
  _shape?: RuneShape
): number => {
  const base = RUNES_BR_PRIMARY_BASE[statName];
  if (base === undefined) {
    if (statName === 'Ataque') return getAttackValue(tier, rank);
    if (statName === 'Dano Crítico') return CRIT_DAMAGE_MAIN_STAT_BY_TIER[tier]?.[rank] ?? 50.05;
    return 1000;
  }
  const tierIdx = RUNES_BR_TIER_INDEX[tier] ?? 4;
  const mult = RUNES_BR_TIER_RARITY_MULT[rank]?.[tierIdx] ?? 0.77;
  const raw = base * mult * RUNES_BR_ENHANCEMENT_9;

  const isFlat = [
    'Ataque',
    'Defesa',
    'HP',
    'Vitalidade',
    'Ataque Especial',
    'Defesa Especial',
    'Lança Infernal',
  ].includes(statName);

  return isFlat ? Math.floor(raw) : Number(raw.toFixed(2));
};

// Função oficial para calcular o valor de Sub-Atributo segundo a fórmula do Runes-BR
export const getSecondaryStatValue = (
  statIdOrName: string,
  tier: RuneTier = 'T5',
  upgradeStep: 0 | 1 | 2 = 2
): number => {
  const subId = RUNES_BR_SECONDARY_NAME_TO_ID[statIdOrName] ?? statIdOrName;
  const base = RUNES_BR_SECONDARY_BASE[subId];
  if (base === undefined) return 0;

  const tierMult = RUNES_BR_SECONDARY_TIER_MULT[tier] ?? 0.77;
  const enhMult = RUNES_BR_SECONDARY_ENHANCEMENT[upgradeStep] ?? 1.300;
  const raw = base * tierMult * enhMult;

  const isFlat = [
    'attack',
    'defense',
    'hp',
    'special_atk',
    'special_def',
    'hell_spear',
    'Ataque',
    'Defesa',
    'HP',
    'Vitalidade',
    'Ataque Especial',
    'Defesa Especial',
    'Lança Infernal',
  ].includes(statIdOrName) || [
    'attack',
    'defense',
    'hp',
    'special_atk',
    'special_def',
    'hell_spear',
  ].includes(subId);

  return isFlat ? Math.floor(raw) : Number(raw.toFixed(2));
};

/**
 * Retorna a quantidade oficial de melhorias (2º Refino: +0, +1 ou +2) de cada slot de sub-atributo
 * de acordo com a Raridade da runa (Runes-BR / KOG):
 * - Lendária (4 melhorias no total): 1º slot (+2), 2º slot (+2), 3º slot (+0)
 * - Épica (3 melhorias no total): 1º slot (+2), 2º slot (+1), 3º slot (+0)
 * - Rara (2 melhorias no total): 1º slot (+2), 2º slot (+0), 3º slot (+0)
 * - Comum / Normal (1 melhoria no total): 1º slot (+1), 2º slot (+0), 3º slot (+0)
 */
export const getSubStatUpgradeStep = (rank: RuneRank, slotIndex: number): 0 | 1 | 2 => {
  if (slotIndex === 0) {
    return rank === 'Normal' ? 1 : 2;
  }
  if (slotIndex === 1) {
    if (rank === 'Lendária') return 2;
    if (rank === 'Épica') return 1;
    return 0;
  }
  return 0;
};

export const getRankUpgradeSummary = (rank: RuneRank): string => {
  switch (rank) {
    case 'Lendária':
      return '4 melhorias (+2 / +2 / +0)';
    case 'Épica':
      return '3 melhorias (+2 / +1 / +0)';
    case 'Rara':
      return '2 melhorias (+2 / +0 / +0)';
    case 'Normal':
      return '1 melhoria (+1 / +0 / +0)';
  }
};

// Matriz oficial KOG de Tier x Grau do Baú Avançado de Runas (%)
export const TIER_RANK_MATRIX: Record<RuneTier, Record<RuneRank, number>> = {
  T1: {
    Normal: 0.0,
    Rara: 0.0,
    Épica: 0.0,
    Lendária: 16.85,
  },
  T2: {
    Normal: 4.80,
    Rara: 7.20,
    Épica: 7.20,
    Lendária: 4.80,
  },
  T3: {
    Normal: 6.30,
    Rara: 7.55,
    Épica: 6.35,
    Lendária: 5.05,
  },
  T4: {
    Normal: 10.15,
    Rara: 10.50,
    Épica: 5.45,
    Lendária: 0.15,
  },
  T5: {
    Normal: 0.0,
    Rara: 0.0,
    Épica: 7.50,
    Lendária: 0.15, // O famoso e cobiçado T5 Lendária (0.15% = 1 em 667 baús!)
  },
};

export interface ShapeInfo {
  shape: RuneShape;
  name: string;
  probability: number;
  iconName: string;
  primaryStats: { stat: string; probability: number }[];
  description: string;
}

export const SHAPE_DATA: Record<RuneShape, ShapeInfo> = {
  Círculo: {
    shape: 'Círculo',
    name: 'Círculo',
    probability: 20.0,
    iconName: 'Circle',
    primaryStats: [
      { stat: 'Ataque', probability: 100.0 },
    ],
    description: 'Concede sempre Ataque como atributo principal (100%).',
  },
  Quadrado: {
    shape: 'Quadrado',
    name: 'Quadrado',
    probability: 20.0,
    iconName: 'Square',
    primaryStats: [
      { stat: 'Ataque', probability: 16.6667 },
      { stat: 'Defesa', probability: 16.6667 },
      { stat: 'HP', probability: 16.6667 },
      { stat: 'Recuperação de MP/AP', probability: 16.6667 },
      { stat: 'Recuperação de HP', probability: 16.6667 },
      { stat: 'Resistência a Contaminação', probability: 16.6667 },
    ],
    description: 'Concede Ataque, Defesa, HP, Recuperação de MP/AP, Recuperação de HP ou Resistência a Contaminação.',
  },
  Triângulo: {
    shape: 'Triângulo',
    name: 'Triângulo',
    probability: 20.0,
    iconName: 'Triangle',
    primaryStats: [
      { stat: 'Ataque', probability: 20.0 },
      { stat: 'Defesa', probability: 20.0 },
      { stat: 'HP', probability: 20.0 },
      { stat: 'Ataque Especial', probability: 20.0 },
      { stat: 'Defesa Especial', probability: 20.0 },
    ],
    description: 'Concede Ataque, Defesa, HP, Ataque Especial ou Defesa Especial.',
  },
  Pentágono: {
    shape: 'Pentágono',
    name: 'Pentágono',
    probability: 20.0,
    iconName: 'Pentagon',
    primaryStats: [
      { stat: 'Ataque', probability: 16.6667 },
      { stat: 'Defesa', probability: 16.6667 },
      { stat: 'HP', probability: 16.6667 },
      { stat: 'Chance de Crítico', probability: 16.6667 },
      { stat: 'Dano Crítico', probability: 16.6667 },
      { stat: 'Resistência a Contaminação', probability: 16.6667 },
    ],
    description: 'Concede Ataque, Defesa, HP, Chance de Crítico, Dano Crítico ou Resistência a Contaminação.',
  },
  Hexágono: {
    shape: 'Hexágono',
    name: 'Hexágono',
    probability: 20.0,
    iconName: 'Hexagon',
    primaryStats: [
      { stat: 'Redução Custo de MP/AP no Contra-Ataque', probability: 33.3333 },
      { stat: 'Dano Crítico Recebido (-)', probability: 33.3333 },
      { stat: 'Resistência a Contaminação', probability: 33.3334 },
    ],
    description: 'Concede Redução Custo de MP/AP no Contra-Ataque, Dano Crítico Recebido (-) ou Resistência a Contaminação.',
  },
};

// Sub-atributos possíveis e seus pesos relativos na rolagem
export interface SubStatInfo {
  id: string;
  name: string;
  shortName: string;
  isMeta: boolean; // Se é meta para dano (Crítico, Dano Crítico, Resistência Harrier)
  category: 'Ofensivo' | 'Defensivo' | 'Utilitário';
  baseProbabilityWeight: number; // Peso na roleta de sub-atributos
  unit: '%' | '';
  minValT5: number;
  maxValT5: number;
}

export const POSSIBLE_SUBSTATS: SubStatInfo[] = [
  {
    id: 'attack',
    name: 'Ataque',
    shortName: 'Ataque',
    isMeta: true,
    category: 'Ofensivo',
    baseProbabilityWeight: 7,
    unit: '',
    minValT5: 426,
    maxValT5: 554,
  },
  {
    id: 'defense',
    name: 'Defesa',
    shortName: 'Defesa',
    isMeta: false,
    category: 'Defensivo',
    baseProbabilityWeight: 7,
    unit: '',
    minValT5: 301,
    maxValT5: 392,
  },
  {
    id: 'hp',
    name: 'Vitalidade',
    shortName: 'Vitalidade',
    isMeta: false,
    category: 'Defensivo',
    baseProbabilityWeight: 7,
    unit: '',
    minValT5: 229,
    maxValT5: 298,
  },
  {
    id: 'harrier_res',
    name: 'Resistência a Contaminação',
    shortName: 'Resist. Contaminação',
    isMeta: false,
    category: 'Utilitário',
    baseProbabilityWeight: 10,
    unit: '%',
    minValT5: 3.40,
    maxValT5: 4.42,
  },
  {
    id: 'special_atk',
    name: 'Ataque Especial',
    shortName: 'Atq. Especial',
    isMeta: true,
    category: 'Ofensivo',
    baseProbabilityWeight: 7,
    unit: '',
    minValT5: 379,
    maxValT5: 493,
  },
  {
    id: 'crit_rate',
    name: 'Aumento de Chance de Crítico',
    shortName: 'Chance Crítico',
    isMeta: false,
    category: 'Ofensivo',
    baseProbabilityWeight: 4,
    unit: '%',
    minValT5: 1.62,
    maxValT5: 2.10,
  },
  {
    id: 'crit_damage',
    name: 'Dano Crítico',
    shortName: 'Dano Crítico',
    isMeta: true,
    category: 'Ofensivo',
    baseProbabilityWeight: 4,
    unit: '%',
    minValT5: 12.32,
    maxValT5: 16.02,
  },
  {
    id: 'mp_recovery',
    name: 'Recuperação de MP/AP',
    shortName: 'Recup. MP/AP',
    isMeta: false,
    category: 'Utilitário',
    baseProbabilityWeight: 4,
    unit: '%',
    minValT5: 2.77,
    maxValT5: 3.60,
  },
  {
    id: 'hp_recovery',
    name: 'Recuperação de HP',
    shortName: 'Recup. HP',
    isMeta: false,
    category: 'Defensivo',
    baseProbabilityWeight: 7,
    unit: '%',
    minValT5: 7.85,
    maxValT5: 10.21,
  },
  {
    id: 'counter_res',
    name: 'Redução Custo de MP/AP no Contra-Ataque',
    shortName: 'Red. Custo MP Counter',
    isMeta: false,
    category: 'Defensivo',
    baseProbabilityWeight: 9,
    unit: '%',
    minValT5: 2.23,
    maxValT5: 2.90,
  },
  {
    id: 'crit_resist',
    name: 'Dano Crítico Recebido (-)',
    shortName: 'Dano Crítico Recebido (-)',
    isMeta: false,
    category: 'Defensivo',
    baseProbabilityWeight: 10,
    unit: '%',
    minValT5: 3.23,
    maxValT5: 4.20,
  },
  {
    id: 'special_def',
    name: 'Defesa Especial',
    shortName: 'Def. Especial',
    isMeta: false,
    category: 'Defensivo',
    baseProbabilityWeight: 7,
    unit: '',
    minValT5: 253,
    maxValT5: 330,
  },
  {
    id: 'hell_spear',
    name: 'Dano da Lança Infernal',
    shortName: 'Lança Infernal',
    isMeta: false,
    category: 'Ofensivo',
    baseProbabilityWeight: 7,
    unit: '',
    minValT5: 154,
    maxValT5: 200,
  },
  {
    id: 'gp_gain',
    name: 'Ganho de GP Adicional',
    shortName: 'Ganho GP',
    isMeta: false,
    category: 'Utilitário',
    baseProbabilityWeight: 10,
    unit: '%',
    minValT5: 3.08,
    maxValT5: 4.00,
  },
];

// Dados das Runas de Habilidade (Skill Runes)
export interface SkillRuneBoxRate {
  rank: RuneRank;
  rate: number;
}

export const SKILL_RUNE_BOX_RATES: SkillRuneBoxRate[] = [
  { rank: 'Normal', rate: 28.0 }, // Chamado de Comum/Normal
  { rank: 'Rara', rate: 50.0 },
  { rank: 'Épica', rate: 20.0 },
  { rank: 'Lendária', rate: 2.0 },
];

export const SKILL_RUNE_TYPES = [
  {
    id: 'dmg',
    name: 'Runa Vermelha - Dano de Habilidade',
    effect: 'Aumenta o dano de todas as habilidades ativas',
    bonus: { Normal: '+2%', Rara: '+4%', Épica: '+7%', Lendária: '+12%' },
    color: 'text-red-400 border-red-500/60 bg-red-950/40',
  },
  {
    id: 'cd',
    name: 'Runa Azul - Redução de Tempo de Recarga',
    effect: 'Reduz o cooldown das habilidades da classe',
    bonus: { Normal: '-1.5%', Rara: '-3.0%', Épica: '-5.0%', Lendária: '-8.0%' },
    color: 'text-sky-400 border-sky-500/60 bg-sky-950/40',
  },
  {
    id: 'mp',
    name: 'Runa Amarela - Custo de MP',
    effect: 'Diminui o consumo de MP ao conjurar habilidades',
    bonus: { Normal: '-1.0%', Rara: '-2.5%', Épica: '-4.0%', Lendária: '-6.5%' },
    color: 'text-amber-400 border-amber-500/60 bg-amber-950/40',
  },
];

// Configuração do Sistema de Fortalecimento (Níveis +0 até +9)
export interface EnhanceLevelStep {
  fromLevel: number;
  toLevel: number;
  baseSuccessRate: number; // % (0-100)
  baseStayRate: number;    // % se falhar mas manter nível
  baseDropRate: number;    // % se falhar e descer 1 nível (-1)
  baseBreakRate: number;   // % se quebrar/destruir a runa se desprotegida
  darkStonesCost: number;  // Pedras Negras por tentativa
  gpCost: number;          // GP por tentativa
  unlocksSubStat: boolean; // No +3, +6, +9 desbloqueia ou upa sub-stat
  description: string;
}

export const BASE_ENHANCE_STEPS: EnhanceLevelStep[] = [
  {
    fromLevel: 0,
    toLevel: 1,
    baseSuccessRate: 100.0,
    baseStayRate: 0.0,
    baseDropRate: 0.0,
    baseBreakRate: 0.0,
    darkStonesCost: 4,
    gpCost: 5000,
    unlocksSubStat: false,
    description: '100% garantido. Aumenta o atributo principal.',
  },
  {
    fromLevel: 1,
    toLevel: 2,
    baseSuccessRate: 95.0,
    baseStayRate: 5.0,
    baseDropRate: 0.0,
    baseBreakRate: 0.0,
    darkStonesCost: 6,
    gpCost: 8000,
    unlocksSubStat: false,
    description: 'Altíssima chance de sucesso. Sem penalidade de perda.',
  },
  {
    fromLevel: 2,
    toLevel: 3,
    baseSuccessRate: 85.0,
    baseStayRate: 15.0,
    baseDropRate: 0.0,
    baseBreakRate: 0.0,
    darkStonesCost: 10,
    gpCost: 12000,
    unlocksSubStat: true,
    description: 'Desbloqueia ou aprimora o 1º Sub-Atributo!',
  },
  {
    fromLevel: 3,
    toLevel: 4,
    baseSuccessRate: 70.0,
    baseStayRate: 30.0,
    baseDropRate: 0.0,
    baseBreakRate: 0.0,
    darkStonesCost: 15,
    gpCost: 18000,
    unlocksSubStat: false,
    description: 'Falha mantém o nível atual. Não há risco de rebaixamento.',
  },
  {
    fromLevel: 4,
    toLevel: 5,
    baseSuccessRate: 55.0,
    baseStayRate: 45.0,
    baseDropRate: 0.0,
    baseBreakRate: 0.0,
    darkStonesCost: 22,
    gpCost: 25000,
    unlocksSubStat: false,
    description: 'Último nível seguro antes do risco de downgrade.',
  },
  {
    fromLevel: 5,
    toLevel: 6,
    baseSuccessRate: 40.0,
    baseStayRate: 35.0,
    baseDropRate: 25.0,
    baseBreakRate: 0.0,
    darkStonesCost: 32,
    gpCost: 35000,
    unlocksSubStat: true,
    description: 'Risco de voltar para +4 se falhar! Desbloqueia o 2º Sub-Atributo.',
  },
  {
    fromLevel: 6,
    toLevel: 7,
    baseSuccessRate: 30.0,
    baseStayRate: 35.0,
    baseDropRate: 35.0,
    baseBreakRate: 0.0,
    darkStonesCost: 45,
    gpCost: 50000,
    unlocksSubStat: false,
    description: '30% de chance. Recomenda-se uso de pergaminhos ou boosters.',
  },
  {
    fromLevel: 7,
    toLevel: 8,
    baseSuccessRate: 20.0,
    baseStayRate: 38.0,
    baseDropRate: 37.0,
    baseBreakRate: 5.0,
    darkStonesCost: 65,
    gpCost: 75000,
    unlocksSubStat: false,
    description: 'Nível crítico: chance de rebaixamento e pequeno risco de quebra!',
  },
  {
    fromLevel: 8,
    toLevel: 9,
    baseSuccessRate: 12.0,
    baseStayRate: 40.0,
    baseDropRate: 40.0,
    baseBreakRate: 8.0,
    darkStonesCost: 90,
    gpCost: 110000,
    unlocksSubStat: true,
    description: 'Nível Máximo! Atinge o potencial pleno e 3º Sub-Atributo no ápice.',
  },
];

export interface BoosterOption {
  id: string;
  name: string;
  bonusRate: number; // % aditivo de sucesso (+5%, +10%, +15%, +20%)
  preventsDowngrade: boolean;
  preventsBreak: boolean;
  tag: string;
}

export const BOOSTER_OPTIONS: BoosterOption[] = [
  {
    id: 'none',
    name: 'Sem Auxílio (Apenas Pedras Negras)',
    bonusRate: 0,
    preventsDowngrade: false,
    preventsBreak: false,
    tag: 'Padrão',
  },
  {
    id: 'booster_5',
    name: 'Impulsionador de Refino (+5%)',
    bonusRate: 5,
    preventsDowngrade: false,
    preventsBreak: false,
    tag: '+5% Sucesso',
  },
  {
    id: 'booster_10',
    name: 'Impulsionador de Refino (+10%)',
    bonusRate: 10,
    preventsDowngrade: false,
    preventsBreak: false,
    tag: '+10% Sucesso',
  },
  {
    id: 'booster_15',
    name: 'Impulsionador de Refino (+15%)',
    bonusRate: 15,
    preventsDowngrade: false,
    preventsBreak: false,
    tag: '+15% Sucesso',
  },
  {
    id: 'protect_scroll',
    name: 'Pergaminho de Proteção (Sem Queda & Sem Quebra)',
    bonusRate: 0,
    preventsDowngrade: true,
    preventsBreak: true,
    tag: 'Proteção Total',
  },
  {
    id: 'event_booster_protect',
    name: 'Combo Evento (+15% Sucesso + Pergaminho Proteção)',
    bonusRate: 15,
    preventsDowngrade: true,
    preventsBreak: true,
    tag: 'Ideal para +9',
  },
];
