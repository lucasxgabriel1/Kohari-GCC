/**
 * Cálculos estatísticos e Cadeias de Markov para o Sistema de Runas de Grand Chase
 */

import { BASE_ENHANCE_STEPS, EnhanceLevelStep, BoosterOption } from '../data/runeData';

/**
 * Retorna o número de baús necessários para atingir uma probabilidade acumulada com probabilidade unitária p
 * Ex: p = 0.0015 (0.15% T5 Lendária), confidence = 0.90 (90%) => quantos baús?
 */
export function chestsNeededForConfidence(probabilityPercent: number, confidence: number): number {
  const p = probabilityPercent / 100;
  if (p <= 0) return Infinity;
  if (p >= 1) return 1;
  return Math.ceil(Math.log(1 - confidence) / Math.log(1 - p));
}

/**
 * Chance acumulada de conseguir pelo menos 1 drop desejado em N tentativas
 * P(>= 1) = 1 - (1 - p)^N
 */
export function chanceInNAttempts(probabilityPercent: number, attempts: number): number {
  const p = probabilityPercent / 100;
  if (p <= 0 || attempts <= 0) return 0;
  if (p >= 1) return 100;
  const failProb = Math.pow(1 - p, attempts);
  return (1 - failProb) * 100;
}

/**
 * Resultado do cálculo de Markov para Fortalecimento
 */
export interface MarkovEnhanceResult {
  expectedAttempts: number;
  expectedDarkStones: number;
  expectedGP: number;
  stepDetails: {
    level: number;
    targetLevel: number;
    effectiveSuccessRate: number;
    effectiveStayRate: number;
    effectiveDropRate: number;
    effectiveBreakRate: number;
    expectedVisits: number;
    stonesPerTry: number;
    gpPerTry: number;
  }[];
  confidenceAttempts: {
    p50: number; // Mediana (50% dos jogadores conseguem até aqui)
    p75: number;
    p90: number; // 90% dos jogadores conseguem até aqui
    p95: number;
    p99: number;
  };
}

/**
 * Calcula a probabilidade efetiva de cada passo considerando o Booster e o Pergaminho de Proteção
 */
export function getEffectiveStepRates(step: EnhanceLevelStep, booster: BoosterOption) {
  let success = Math.min(100, step.baseSuccessRate + booster.bonusRate);
  let stay = step.baseStayRate;
  let drop = booster.preventsDowngrade ? 0 : step.baseDropRate;
  let brk = booster.preventsBreak ? 0 : step.baseBreakRate;

  // Re-normalizar se as chances de falha mudaram (ex: com proteção ou aumento de taxa de sucesso)
  const remaining = 100 - success;
  const failWeights = stay + drop + brk;

  if (failWeights > 0 && remaining >= 0) {
    const scale = remaining / failWeights;
    stay = stay * scale;
    drop = drop * scale;
    brk = brk * scale;
  } else if (remaining <= 0) {
    success = 100;
    stay = 0;
    drop = 0;
    brk = 0;
  }

  return {
    successRate: Math.max(0, success),
    stayRate: Math.max(0, stay),
    dropRate: Math.max(0, drop),
    breakRate: Math.max(0, brk),
  };
}

/**
 * Resolve o sistema de equações lineares de primeiro grau para valor esperado em cadeia de Markov
 * E[i] = custo_i + p_succ * E[i+1] + p_stay * E[i] + p_drop * E[i-1] + p_break * E[0]
 * Onde E[target] = 0.
 */
export function calculateMarkovEnhance(
  startLevel: number,
  targetLevel: number,
  booster: BoosterOption
): MarkovEnhanceResult {
  const steps = BASE_ENHANCE_STEPS;
  const n = targetLevel; // estados 0, 1, ..., targetLevel-1

  // Matriz de taxas por nível
  const rates = steps.map((s) => getEffectiveStepRates(s, booster));

  // Resolvendo número esperado de tentativas partindo de cada estado até atingir 'targetLevel'
  // Usamos método de eliminação gaussiana / substituição para tridiagonal
  // Equações para tentativas T[i]:
  // T[i] = 1 + p_succ * T[i+1] + p_stay * T[i] + p_drop * T[i-1] (supondo que break reinicia em 0)
  // Reescrevendo: (1 - p_stay)*T[i] - p_succ*T[i+1] - p_drop*T[i-1] - p_break*T[0] = 1

  // Montamos matriz de tamanho n x n para T[0..n-1]
  const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const bT: number[] = Array(n).fill(1); // 1 tentativa por visita
  const bStones: number[] = Array(n).fill(0);
  const bGP: number[] = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const r = rates[i];
    const pSucc = r.successRate / 100;
    const pStay = r.stayRate / 100;
    const pDrop = r.dropRate / 100;
    const pBrk = r.breakRate / 100;

    bStones[i] = steps[i].darkStonesCost;
    bGP[i] = steps[i].gpCost;

    // Linha i:
    A[i][i] = 1 - pStay;

    if (i + 1 < n) {
      A[i][i + 1] = -pSucc;
    }
    // se i + 1 == n, T[target] = 0, então nada adicionado

    if (i > 0) {
      A[i][i - 1] = -pDrop;
    }

    if (pBrk > 0) {
      A[i][0] -= pBrk; // volta para o estado 0
    }
  }

  // Resolver para Tentativas, Pedras Negras e GP
  const expectedT = solveLinearSystem(A, bT);
  const expectedStonesVec = solveLinearSystem(A, bStones);
  const expectedGPVec = solveLinearSystem(A, bGP);

  const totalExpectedAttempts = Math.max(0, expectedT[startLevel] || 0);
  const totalExpectedStones = Math.max(0, expectedStonesVec[startLevel] || 0);
  const totalExpectedGP = Math.max(0, expectedGPVec[startLevel] || 0);

  // Detalhes por nível
  const stepDetails = [];
  for (let i = 0; i < targetLevel; i++) {
    const r = rates[i];
    stepDetails.push({
      level: i,
      targetLevel: i + 1,
      effectiveSuccessRate: r.successRate,
      effectiveStayRate: r.stayRate,
      effectiveDropRate: r.dropRate,
      effectiveBreakRate: r.breakRate,
      expectedVisits: (expectedT[i] || 0) * (r.successRate / 100),
      stonesPerTry: steps[i].darkStonesCost,
      gpPerTry: steps[i].gpCost,
    });
  }

  // Estimativa percentil baseada na distribuição geométrica / cadeia absorvente
  // p50 (mediana) ~ 0.7 * média para processo geométrico composto
  const p50 = Math.max(targetLevel - startLevel, Math.round(totalExpectedAttempts * 0.75));
  const p75 = Math.max(p50, Math.round(totalExpectedAttempts * 1.15));
  const p90 = Math.max(p75, Math.round(totalExpectedAttempts * 1.7));
  const p95 = Math.max(p90, Math.round(totalExpectedAttempts * 2.2));
  const p99 = Math.max(p95, Math.round(totalExpectedAttempts * 3.3));

  return {
    expectedAttempts: Math.round(totalExpectedAttempts * 10) / 10,
    expectedDarkStones: Math.round(totalExpectedStones),
    expectedGP: Math.round(totalExpectedGP),
    stepDetails,
    confidenceAttempts: { p50, p75, p90, p95, p99 },
  };
}

/**
 * Resolução de sistema Ax = b via eliminação gaussiana com pivoteamento parcial
 */
function solveLinearSystem(origA: number[][], origB: number[]): number[] {
  const n = origA.length;
  if (n === 0) return [];
  const A = origA.map((row) => [...row]);
  const b = [...origB];

  for (let i = 0; i < n; i++) {
    // Encontrar pivô
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }

    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];

    if (Math.abs(A[i][i]) < 1e-12) {
      continue;
    }

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      b[k] -= factor * b[i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * x[j];
    }
    if (Math.abs(A[i][i]) > 1e-12) {
      x[i] = sum / A[i][i];
    } else {
      x[i] = 0;
    }
  }

  return x;
}

/**
 * Formata números grandes de GP com separador de milhar pt-BR ou abreviação
 */
export function formatGP(val: number): string {
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M GP`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K GP`;
  }
  return `${Math.round(val).toLocaleString('pt-BR')} GP`;
}
