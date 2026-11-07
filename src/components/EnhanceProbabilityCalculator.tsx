import React, { useState, useMemo } from 'react';
import {
  BASE_ENHANCE_STEPS,
  BOOSTER_OPTIONS,
  TIER_DATA,
  BoosterOption,
  RuneTier,
} from '../data/runeData';
import { calculateMarkovEnhance, formatGP } from '../utils/probabilityMath';
import {
  ShieldAlert,
  Zap,
  TrendingUp,
  Coins,
  Gem,
  Award,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Check,
  Flame,
} from 'lucide-react';

export const EnhanceProbabilityCalculator: React.FC = () => {
  const [startLevel, setStartLevel] = useState<number>(0);
  const [targetLevel, setTargetLevel] = useState<number>(9);
  const [selectedBoosterId, setSelectedBoosterId] = useState<string>('none');
  const [selectedTier, setSelectedTier] = useState<RuneTier>('T5');

  const selectedBooster: BoosterOption = useMemo(() => {
    return BOOSTER_OPTIONS.find((b) => b.id === selectedBoosterId) || BOOSTER_OPTIONS[0];
  }, [selectedBoosterId]);

  // Cálculo da Cadeia de Markov para Fortalecimento
  const markovResult = useMemo(() => {
    if (targetLevel <= startLevel) {
      return {
        expectedAttempts: 0,
        expectedDarkStones: 0,
        expectedGP: 0,
        stepDetails: [],
        confidenceAttempts: { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 },
      };
    }
    return calculateMarkovEnhance(startLevel, targetLevel, selectedBooster);
  }, [startLevel, targetLevel, selectedBooster]);

  // Multiplicador de custo de acordo com o Tier da Runa
  const tierCostMultiplier = useMemo(() => {
    switch (selectedTier) {
      case 'T1':
        return 0.4;
      case 'T2':
        return 0.6;
      case 'T3':
        return 0.8;
      case 'T4':
        return 0.9;
      case 'T5':
      default:
        return 1.0;
    }
  }, [selectedTier]);

  const adjustedDarkStones = Math.round(markovResult.expectedDarkStones * tierCostMultiplier);
  const adjustedGP = Math.round(markovResult.expectedGP * tierCostMultiplier);

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Calculadora de Fortalecimento com Pedras Negras (+0 até +9)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Simule a transição de níveis com modelo estocástico de Cadeia de Markov, considerando taxas de sucesso, risco de rebaixamento (-1 nível) e itens de auxílio.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
            <span className="text-stone-400">Runa:</span>
            <span className="font-bold text-amber-400">{selectedTier}</span>
          </div>
        </div>
      </div>

      {/* Grid de Controles: Nível Inicial, Nível Alvo, Tier e Booster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nível Inicial */}
        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>Nível Inicial</span>
            <span className="font-bold text-stone-200">+{startLevel}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setStartLevel(lvl);
                  if (targetLevel <= lvl) setTargetLevel(Math.min(9, lvl + 1));
                }}
                className={`flex-1 min-w-[32px] py-1.5 text-xs rounded-lg font-bold border transition-all ${
                  startLevel === lvl
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                }`}
              >
                +{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Nível Alvo */}
        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>Nível Alvo Desejado</span>
            <span className="font-bold text-amber-400">+{targetLevel}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
              const disabled = lvl <= startLevel;
              return (
                <button
                  key={lvl}
                  disabled={disabled}
                  onClick={() => setTargetLevel(lvl)}
                  className={`flex-1 min-w-[32px] py-1.5 text-xs rounded-lg font-bold border transition-all ${
                    disabled
                      ? 'opacity-30 cursor-not-allowed bg-stone-950 text-stone-600 border-stone-900'
                      : targetLevel === lvl
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  +{lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier da Runa */}
        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Tier da Runa (Afeta Custo)
          </label>
          <div className="grid grid-cols-5 gap-1">
            {(['T1', 'T2', 'T3', 'T4', 'T5'] as RuneTier[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  selectedTier === t
                    ? `${TIER_DATA[t].badgeBg} ring-1 ring-amber-400`
                    : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-400 block truncate">
            {TIER_DATA[selectedTier].name}
          </span>
        </div>

        {/* Itens de Auxílio / Booster */}
        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Item de Auxílio / Booster
          </label>
          <select
            value={selectedBoosterId}
            onChange={(e) => setSelectedBoosterId(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 text-xs font-medium text-stone-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-400 focus:outline-none"
          >
            {BOOSTER_OPTIONS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            {selectedBooster.preventsDowngrade ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Protege contra rebaixamento e quebra
              </span>
            ) : (
              <span className="text-amber-400/90 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Risco de queda a partir do +5
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resultados Principais do Cálculo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tentativas Médias Esperadas */}
        <div className="bg-stone-900/70 p-5 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-stone-300">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Tentativas Médias
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-950 text-stone-400 font-mono text-[10px]">
              E[Tentativas]
            </span>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono">
            {markovResult.expectedAttempts}
            <span className="text-base text-stone-400 font-sans font-normal ml-1">vezes</span>
          </div>
          <p className="text-xs text-stone-400">
            Média ponderada para evoluir de <strong>+{startLevel}</strong> até <strong>+{targetLevel}</strong>.
          </p>
        </div>

        {/* Pedras Negras Necessárias */}
        <div className="bg-stone-900/70 p-5 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-stone-300">
              <Gem className="w-4 h-4 text-purple-400" />
              Pedras Negras Estimadas
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-mono text-[10px]">
              Darkstones
            </span>
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono">
            {adjustedDarkStones.toLocaleString('pt-BR')}
            <span className="text-base text-stone-400 font-sans font-normal ml-1">unidades</span>
          </div>
          <p className="text-xs text-stone-400">
            Quantidade média de pedras para atingir o objetivo com segurança.
          </p>
        </div>

        {/* Custo em GP */}
        <div className="bg-stone-900/70 p-5 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-stone-300">
              <Coins className="w-4 h-4 text-yellow-400" />
              Custo Estimado em GP
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-800 text-yellow-300 font-mono text-[10px]">
              Ouro / Moedas
            </span>
          </div>
          <div className="text-3xl font-black text-yellow-300 font-mono">
            {formatGP(adjustedGP)}
          </div>
          <p className="text-xs text-stone-400">
            Exatamente {adjustedGP.toLocaleString('pt-BR')} GP em média.
          </p>
        </div>
      </div>

      {/* Tabela de Percentis de Confiança (Quantas pedras guardar para garantir?) */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Intervalos de Confiança (Quantas Pedras Negras Guardar?)
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            Devido à aleatoriedade (RNG), você pode ter muita sorte ou muito azar. Veja a quantidade segura de acordo com o percentual de jogadores:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* P50 Mediana */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-medium">50% dos Jogadores (Mediana)</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <div className="text-xl font-mono font-bold text-blue-300">
              {markovResult.confidenceAttempts.p50} tentativas
            </div>
            <div className="text-[11px] text-stone-400">
              ~{Math.round(adjustedDarkStones * 0.75).toLocaleString('pt-BR')} Pedras Negras
            </div>
          </div>

          {/* P75 Bom estoque */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-medium">75% dos Jogadores</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xl font-mono font-bold text-emerald-300">
              {markovResult.confidenceAttempts.p75} tentativas
            </div>
            <div className="text-[11px] text-stone-400">
              ~{Math.round(adjustedDarkStones * 1.15).toLocaleString('pt-BR')} Pedras Negras
            </div>
          </div>

          {/* P90 Recomendado */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-amber-500/40 bg-amber-950/15 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-amber-200 font-bold">90% dos Jogadores (Recomendado)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-xl font-mono font-bold text-amber-300">
              {markovResult.confidenceAttempts.p90} tentativas
            </div>
            <div className="text-[11px] text-amber-300/80 font-medium">
              ~{Math.round(adjustedDarkStones * 1.7).toLocaleString('pt-BR')} Pedras Negras
            </div>
          </div>

          {/* P99 Pior caso */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-medium">99% (Margem Extrema de Azar)</span>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <div className="text-xl font-mono font-bold text-purple-300">
              {markovResult.confidenceAttempts.p99} tentativas
            </div>
            <div className="text-[11px] text-stone-400">
              ~{Math.round(adjustedDarkStones * 3.3).toLocaleString('pt-BR')} Pedras Negras
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Transição Passo a Passo por Nível */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-3">
        <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Probabilidades e Riscos por Passo (+0 até +9)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
              <tr>
                <th className="py-3 px-3">Evolução</th>
                <th className="py-3 px-3">Sucesso Base</th>
                <th className="py-3 px-3 text-amber-400">Sucesso Efetivo</th>
                <th className="py-3 px-3 text-stone-400">Permanece</th>
                <th className="py-3 px-3 text-rose-400">Desce Nível (-1)</th>
                <th className="py-3 px-3 text-purple-400">Pedras/Tent.</th>
                <th className="py-3 px-3 text-yellow-400">GP/Tent.</th>
                <th className="py-3 px-3 text-stone-300">Efeito Desbloqueado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {BASE_ENHANCE_STEPS.map((step) => {
                const isSelectedRange = step.fromLevel >= startLevel && step.toLevel <= targetLevel;
                const boosterBonus = selectedBooster.bonusRate;
                const effSuccess = Math.min(100, step.baseSuccessRate + boosterBonus);
                const effDrop = selectedBooster.preventsDowngrade ? 0 : step.baseDropRate;
                const effStay = Math.max(0, 100 - effSuccess - effDrop);

                return (
                  <tr
                    key={step.fromLevel}
                    className={`transition-colors ${
                      isSelectedRange
                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                        : 'opacity-40 hover:opacity-70 bg-stone-950/20'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-bold text-stone-200">
                      +{step.fromLevel} &rarr; +{step.toLevel}
                    </td>
                    <td className="py-2.5 px-3 text-stone-400">
                      {step.baseSuccessRate.toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">
                      {effSuccess.toFixed(0)}%
                      {boosterBonus > 0 && (
                        <span className="text-[10px] text-emerald-400 ml-1">(+{boosterBonus}%)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-stone-400">
                      {effStay.toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {effDrop > 0 ? (
                        <span className="text-rose-400">{effDrop.toFixed(0)}%</span>
                      ) : (
                        <span className="text-emerald-400 text-[11px]">0% (Seguro)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300">
                      {Math.round(step.darkStonesCost * tierCostMultiplier)}
                    </td>
                    <td className="py-2.5 px-3 text-yellow-300">
                      {(Math.round(step.gpCost * tierCostMultiplier)).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[11px] text-stone-300">
                      {step.unlocksSubStat ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-amber-300 font-semibold">
                          {step.toLevel === 3
                            ? '1º Sub-Atributo'
                            : step.toLevel === 6
                            ? '2º Sub-Atributo'
                            : '3º Sub-Atributo (Máx)'}
                        </span>
                      ) : (
                        <span className="text-stone-400">Aumenta Status Principal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dicas Táticas de Fortalecimento para Grand Chase */}
      <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-2">
        <h5 className="font-bold text-stone-200 flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Guia de Economia de Recursos (Meta GC Classic)
        </h5>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Do +0 ao +5:</strong> É 100% seguro contra rebaixamento. <em>Nunca</em> gaste pergaminhos de proteção nessa faixa!
          </li>
          <li>
            <strong>Do +5 ao +6:</strong> Desbloqueia o segundo sub-atributo. Se falhar, tem 25% de chance de cair para +4.
          </li>
          <li>
            <strong>Do +6 ao +9:</strong> O efeito gangorra (cair de nível) consome a grande maioria das suas Pedras Negras. É aqui que o <strong>Pergaminho de Proteção</strong> economiza até 70% de pedras e GP.
          </li>
          <li>
            <strong>Desmontar Runas:</strong> Desmonte runas T1, T2 e T3 inúteis para obter Pedras Negras em abundância.
          </li>
        </ul>
      </div>
    </div>
  );
};
