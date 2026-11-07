/**
 * Módulo de Cálculos Matemáticos de Probabilidade para Runas de Habilidade do Grand Chase
 * Todas as probabilidades internas operam estritamente em formato decimal (0 a 1).
 */

export type RuneSearchMode = 'ANY' | 'ALL'; // Modo A (Qualquer uma - OU) vs Modo B (Todas simultâneas - E)

export interface RuneCalculationInput {
  lockedSlots: 0 | 1 | 2; // Quantidade de slots travados
  searchMode: RuneSearchMode; // 'ANY' (Modo A) ou 'ALL' (Modo B)
  skillsProbabilities: number[]; // Probabilidades individuais em decimal (ex: [0.07, 0.07])
  attempts: number; // Número de tentativas T
}

export interface RuneCalculationResult {
  freeSlots: number; // N slots livres (3 - lockedSlots)
  costPerAttempt: number; // Custo em pergaminhos por tentativa (1 + lockedSlots)
  singleAttemptChance: number; // Probabilidade P em 1 tentativa (decimal)
  cumulativeChance: number; // Probabilidade acumulada P_acumulada (decimal)
  totalScrollsSpent: number; // Total de pergaminhos gastos
  averageAttempts: number; // Tentativas médias até o sucesso (1 / P)
  averageScrolls: number; // Pergaminhos médios até o sucesso ((1 + lockedSlots) / P)
}

/**
 * Retorna o número máximo de habilidades que o usuário pode buscar
 * com base na quantidade de slots livres.
 * - 0 travados (3 livres): 1, 2 ou 3
 * - 1 travado (2 livres): 1 ou 2
 * - 2 travados (1 livre): 1
 */
export function getMaxSearchableSkills(lockedSlots: 0 | 1 | 2): number {
  return 3 - lockedSlots;
}

/**
 * Calcula a probabilidade de sucesso em uma única tentativa.
 *
 * Modo A (Qualquer uma das habilidades - OU):
 * P = 1 - (1 - p)^N, onde p = soma das probabilidades individuais das habilidades aceitáveis.
 *
 * Modo B (Todas as habilidades - E):
 * - 1 habilidade em N slots livres: P = 1 - (1 - pA)^N
 * - 2 habilidades em 2 slots livres: P = 2 * pA * pB
 * - 2 habilidades em 3 slots livres: P = 6 * pA * pB * (1 - pA - pB) ou 6 * pA * pB
 * - 3 habilidades em 3 slots livres: P = 6 * pA * pB * pC
 */
export function calculateSingleAttemptChance(
  lockedSlots: 0 | 1 | 2,
  searchMode: RuneSearchMode,
  skillsProbabilities: number[]
): number {
  const N = 3 - lockedSlots;
  const K = skillsProbabilities.length;

  if (K === 0 || N <= 0) return 0;

  // Garantir que K não exceda N
  if (K > N) return 0;

  if (searchMode === 'ANY') {
    // Modo A: Qualquer uma das habilidades (OU)
    // p = soma das probabilidades individuais
    const sumP = skillsProbabilities.reduce((acc, p) => acc + p, 0);
    const clampedSum = Math.min(1, Math.max(0, sumP));
    // P = 1 - (1 - p)^N
    return 1 - Math.pow(1 - clampedSum, N);
  }

  // Modo B: Todas as habilidades simultâneas (E)
  if (K === 1) {
    const pA = skillsProbabilities[0] || 0;
    return 1 - Math.pow(1 - pA, N);
  }

  if (K === 2) {
    const pA = skillsProbabilities[0] || 0;
    const pB = skillsProbabilities[1] || 0;
    if (N === 2) {
      // Exatamente 2 slots livres: 2 * pA * pB (ordens AB ou BA)
      return 2 * pA * pB;
    }
    if (N === 3) {
      // 2 habilidades em 3 slots livres: 3 * 2 = 6 permutações
      // Os 2 slots recebem A e B, e o 3º slot recebe qualquer outro atributo
      const pOther = Math.max(0, 1 - pA - pB);
      return 6 * pA * pB * pOther;
    }
  }

  if (K === 3) {
    const pA = skillsProbabilities[0] || 0;
    const pB = skillsProbabilities[1] || 0;
    const pC = skillsProbabilities[2] || 0;
    if (N === 3) {
      // Exatamente 3 slots livres: 3! = 6 * pA * pB * pC
      return 6 * pA * pB * pC;
    }
  }

  return 0;
}

/**
 * Função central de cálculo de runa com todas as métricas unificadas.
 */
export function calculateRuneProbability(input: RuneCalculationInput): RuneCalculationResult {
  const { lockedSlots, searchMode, skillsProbabilities, attempts } = input;
  const freeSlots = 3 - lockedSlots;
  const costPerAttempt = 1 + lockedSlots;

  const P = calculateSingleAttemptChance(lockedSlots, searchMode, skillsProbabilities);

  // Chance acumulada em T tentativas: P_acumulada = 1 - (1 - P)^T
  const cumulativeChance = attempts > 0 && P > 0
    ? 1 - Math.pow(1 - P, attempts)
    : 0;

  // Total de pergaminhos gastos
  const totalScrollsSpent = attempts * costPerAttempt;

  // Média estatística:
  // Tentativas médias = 1 / P
  // Pergaminhos médios = (1 + lockedSlots) / P
  const averageAttempts = P > 0 ? 1 / P : Infinity;
  const averageScrolls = P > 0 ? costPerAttempt / P : Infinity;

  return {
    freeSlots,
    costPerAttempt,
    singleAttemptChance: P,
    cumulativeChance,
    totalScrollsSpent,
    averageAttempts,
    averageScrolls,
  };
}

/**
 * Formata um valor decimal (0 a 1) para porcentagem com precisão controlada.
 * Se >= 0.9999, pode formatar como 99.99% ou similar para manter rigor de RNG.
 */
export function formatPercentage(decimalValue: number, decimals = 4): string {
  if (decimalValue <= 0) return '0%';
  const pct = decimalValue * 100;
  if (pct >= 99.999) return '99.999%';
  if (pct >= 99.99) return '99.99%';
  const fixed = pct.toFixed(decimals);
  const clean = parseFloat(fixed).toString();
  if (!clean.includes('.')) {
    return `${clean}%`;
  }
  const parts = clean.split('.');
  if (parts[1].length < 2) {
    return `${pct.toFixed(2)}%`;
  }
  return `${clean}%`;
}
