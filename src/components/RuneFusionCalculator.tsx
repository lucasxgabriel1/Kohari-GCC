import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RuneTier, RuneRank, TIER_DATA, RANK_DATA } from '../data/runeData';
import { sounds } from '../utils/soundEffects';
import { formatGP } from '../utils/probabilityMath';
import {
  Shuffle,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Flame,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface FusionResult {
  tier: RuneTier;
  rank: RuneRank;
  isUpgrade: boolean;
  isGreatSuccess: boolean;
}

export const RuneFusionCalculator: React.FC = () => {
  const [inputTier, setInputTier] = useState<RuneTier>('T3');
  const [inputCount, setInputCount] = useState<number>(3); // 2 ou 3 runas de sacrifício
  const [fusionHistory, setFusionHistory] = useState<FusionResult[]>([]);
  const [lastResult, setLastResult] = useState<FusionResult | null>(null);
  const [totalFusions, setTotalFusions] = useState<number>(0);
  const [totalUpgrades, setTotalUpgrades] = useState<number>(0);

  // Probabilidades de fusão
  const fusionRates = {
    upgradeChance: inputCount === 3 ? 35.0 : 20.0, // Chance de subir 1 tier
    greatSuccessChance: inputCount === 3 ? 8.0 : 3.0, // Grande sucesso (sobe 2 tiers ou vem Lendária)
    keepTierChance: inputCount === 3 ? 57.0 : 77.0, // Mantém o mesmo tier
  };

  const gpCostPerFusion = inputTier === 'T1' ? 8000 : inputTier === 'T2' ? 15000 : inputTier === 'T3' ? 30000 : 60000;

  const handleFuse = () => {
    sounds.playHammerForge();
    const roll = Math.random() * 100;
    let outTier = inputTier;
    let isUpgrade = false;
    let isGreatSuccess = false;

    const tierLadder: RuneTier[] = ['T1', 'T2', 'T3', 'T4', 'T5'];
    const currentIdx = tierLadder.indexOf(inputTier);

    if (roll < fusionRates.greatSuccessChance && currentIdx < 4) {
      // Grande Sucesso!
      const targetIdx = Math.min(4, currentIdx + 2);
      outTier = tierLadder[targetIdx];
      isUpgrade = true;
      isGreatSuccess = true;
    } else if (roll < fusionRates.greatSuccessChance + fusionRates.upgradeChance && currentIdx < 4) {
      // Sucesso Comum (sobe 1 tier)
      outTier = tierLadder[currentIdx + 1];
      isUpgrade = true;
    }

    // Rolar raridade da runa resultante
    const rankRoll = Math.random() * 100;
    const rank: RuneRank = isGreatSuccess
      ? 'Lendária'
      : rankRoll < 30
      ? 'Lendária'
      : rankRoll < 60
      ? 'Épica'
      : rankRoll < 85
      ? 'Rara'
      : 'Normal';

    const res: FusionResult = {
      tier: outTier,
      rank,
      isUpgrade,
      isGreatSuccess,
    };

    setLastResult(res);
    setFusionHistory((prev) => [res, ...prev.slice(0, 19)]);
    setTotalFusions((prev) => prev + 1);
    if (isUpgrade) {
      setTotalUpgrades((prev) => prev + 1);
    }

    if (isGreatSuccess || (outTier === 'T5' && rank === 'Lendária')) {
      sounds.playLegendaryFanfare();
      confetti({ particleCount: 70, spread: 60 });
    } else if (isUpgrade) {
      sounds.playSuccess();
    } else {
      sounds.playFail();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
        <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-amber-400" />
          Calculadora & Simulador de Fusão de Runas
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Fundir 2 ou 3 runas repetidas ou indesejadas permite tentar a sorte para elevar o tier da runa (ex: transformar runas T3 em T4 ou até T5 através de Grandes Sucessos).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Fusão (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-5">
          <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Configuração das Runas de Sacrifício
          </h4>

          {/* Tier das Runas de Entrada */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
              Tier das Runas a Fundir:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['T1', 'T2', 'T3', 'T4'] as RuneTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setInputTier(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    inputTier === t
                      ? `${TIER_DATA[t].badgeBg} ring-2 ring-amber-400`
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {t} ({TIER_DATA[t].name})
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade de Runas (2 ou 3) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
              Quantidade de Runas no Ritual:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInputCount(2)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  inputCount === 2
                    ? 'bg-amber-950/40 border-amber-400 text-stone-100 ring-1 ring-amber-400'
                    : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}
              >
                <div className="font-bold text-xs">2 Runas ({inputTier})</div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  Taxa de Upgrade: <strong>20%</strong> | Grande Sucesso: <strong>3%</strong>
                </div>
              </button>

              <button
                onClick={() => setInputCount(3)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  inputCount === 3
                    ? 'bg-amber-950/40 border-amber-400 text-stone-100 ring-1 ring-amber-400'
                    : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>3 Runas ({inputTier})</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Recomendado</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  Taxa de Upgrade: <strong>35%</strong> | Grande Sucesso: <strong>8%</strong>
                </div>
              </button>
            </div>
          </div>

          {/* Custo em GP */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
            <span className="text-stone-400">Custo por Fusão:</span>
            <span className="font-bold text-yellow-300 font-mono">
              {formatGP(gpCostPerFusion)}
            </span>
          </div>

          {/* Botão de Fundir */}
          <button
            onClick={handleFuse}
            className="w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Fundir {inputCount}x Runas {inputTier}</span>
          </button>

          {/* Card do Último Resultado */}
          {lastResult && (
            <div
              className={`p-4 rounded-xl border text-center space-y-1.5 transition-all ${
                lastResult.isGreatSuccess
                  ? 'bg-gradient-to-r from-amber-950/70 via-yellow-900/40 to-amber-950/70 border-amber-400 text-amber-300'
                  : lastResult.isUpgrade
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                  : 'bg-stone-950/70 border-stone-800 text-stone-300'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">
                {lastResult.isGreatSuccess
                  ? '🔥 GRANDE SUCESSO CRÍTICO!'
                  : lastResult.isUpgrade
                  ? '✨ Sucesso na Elevação de Tier!'
                  : 'Fusão Concluída (Mesmo Tier)'}
              </div>
              <div className="text-2xl font-black">
                Runa {lastResult.tier} ({lastResult.rank})
              </div>
              <p className="text-xs opacity-80">
                {lastResult.isUpgrade
                  ? `Parabéns! Evoluiu de ${inputTier} para ${lastResult.tier}!`
                  : `Manteve o nível ${lastResult.tier}. Continue tentando para subir de tier.`}
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas e Histórico de Fusão (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Estatísticas da Sessão de Fusão
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-stone-400">Total Fundidas</span>
                <div className="text-2xl font-black text-stone-100 font-mono">
                  {totalFusions}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-stone-400">Subidas de Tier</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {totalUpgrades}
                </div>
                <span className="text-[10px] text-stone-400">
                  {totalFusions > 0 ? `${((totalUpgrades / totalFusions) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Histórico Recente */}
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>Histórico de Fusões</span>
              </h4>
              {fusionHistory.length > 0 && (
                <button
                  onClick={() => setFusionHistory([])}
                  className="text-xs text-stone-400 hover:text-stone-200"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 text-xs">
              {fusionHistory.length === 0 ? (
                <div className="text-stone-400 text-center py-6 italic">
                  Nenhuma fusão realizada ainda.
                </div>
              ) : (
                fusionHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border font-mono text-[11px] ${
                      item.isGreatSuccess
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold'
                        : item.isUpgrade
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-stone-950/70 border-stone-800 text-stone-400'
                    }`}
                  >
                    <span>#{fusionHistory.length - idx}</span>
                    <span className="font-bold">
                      {item.tier} - {item.rank}
                    </span>
                    <span className="text-[10px]">
                      {item.isGreatSuccess
                        ? 'Grande Sucesso'
                        : item.isUpgrade
                        ? 'Upgrade'
                        : 'Comum'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
