import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  TIER_RANK_MATRIX,
  SHAPE_DATA,
  POSSIBLE_SUBSTATS,
  TIER_DATA,
  getMainStatValue,
  SKILL_RUNE_BOX_RATES,
  SKILL_RUNE_TYPES,
  RUNES_BR_SECONDARY_NAME_TO_ID,
  RuneTier,
  RuneRank,
  RuneShape,
} from '../data/runeData';
import { RuneCard, RuneInstance } from './RuneCard';
import { sounds } from '../utils/soundEffects';
import {
  Box,
  Sparkles,
  RotateCcw,
  Filter,
  CheckCircle2,
  TrendingUp,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

interface PulledSkillRune {
  id: string;
  rank: RuneRank;
  typeId: string;
  name: string;
  effect: string;
  bonus: string;
  color: string;
}

export const ChestGachaSimulator: React.FC = () => {
  const [chestType, setChestType] = useState<'STAT_RUNE' | 'SKILL_RUNE'>('STAT_RUNE');
  const [pulledStatRunes, setPulledStatRunes] = useState<RuneInstance[]>([]);
  const [pulledSkillRunes, setPulledSkillRunes] = useState<PulledSkillRune[]>([]);
  const [totalChestsOpened, setTotalChestsOpened] = useState<number>(0);
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [lastBatch, setLastBatch] = useState<RuneInstance[]>([]);

  // Gerador de Runa Estatística pelo algoritmo KOG
  const rollSingleStatRune = (): RuneInstance => {
    // 1. Rolar Tier & Grau usando a matriz cruzada KOG
    const roll = Math.random() * 100;
    let acc = 0;
    let chosenTier: RuneTier = 'T2';
    let chosenRank: RuneRank = 'Normal';
    let matched = false;

    const tiers: RuneTier[] = ['T1', 'T2', 'T3', 'T4', 'T5'];
    const ranks: RuneRank[] = ['Normal', 'Rara', 'Épica', 'Lendária'];

    for (const t of tiers) {
      for (const r of ranks) {
        acc += TIER_RANK_MATRIX[t][r];
        if (roll <= acc && !matched) {
          chosenTier = t;
          chosenRank = r;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    // 2. Rolar Formato (20% para cada)
    const shapes: RuneShape[] = ['Círculo', 'Quadrado', 'Triângulo', 'Pentágono', 'Hexágono'];
    const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];
    const shapeInfo = SHAPE_DATA[chosenShape];

    // 3. Rolar Atributo Principal do formato
    const mainRoll = Math.random() * 100;
    let mainAcc = 0;
    let chosenMainStat = shapeInfo.primaryStats[0].stat;
    for (const p of shapeInfo.primaryStats) {
      mainAcc += p.probability;
      if (mainRoll <= mainAcc) {
        chosenMainStat = p.stat;
        break;
      }
    }

    // Valor base do atributo principal
    const finalMainStatVal = getMainStatValue(chosenMainStat, chosenTier, chosenRank, chosenShape);

    // 4. Determinar sub-atributos iniciais de acordo com o grau (Lendária já vem com 3, Épica com 2, etc.)
    const startSubStatsCount = chosenRank === 'Lendária' ? 3 : chosenRank === 'Épica' ? 2 : chosenRank === 'Rara' ? 1 : 0;
    const chosenMainCanonical = RUNES_BR_SECONDARY_NAME_TO_ID[chosenMainStat] ?? chosenMainStat;
    const availablePool = POSSIBLE_SUBSTATS.filter((s) => (RUNES_BR_SECONDARY_NAME_TO_ID[s.id] ?? s.id) !== chosenMainCanonical);
    const generatedSubs: RuneInstance['subStats'] = [];

    for (let i = 0; i < startSubStatsCount && availablePool.length > 0; i++) {
      const idx = Math.floor(Math.random() * availablePool.length);
      const chosenSub = availablePool.splice(idx, 1)[0];
      const valRange = chosenSub.maxValT5 - chosenSub.minValT5;
      const rolledVal = chosenSub.minValT5 + Math.random() * valRange * TIER_DATA[chosenTier].baseMainStatT5Factor;
      const rounded = chosenSub.unit === '%' ? Math.round(rolledVal * 10) / 10 : Math.round(rolledVal);

      generatedSubs.push({
        id: chosenSub.id,
        name: chosenSub.name,
        value: rounded,
        unit: chosenSub.unit,
        isMeta: chosenSub.isMeta,
      });
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      tier: chosenTier,
      rank: chosenRank,
      shape: chosenShape,
      level: 0,
      mainStat: {
        name: chosenMainStat,
        value: finalMainStatVal,
      },
      subStats: generatedSubs,
    };
  };

  // Gerador de Runa de Habilidade
  const rollSingleSkillRune = (): PulledSkillRune => {
    const roll = Math.random() * 100;
    let acc = 0;
    let chosenRank: RuneRank = 'Normal';

    for (const r of SKILL_RUNE_BOX_RATES) {
      acc += r.rate;
      if (roll <= acc) {
        chosenRank = r.rank;
        break;
      }
    }

    const type = SKILL_RUNE_TYPES[Math.floor(Math.random() * SKILL_RUNE_TYPES.length)];

    return {
      id: Math.random().toString(36).substring(2, 9),
      rank: chosenRank,
      typeId: type.id,
      name: type.name,
      effect: type.effect,
      bonus: type.bonus[chosenRank],
      color: type.color,
    };
  };

  // Abrir N baús
  const handleOpenChests = (count: number) => {
    if (isOpening) return;
    setIsOpening(true);
    sounds.playChestOpen();

    let hasT5Legendary = false;
    let hasLegendary = false;

    if (chestType === 'STAT_RUNE') {
      const newRunes: RuneInstance[] = [];
      for (let i = 0; i < count; i++) {
        const r = rollSingleStatRune();
        newRunes.push(r);
        if (r.rank === 'Lendária') hasLegendary = true;
        if (r.tier === 'T5' && r.rank === 'Lendária') hasT5Legendary = true;
      }

      setPulledStatRunes((prev) => [...newRunes, ...prev]);
      setLastBatch(newRunes.slice(0, 10)); // mostrar últimas 10 na prévia rápida
      setTotalChestsOpened((prev) => prev + count);
    } else {
      const newSkills: PulledSkillRune[] = [];
      for (let i = 0; i < count; i++) {
        const sk = rollSingleSkillRune();
        newSkills.push(sk);
        if (sk.rank === 'Lendária') hasLegendary = true;
      }

      setPulledSkillRunes((prev) => [...newSkills, ...prev]);
      setTotalChestsOpened((prev) => prev + count);
    }

    if (hasT5Legendary) {
      sounds.playLegendaryFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else if (hasLegendary) {
      sounds.playSuccess();
    }

    window.setTimeout(() => {
      setIsOpening(false);
    }, 250);
  };

  // Abrir até vir T5 Lendária (com limite de segurança de 2.000 baús)
  const handleOpenUntilT5Legendary = () => {
    if (isOpening) return;
    setIsOpening(true);

    const newRunes: RuneInstance[] = [];
    let count = 0;
    let found = false;

    while (count < 2000 && !found) {
      count++;
      const r = rollSingleStatRune();
      newRunes.push(r);
      if (r.tier === 'T5' && r.rank === 'Lendária') {
        found = true;
      }
    }

    setPulledStatRunes((prev) => [...newRunes, ...prev]);
    setLastBatch(newRunes.slice(-10));
    setTotalChestsOpened((prev) => prev + count);

    if (found) {
      sounds.playLegendaryFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } else {
      sounds.playFail();
    }

    setIsOpening(false);
  };

  // Limpar inventário simulado
  const handleClear = () => {
    setPulledStatRunes([]);
    setPulledSkillRunes([]);
    setLastBatch([]);
    setTotalChestsOpened(0);
  };

  // Estatísticas do inventário simulado
  const t5Count = pulledStatRunes.filter((r) => r.tier === 'T5').length;
  const t5LegendaryCount = pulledStatRunes.filter((r) => r.tier === 'T5' && r.rank === 'Lendária').length;
  const legendaryCount = chestType === 'STAT_RUNE'
    ? pulledStatRunes.filter((r) => r.rank === 'Lendária').length
    : pulledSkillRunes.filter((r) => r.rank === 'Lendária').length;

  // Filtragem
  const filteredStatRunes = pulledStatRunes.filter((r) => {
    if (filterRank !== 'ALL' && r.rank !== filterRank) return false;
    if (filterTier !== 'ALL' && r.tier !== filterTier) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Baú e Abertura */}
      <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Box className="w-5 h-5 text-amber-400" />
              Simulador de Abertura de Baús de Runas (Gacha Oficial)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Abra pacotes de baús e veja se você consegue tirar a raríssima T5 Lendária (taxa oficial de 0.1500%).
            </p>
          </div>

          {/* Alternar tipo de baú */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setChestType('STAT_RUNE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chestType === 'STAT_RUNE'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Baú de Runas de Status
            </button>
            <button
              onClick={() => setChestType('SKILL_RUNE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chestType === 'SKILL_RUNE'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Baú de Runas de Habilidade
            </button>
          </div>
        </div>

        {/* Botões de Ação de Abertura */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            disabled={isOpening}
            onClick={() => handleOpenChests(1)}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            Abrir 1x Baú
          </button>
          <button
            disabled={isOpening}
            onClick={() => handleOpenChests(10)}
            className="flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            Abrir 10x Baús
          </button>
          <button
            disabled={isOpening}
            onClick={() => handleOpenChests(100)}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-stone-950 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            Abrir 100x Baús
          </button>
          {chestType === 'STAT_RUNE' && (
            <button
              disabled={isOpening}
              onClick={handleOpenUntilT5Legendary}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Abrir até vir T5 Lendária</span>
            </button>
          )}

          <button
            onClick={handleClear}
            className="py-3 px-3 rounded-xl border border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200 text-xs transition-all"
            title="Limpar Baús e Estatísticas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Estatísticas Acumuladas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-1">
          <span className="text-stone-400 font-medium">Baús Abertos</span>
          <div className="text-2xl font-black text-stone-100 font-mono">
            {totalChestsOpened.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-stone-400">Total acumulado</span>
        </div>

        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-1">
          <span className="text-stone-400 font-medium">Lendárias Obtidas</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {legendaryCount}
          </div>
          <span className="text-[11px] text-stone-400">
            {totalChestsOpened > 0 ? `${((legendaryCount / totalChestsOpened) * 100).toFixed(2)}%` : '0%'} (KOG: ~27%)
          </span>
        </div>

        {chestType === 'STAT_RUNE' ? (
          <>
            <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-1">
              <span className="text-stone-400 font-medium">Total de Tier 5 (T5)</span>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {t5Count}
              </div>
              <span className="text-[11px] text-stone-400">
                {totalChestsOpened > 0 ? `${((t5Count / totalChestsOpened) * 100).toFixed(2)}%` : '0%'} (KOG: 7.65%)
              </span>
            </div>

            <div className="bg-stone-900/60 p-4 rounded-xl border border-amber-500/40 bg-amber-950/15 space-y-1">
              <span className="text-amber-200 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> T5 Lendária
              </span>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {t5LegendaryCount}
              </div>
              <span className="text-[11px] text-amber-300/80">
                {totalChestsOpened > 0 ? `${((t5LegendaryCount / totalChestsOpened) * 100).toFixed(3)}%` : '0%'} (KOG: 0.15%)
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-1">
              <span className="text-stone-400 font-medium">Épicas Obtidas</span>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {pulledSkillRunes.filter((r) => r.rank === 'Épica').length}
              </div>
              <span className="text-[11px] text-stone-400">KOG: 20.0%</span>
            </div>
            <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-1">
              <span className="text-stone-400 font-medium">Raras Obtidas</span>
              <div className="text-2xl font-black text-sky-400 font-mono">
                {pulledSkillRunes.filter((r) => r.rank === 'Rara').length}
              </div>
              <span className="text-[11px] text-stone-400">KOG: 50.0%</span>
            </div>
          </>
        )}
      </div>

      {/* Grid de Runas Obtidas */}
      {chestType === 'STAT_RUNE' ? (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/40 p-3 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filtrar:
              </span>

              {/* Filtro por Grau */}
              <select
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded px-2.5 py-1"
              >
                <option value="ALL">Todos os Graus</option>
                <option value="Lendária">Apenas Lendárias</option>
                <option value="Épica">Apenas Épicas</option>
                <option value="Rara">Apenas Raras</option>
                <option value="Normal">Apenas Normais</option>
              </select>

              {/* Filtro por Tier */}
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded px-2.5 py-1"
              >
                <option value="ALL">Todos os Tiers</option>
                <option value="T5">Tier 5 (T5)</option>
                <option value="T4">Tier 4 (T4)</option>
                <option value="T3">Tier 3 (T3)</option>
                <option value="T2">Tier 2 (T2)</option>
                <option value="T1">Tier 1 (T1)</option>
              </select>
            </div>

            <div className="text-xs text-stone-400">
              Mostrando <strong>{filteredStatRunes.length}</strong> de {pulledStatRunes.length} runas
            </div>
          </div>

          {/* Cards das Runas */}
          {filteredStatRunes.length === 0 ? (
            <div className="bg-stone-900/40 rounded-2xl border border-stone-800 p-12 text-center text-stone-400 space-y-2">
              <Box className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="text-sm font-semibold text-stone-300">Nenhuma runa no inventário ainda</p>
              <p className="text-xs">
                Clique nos botões acima para abrir baús de invocação de runa!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[700px] overflow-y-auto pr-2">
              {filteredStatRunes.slice(0, 48).map((rune) => (
                <RuneCard key={rune.id} rune={rune} compact={true} highlightGodRoll={true} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Visualização de Runas de Habilidade */
        <div className="space-y-4">
          {pulledSkillRunes.length === 0 ? (
            <div className="bg-stone-900/40 rounded-2xl border border-stone-800 p-12 text-center text-stone-400 space-y-2">
              <Box className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="text-sm font-semibold text-stone-300">Nenhuma runa de habilidade aberta</p>
              <p className="text-xs">
                Clique em "Abrir 10x Baús" para tirar runas vermelhas, azuis e amarelas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[700px] overflow-y-auto pr-2">
              {pulledSkillRunes.slice(0, 48).map((sk) => (
                <div
                  key={sk.id}
                  className={`p-3.5 rounded-xl border ${sk.color} space-y-2 relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-100 truncate">{sk.name}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-stone-950/80 border border-stone-800">
                      {sk.rank}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300">{sk.effect}</p>
                  <div className="text-right text-xs font-black font-mono text-amber-300">
                    Bônus: {sk.bonus}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
