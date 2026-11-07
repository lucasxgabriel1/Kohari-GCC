import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import {
  POSSIBLE_SUBSTATS,
  TIER_DATA,
  SHAPE_DATA,
  getMainStatValue,
  getMainStatUnit,
  getSecondaryStatValue,
  getSubStatUpgradeStep,
  getRankUpgradeSummary,
  RUNES_BR_SECONDARY_NAME_TO_ID,
  RuneTier,
  RuneRank,
  RuneShape,
} from '../data/runeData';
import { sounds } from '../utils/soundEffects';

interface SubStatEntry {
  id: string;
  name: string;
  value: number;
  unit: string;
  isMeta?: boolean;
}

interface ConfigurableRune {
  tier: RuneTier;
  rank: RuneRank;
  shape: RuneShape;
  level: number;
  mainStatName: string;
  mainStatValue: number;
  subStats: SubStatEntry[];
}

// Obter ID canônico (ex: 'Ataque' -> 'attack', 'HP' -> 'hp')
const getCanonicalStatId = (nameOrId: string): string => {
  return RUNES_BR_SECONDARY_NAME_TO_ID[nameOrId] ?? nameOrId;
};

// Resolver automaticamente colisões caso um sub-atributo coincida com o atributo principal
const resolveSubStatCollisions = (
  mainStatName: string,
  subStats: SubStatEntry[],
  tier: RuneTier,
  rank: RuneRank
): SubStatEntry[] => {
  const primaryCanonical = getCanonicalStatId(mainStatName);
  const updated: SubStatEntry[] = [];

  for (let i = 0; i < subStats.length; i++) {
    const currentSub = subStats[i];
    const currentCanonical = getCanonicalStatId(currentSub.id);

    const isConflict =
      currentCanonical === primaryCanonical ||
      updated.some((s) => getCanonicalStatId(s.id) === currentCanonical);

    if (!isConflict) {
      updated.push(currentSub);
    } else {
      const usedCanonicals = new Set([
        primaryCanonical,
        ...updated.map((s) => getCanonicalStatId(s.id)),
      ]);
      const replacement = POSSIBLE_SUBSTATS.find(
        (opt) => !usedCanonicals.has(getCanonicalStatId(opt.id))
      );

      if (replacement) {
        const step = getSubStatUpgradeStep(rank, i);
        updated.push({
          id: replacement.id,
          name: replacement.name,
          value: getSecondaryStatValue(replacement.id, tier, step),
          unit: replacement.unit,
          isMeta: replacement.isMeta,
        });
      } else {
        updated.push(currentSub);
      }
    }
  }

  return updated;
};

export const RuneComparator: React.FC = () => {
  // Runa 1 (Equipada / Atual) - T4 Épica (3 melhorias: 1º slot +2, 2º slot +1, 3º slot +0)
  // Sub-atributos não duplicam o atributo principal ('Ataque Especial')
  const [rune1, setRune1] = useState<ConfigurableRune>(() => ({
    tier: 'T4',
    rank: 'Épica',
    shape: 'Triângulo',
    level: 9,
    mainStatName: 'Ataque Especial',
    mainStatValue: getMainStatValue('Ataque Especial', 'T4', 'Épica', 'Triângulo'),
    subStats: [
      { id: 'crit_damage', name: 'Dano Crítico', value: getSecondaryStatValue('crit_damage', 'T4', getSubStatUpgradeStep('Épica', 0)), unit: '%', isMeta: true },
      { id: 'attack', name: 'Ataque', value: getSecondaryStatValue('attack', 'T4', getSubStatUpgradeStep('Épica', 1)), unit: '', isMeta: true },
      { id: 'crit_rate', name: 'Aumento de Chance de Crítico', value: getSecondaryStatValue('crit_rate', 'T4', getSubStatUpgradeStep('Épica', 2)), unit: '%', isMeta: false },
    ],
  }));

  // Runa 2 (Comparação / Nova) - T5 Lendária (4 melhorias: 1º slot +2, 2º slot +2, 3º slot +0)
  // Sub-atributos não duplicam o atributo principal ('Ataque Especial')
  const [rune2, setRune2] = useState<ConfigurableRune>(() => ({
    tier: 'T5',
    rank: 'Lendária',
    shape: 'Triângulo',
    level: 9,
    mainStatName: 'Ataque Especial',
    mainStatValue: getMainStatValue('Ataque Especial', 'T5', 'Lendária', 'Triângulo'),
    subStats: [
      { id: 'crit_damage', name: 'Dano Crítico', value: getSecondaryStatValue('crit_damage', 'T5', getSubStatUpgradeStep('Lendária', 0)), unit: '%', isMeta: true },
      { id: 'attack', name: 'Ataque', value: getSecondaryStatValue('attack', 'T5', getSubStatUpgradeStep('Lendária', 1)), unit: '', isMeta: true },
      { id: 'harrier_res', name: 'Resistência a Contaminação', value: getSecondaryStatValue('harrier_res', 'T5', getSubStatUpgradeStep('Lendária', 2)), unit: '%', isMeta: false },
    ],
  }));

  // Cálculo do valor padrão do Atributo Principal com base no Nome do Atributo, Formato, Tier e Raridade
  const calculateDefaultMainStatValue = (
    statName: string,
    tier: RuneTier,
    rank: RuneRank,
    shape: RuneShape
  ): number => {
    return getMainStatValue(statName, tier, rank, shape);
  };

  // Atualizar campo da Runa 1 (sempre recalculando os valores fixos oficiais)
  const updateRune1 = (updater: (prev: ConfigurableRune) => ConfigurableRune) => {
    setRune1((prev) => {
      const updated = updater(prev);
      updated.mainStatValue = calculateDefaultMainStatValue(
        updated.mainStatName,
        updated.tier,
        updated.rank,
        updated.shape
      );
      return updated;
    });
  };

  // Atualizar campo da Runa 2 (sempre recalculando os valores fixos oficiais)
  const updateRune2 = (updater: (prev: ConfigurableRune) => ConfigurableRune) => {
    setRune2((prev) => {
      const updated = updater(prev);
      updated.mainStatValue = calculateDefaultMainStatValue(
        updated.mainStatName,
        updated.tier,
        updated.rank,
        updated.shape
      );
      return updated;
    });
  };

  // Renderizador do editor individual
  const renderRuneEditor = (
    rune: ConfigurableRune,
    updateFn: (updater: (prev: ConfigurableRune) => ConfigurableRune) => void,
    runeIndex: 1 | 2
  ) => {
    const isRune1 = runeIndex === 1;
    const label = isRune1 ? 'Runa 1 (Equipada / Atual)' : 'Runa 2 (Nova / Mochila)';
    const primaryShapeStats = SHAPE_DATA[rune.shape].primaryStats.map((p) => p.stat);

    const addSubStat = () => {
      const primaryCanonical = getCanonicalStatId(rune.mainStatName);
      const existingCanonicals = new Set([
        primaryCanonical,
        ...rune.subStats.map((s) => getCanonicalStatId(s.id)),
      ]);
      const available = POSSIBLE_SUBSTATS.filter(
        (s) => !existingCanonicals.has(getCanonicalStatId(s.id))
      );
      if (available.length === 0) return;
      const first = available[0];
      const newSlotIdx = rune.subStats.length;
      const step = getSubStatUpgradeStep(rune.rank, newSlotIdx);
      const defaultVal = getSecondaryStatValue(first.id, rune.tier, step);

      updateFn((prev) => ({
        ...prev,
        subStats: [
          ...prev.subStats,
          {
            id: first.id,
            name: first.name,
            value: defaultVal,
            unit: first.unit,
            isMeta: first.isMeta,
          },
        ],
      }));
    };

    const removeSubStat = (idxToRemove: number) => {
      updateFn((prev) => {
        const filtered = prev.subStats.filter((_, i) => i !== idxToRemove);
        return {
          ...prev,
          subStats: filtered.map((sub, sIdx) => ({
            ...sub,
            value: getSecondaryStatValue(sub.id, prev.tier, getSubStatUpgradeStep(prev.rank, sIdx)),
          })),
        };
      });
    };

    const changeSubStatType = (idx: number, newId: string) => {
      const found = POSSIBLE_SUBSTATS.find((s) => s.id === newId);
      if (!found) return;
      const step = getSubStatUpgradeStep(rune.rank, idx);
      const defaultVal = getSecondaryStatValue(found.id, rune.tier, step);

      updateFn((prev) => {
        const copy = [...prev.subStats];
        copy[idx] = {
          id: found.id,
          name: found.name,
          value: defaultVal,
          unit: found.unit,
          isMeta: found.isMeta,
        };
        return { ...prev, subStats: copy };
      });
    };

    return (
      <div className="bg-stone-900/80 border-2 border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Topo do Editor */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                isRune1
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              {runeIndex}
            </span>
            <h4 className="text-sm font-bold text-stone-100">{label}</h4>
          </div>
        </div>

        {/* 1. Seletores: Tier, Grau e Formato */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400 block">Tier:</label>
            <select
              value={rune.tier}
              onChange={(e) => {
                const newTier = e.target.value as RuneTier;
                updateFn((prev) => ({
                  ...prev,
                  tier: newTier,
                  subStats: prev.subStats.map((sub, sIdx) => ({
                    ...sub,
                    value: getSecondaryStatValue(sub.id, newTier, getSubStatUpgradeStep(prev.rank, sIdx)),
                  })),
                }));
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              {(['T1', 'T2', 'T3', 'T4', 'T5'] as RuneTier[]).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400 block">Raridade:</label>
            <select
              value={rune.rank}
              onChange={(e) => {
                const newRank = e.target.value as RuneRank;
                updateFn((prev) => ({
                  ...prev,
                  rank: newRank,
                  subStats: prev.subStats.map((sub, sIdx) => ({
                    ...sub,
                    value: getSecondaryStatValue(sub.id, prev.tier, getSubStatUpgradeStep(newRank, sIdx)),
                  })),
                }));
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              {(['Normal', 'Rara', 'Épica', 'Lendária'] as RuneRank[]).map((r) => (
                <option key={r} value={r}>
                  {r === 'Normal' ? 'Comum / Normal' : r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400 block">Formato:</label>
            <select
              value={rune.shape}
              onChange={(e) => {
                const newShape = e.target.value as RuneShape;
                const defaultMainStat = SHAPE_DATA[newShape].primaryStats[0].stat;
                updateFn((prev) => ({
                  ...prev,
                  shape: newShape,
                  mainStatName: defaultMainStat,
                  subStats: resolveSubStatCollisions(defaultMainStat, prev.subStats, prev.tier, prev.rank),
                }));
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              {(['Círculo', 'Triângulo', 'Quadrado', 'Pentágono', 'Hexágono'] as RuneShape[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Atributo Principal (Valor Fixo Oficial) */}
        <div className="space-y-1.5 bg-stone-950/70 p-3 rounded-xl border border-stone-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-300">Atributo Principal:</span>
            <span className="text-[10px] text-stone-500 font-medium">Valor Fixo Oficial</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <select
              value={primaryShapeStats.includes(rune.mainStatName) ? rune.mainStatName : primaryShapeStats[0]}
              onChange={(e) => {
                const newStat = e.target.value;
                updateFn((prev) => ({
                  ...prev,
                  mainStatName: newStat,
                  subStats: resolveSubStatCollisions(newStat, prev.subStats, prev.tier, prev.rank),
                }));
              }}
              className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              {primaryShapeStats.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <div className="w-full bg-stone-900/90 border border-stone-700/80 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-amber-300 text-right flex items-center justify-end select-none shadow-inner">
              +{rune.mainStatValue}{getMainStatUnit(rune.mainStatName)}
            </div>
          </div>
        </div>

        {/* 3. Sub-Atributos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-stone-300">
                Sub-Atributos ({rune.subStats.length}/3):
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                ({getRankUpgradeSummary(rune.rank)})
              </span>
            </div>
            {rune.subStats.length < 3 && (
              <button
                type="button"
                onClick={addSubStat}
                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-950 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar</span>
              </button>
            )}
          </div>

          {rune.subStats.length === 0 ? (
            <div className="p-3 text-center rounded-xl bg-stone-950/40 border border-dashed border-stone-800 text-xs text-stone-500">
              Nenhum sub-atributo ativo. Clique em "Adicionar" acima.
            </div>
          ) : (
            <div className="space-y-1.5">
              {rune.subStats.map((sub, idx) => {
                const upgradeStep = getSubStatUpgradeStep(rune.rank, idx);
                const fixedVal = getSecondaryStatValue(sub.id, rune.tier, upgradeStep);
                return (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-stone-950 border border-stone-800/90 flex items-center justify-between gap-2 text-xs"
                  >
                    <select
                      value={sub.id}
                      onChange={(e) => changeSubStatType(idx, e.target.value)}
                      className="bg-stone-900 border border-stone-700/80 rounded-lg px-2 py-1 text-xs text-stone-200 flex-1 focus:outline-none focus:border-amber-400 truncate"
                    >
                      {POSSIBLE_SUBSTATS.map((opt) => {
                        const primaryCanonical = getCanonicalStatId(rune.mainStatName);
                        const optCanonical = getCanonicalStatId(opt.id);
                        const isPrimary = optCanonical === primaryCanonical;
                        const isSelectedElsewhere = rune.subStats.some(
                          (s, sIdx) => sIdx !== idx && getCanonicalStatId(s.id) === optCanonical
                        );
                        const isDisabled = isPrimary || isSelectedElsewhere;

                        let tag = '';
                        if (isPrimary) {
                          tag = ' (Atributo Principal)';
                        } else if (isSelectedElsewhere) {
                          tag = ' (Já selecionado)';
                        }

                        return (
                          <option
                            key={opt.id}
                            value={opt.id}
                            disabled={isDisabled}
                            className={isDisabled ? 'text-stone-600 bg-stone-950 font-normal' : 'text-stone-200'}
                          >
                            {opt.name} {opt.isMeta ? '⭐' : ''}{tag}
                          </option>
                        );
                      })}
                    </select>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border select-none ${
                          upgradeStep === 2
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : upgradeStep === 1
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                            : 'bg-stone-800/60 text-stone-400 border-stone-700/60'
                        }`}
                        title={`${upgradeStep} melhoria(s) extra(s) aplicadas neste slot`}
                      >
                        +{upgradeStep}
                      </span>

                      <div className="min-w-[4.75rem] bg-stone-900/90 border border-stone-700/80 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-300 text-right select-none shadow-inner">
                        +{fixedVal}{sub.unit}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSubStat(idx)}
                        className="p-1 rounded-md text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Remover este sub-atributo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* CONFIGURADORES INTERATIVOS DAS DUAS RUNAS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            Configuradores Interativos das Runas
          </h4>
          <span className="text-xs text-stone-400">
            Ajuste tiers, refinos e sub-atributos
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {renderRuneEditor(rune1, updateRune1, 1)}
          {renderRuneEditor(rune2, updateRune2, 2)}
        </div>
      </div>
    </div>
  );
};
