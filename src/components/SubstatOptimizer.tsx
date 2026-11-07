import React, { useState } from 'react';
import {
  POSSIBLE_SUBSTATS,
  TIER_DATA,
  SHAPE_DATA,
  RuneTier,
  SubStatInfo,
} from '../data/runeData';
import {
  Sparkles,
  Crosshair,
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const SubstatOptimizer: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<RuneTier>('T5');
  const [currentSlotsFilled, setCurrentSlotsFilled] = useState<number>(1);
  const [currentMetaCount, setCurrentMetaCount] = useState<number>(1);

  const tData = TIER_DATA[selectedTier];

  // Cálculo de chance de rolar sub-atributos meta nos próximos níveis (+6 e +9)
  const remainingSlots = Math.max(0, 3 - currentSlotsFilled);
  const totalSubStats = POSSIBLE_SUBSTATS.length; // 11
  const metaCountTotal = POSSIBLE_SUBSTATS.filter((s) => s.isMeta).length; // 5 meta stats (Crit dmg, Crit rate, Harrier res, Special Atk, MP rec)
  const remainingMetaInPool = Math.max(0, metaCountTotal - currentMetaCount);
  const remainingPool = Math.max(1, totalSubStats - currentSlotsFilled);

  const nextSlotMetaChance = remainingSlots > 0 ? (remainingMetaInPool / remainingPool) * 100 : 0;

  // Chance de preencher todos os slots restantes com meta
  let allRemainingMetaChance = 1.0;
  for (let i = 0; i < remainingSlots; i++) {
    allRemainingMetaChance *= (remainingMetaInPool - i) / (remainingPool - i);
  }
  const allMetaChancePercent = remainingSlots > 0 ? Math.max(0, allRemainingMetaChance * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
        <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-amber-400" />
          Guia de Sub-Atributos & Otimizador de "God-Roll"
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Entenda a importância de cada atributo, os valores máximos obtidos por Tier e como calcular a probabilidade de completar uma runa perfeita para o meta de Harrier e Raids.
        </p>
      </div>

      {/* Calculadora de Próxima Rolagem (+3, +6, +9) */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Calculadora de Rolagem nos Níveis +3, +6 e +9
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Sua runa já possui alguns atributos? Calcule as chances dos próximos slots desbloqueados virem perfeitos:
            </p>
          </div>

          {/* Tier da runa sob análise */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
            <span className="text-xs text-stone-400 px-1">Tier:</span>
            {(['T3', 'T4', 'T5'] as RuneTier[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  selectedTier === t ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Controles de estado atual da Runa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-2 text-xs">
            <label className="text-stone-300 font-bold block">
              Quantos Sub-Atributos a Runa já tem liberados?
            </label>
            <div className="flex gap-2">
              {[0, 1, 2].map((slots) => (
                <button
                  key={slots}
                  onClick={() => {
                    setCurrentSlotsFilled(slots);
                    if (currentMetaCount > slots) setCurrentMetaCount(slots);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                    currentSlotsFilled === slots
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}
                >
                  {slots === 0 ? '0 (Nível +0)' : slots === 1 ? '1 (+3)' : '2 (+6)'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">
              Restam <strong>{remainingSlots}</strong> slot(s) a desbloquear no fortalecimento.
            </p>
          </div>

          <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-2 text-xs">
            <label className="text-stone-300 font-bold block">
              Quantos desses atributos atuais já são META (Crítico / Harrier)?
            </label>
            <div className="flex gap-2">
              {Array.from({ length: currentSlotsFilled + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMetaCount(idx)}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                    currentMetaCount === idx
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}
                >
                  {idx} {idx === 1 ? 'Meta' : 'Metas'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">
              Atributos meta restantes no conjunto: <strong>{remainingMetaInPool}</strong> de {metaCountTotal}.
            </p>
          </div>
        </div>

        {/* Resultados das chances de rolar sub-atributo meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-gradient-to-br from-stone-950 to-amber-950/30 border border-amber-500/30 space-y-1">
            <span className="text-xs text-stone-400 uppercase font-semibold">
              Chance do Próximo Slot vir com Atributo META:
            </span>
            <div className="text-3xl font-black text-amber-300 font-mono">
              {nextSlotMetaChance.toFixed(1)}%
            </div>
            <span className="text-[11px] text-stone-400">
              Aproximadamente 1 em {nextSlotMetaChance > 0 ? (100 / nextSlotMetaChance).toFixed(1) : '∞'} tentativas.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-stone-950 to-purple-950/30 border border-purple-500/30 space-y-1">
            <span className="text-xs text-stone-400 uppercase font-semibold">
              Chance de TODOS os Slots restantes serem META (God-Roll):
            </span>
            <div className="text-3xl font-black text-purple-300 font-mono">
              {allMetaChancePercent.toFixed(2)}%
            </div>
            <span className="text-[11px] text-stone-400">
              {allMetaChancePercent > 0
                ? `1 em ${Math.round(100 / allMetaChancePercent)} runas chegam ao ápice`
                : 'Impossível com a configuração atual'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela Completa de Sub-Atributos com Valores Mínimos e Máximos */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Tabela de Atributos & Variação por Tier ({selectedTier})
          </h4>
          <span className="text-xs text-stone-400">
            Fator de escala do tier: <strong>{tData.baseMainStatT5Factor * 100}%</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
              <tr>
                <th className="py-3 px-3">Sub-Atributo</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Prioridade Meta</th>
                <th className="py-3 px-3 text-amber-400">Variação no {selectedTier}</th>
                <th className="py-3 px-3 text-stone-400">Recomendação no GC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {POSSIBLE_SUBSTATS.map((sub) => {
                const minVal = sub.unit === '%'
                  ? (sub.minValT5 * tData.baseMainStatT5Factor).toFixed(1)
                  : Math.round(sub.minValT5 * tData.baseMainStatT5Factor);
                const maxVal = sub.unit === '%'
                  ? (sub.maxValT5 * tData.baseMainStatT5Factor).toFixed(1)
                  : Math.round(sub.maxValT5 * tData.baseMainStatT5Factor);

                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-stone-850/60 transition-colors ${
                      sub.isMeta ? 'bg-amber-950/15' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-bold text-stone-200 flex items-center gap-1.5">
                      {sub.isMeta && <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      <span>{sub.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.category === 'Ofensivo'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : sub.category === 'Utilitário'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {sub.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {sub.isMeta ? (
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Altíssima (Prioridade 1)
                        </span>
                      ) : (
                        <span className="text-stone-400">Secundária / Situação</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-300 font-mono">
                      +{minVal}{sub.unit} ~ +{maxVal}{sub.unit}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-stone-300 text-[11px]">
                      {sub.id === 'crit_damage'
                        ? 'Obrigatório para atingir o teto de dano em chefes.'
                        : sub.id === 'crit_rate'
                        ? 'Indispensável até alcançar 100% de crítico no boneco.'
                        : sub.id === 'harrier_res'
                        ? 'Crucial para o continente de Harrier e Torre da Extinção.'
                        : sub.id === 'special_atk'
                        ? 'Excelente para classes dependentes de skills de 4ª barra.'
                        : sub.id === 'mp_recovery'
                        ? 'Ótimo para manter rotação ininterrupta de habilidades.'
                        : 'Útil para fechamento de Total Attack e sobrevivência.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Build Recomendada de 5 Runas (Set Perfeito para Endgame) */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-4">
        <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Setup Recomendado dos 5 Formatos de Runas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-200">
              <span>Slot 1: Runa Círculo</span>
              <span className="text-rose-400">Ataque (100%)</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              O atributo principal é sempre Ataque.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-200">
              <span>Slot 2: Runa Triângulo</span>
              <span className="text-amber-400">5 Atributos</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Ataque, Defesa, HP, Ataque Especial e Defesa Especial.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-200">
              <span>Slot 3: Runa Quadrado</span>
              <span className="text-sky-400">6 Atributos</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Ataque, Defesa, HP, Recuperação de MP/AP, Recuperação de HP e Resistência a Contaminação.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-200">
              <span>Slot 4: Runa Pentágono</span>
              <span className="text-emerald-400">6 Atributos</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Ataque, Defesa, HP, Chance de Crítico, Dano Crítico e Resistência a Contaminação.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-200">
              <span>Slot 5: Runa Hexágono</span>
              <span className="text-purple-400">3 Atributos</span>
            </div>
            <p className="text-stone-400 text-[11px]">
              Redução Custo de MP/AP no Contra-Ataque, Dano Crítico Recebido (-) e Resistência a Contaminação.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span>Runa de Habilidade</span>
              <span className="text-red-400">Vermelha (Dano)</span>
            </div>
            <p className="text-amber-200/80 text-[11px]">
              Runa Vermelha Lendária concede +12% de Dano em todas as habilidades, sendo o maior multiplicador isolado do jogo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
