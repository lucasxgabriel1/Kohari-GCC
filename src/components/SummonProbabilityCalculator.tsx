import React, { useState, useMemo } from 'react';
import {
  TIER_DATA,
  RANK_DATA,
  SHAPE_DATA,
  POSSIBLE_SUBSTATS,
  TIER_RANK_MATRIX,
  SKILL_RUNE_BOX_RATES,
  SKILL_RUNE_TYPES,
  RuneTier,
  RuneRank,
  RuneShape,
} from '../data/runeData';
import {
  chestsNeededForConfidence,
  chanceInNAttempts,
} from '../utils/probabilityMath';
import {
  Sparkles,
  Calculator,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Percent,
  Box,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const SummonProbabilityCalculator: React.FC = () => {
  // Configuração da Runa Desejada
  const [selectedTier, setSelectedTier] = useState<RuneTier | 'ANY'>('T5');
  const [selectedRank, setSelectedRank] = useState<RuneRank | 'ANY'>('Lendária');
  const [selectedShape, setSelectedShape] = useState<RuneShape | 'ANY'>('Triângulo');
  const [selectedMainStat, setSelectedMainStat] = useState<string>('ANY');
  const [selectedSubStats, setSelectedSubStats] = useState<string[]>(['crit_damage', 'crit_rate']);
  const [simulatedChests, setSimulatedChests] = useState<number>(100);

  // Tab interna para alternar entre Calculadora de God-Roll e Tabela Oficial KOG
  const [activeTab, setActiveTab] = useState<'calculator' | 'official_tables' | 'skill_runes'>('calculator');
  const [tableFilterTier, setTableFilterTier] = useState<string>('ALL');

  // Atualizar opções de atributo principal quando o formato muda
  const availableMainStats = useMemo(() => {
    if (selectedShape === 'ANY') {
      const stats = new Set<string>();
      Object.values(SHAPE_DATA).forEach((s) => s.primaryStats.forEach((p) => stats.add(p.stat)));
      return Array.from(stats);
    }
    return SHAPE_DATA[selectedShape].primaryStats.map((p) => p.stat);
  }, [selectedShape]);

  // Cálculo da probabilidade exata composta
  const calculatedProbability = useMemo(() => {
    let pTierRank = 0;

    if (selectedTier === 'ANY' && selectedRank === 'ANY') {
      pTierRank = 1.0;
    } else if (selectedTier === 'ANY') {
      pTierRank = (RANK_DATA[selectedRank as RuneRank]?.probability || 0) / 100;
    } else if (selectedRank === 'ANY') {
      pTierRank = (TIER_DATA[selectedTier as RuneTier]?.probability || 0) / 100;
    } else {
      // Valor da matriz cruzada KOG
      pTierRank = (TIER_RANK_MATRIX[selectedTier][selectedRank] || 0) / 100;
    }

    if (pTierRank <= 0) {
      return {
        totalPercent: 0,
        oneInN: Infinity,
        tierRankPercent: 0,
        shapePercent: 0,
        mainStatPercent: 0,
        subStatPercent: 0,
      };
    }

    // Probabilidade do Formato (20% por padrão)
    const pShape = selectedShape === 'ANY' ? 1.0 : (SHAPE_DATA[selectedShape].probability / 100);

    // Probabilidade do Atributo Principal
    let pMainStat = 1.0;
    if (selectedMainStat !== 'ANY') {
      if (selectedShape === 'ANY') {
        pMainStat = 0.25; // média aproximada
      } else {
        const found = SHAPE_DATA[selectedShape].primaryStats.find((p) => p.stat === selectedMainStat);
        pMainStat = found ? (found.probability / 100) : 0;
      }
    }

    // Probabilidade dos Sub-Atributos Desejados
    let pSubStats = 1.0;
    if (selectedSubStats.length > 0) {
      const numChosen = selectedSubStats.length;
      const totalPool = POSSIBLE_SUBSTATS.length; // 11
      const slots = selectedTier === 'T1' ? 1 : selectedTier === 'T2' ? 2 : 3;

      if (numChosen > slots) {
        pSubStats = 0; // impossível ter mais substats do que slots suportados
      } else {
        // Probabilidade hipergeométrica simplificada de rolar os sub-atributos escolhidos
        let probAcc = 1.0;
        for (let i = 0; i < numChosen; i++) {
          probAcc *= (slots - i) / (totalPool - i);
        }
        pSubStats = probAcc;
      }
    }

    const totalProbability = pTierRank * pShape * pMainStat * pSubStats;
    const totalPercent = totalProbability * 100;
    const oneInN = totalProbability > 0 ? Math.round(1 / totalProbability) : Infinity;

    return {
      totalPercent,
      oneInN,
      tierRankPercent: pTierRank * 100,
      shapePercent: pShape * 100,
      mainStatPercent: pMainStat * 100,
      subStatPercent: pSubStats * 100,
    };
  }, [selectedTier, selectedRank, selectedShape, selectedMainStat, selectedSubStats]);

  // Alternar seleção de sub-atributos
  const toggleSubStat = (id: string) => {
    setSelectedSubStats((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]; // Limite máximo de 3 sub-atributos por runa
      }
      return [...prev, id];
    });
  };

  // Níveis de confiança em número de baús
  const conf50 = chestsNeededForConfidence(calculatedProbability.totalPercent, 0.5);
  const conf75 = chestsNeededForConfidence(calculatedProbability.totalPercent, 0.75);
  const conf90 = chestsNeededForConfidence(calculatedProbability.totalPercent, 0.9);
  const conf95 = chestsNeededForConfidence(calculatedProbability.totalPercent, 0.95);
  const conf99 = chestsNeededForConfidence(calculatedProbability.totalPercent, 0.99);

  // Chance de tirar em N baús simulados
  const chanceInSelectedChests = chanceInNAttempts(calculatedProbability.totalPercent, simulatedChests);

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculadora de God-Roll
          </button>
          <button
            onClick={() => setActiveTab('official_tables')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'official_tables'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Tabelas Oficiais KOG (Baú Avançado)
          </button>
          <button
            onClick={() => setActiveTab('skill_runes')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'skill_runes'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Box className="w-4 h-4" />
            Runas de Habilidade
          </button>
        </div>

        <div className="text-xs text-stone-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Baseado nos dados oficiais KOG Games Grand Chase Classic</span>
        </div>
      </div>

      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna de Configuração da Runa Alvo (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Defina a Runa Desejada
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Selecione as características da runa para descobrir a probabilidade exata ao abrir Baús de Invocação de Runa Avançada.
              </p>
            </div>

            {/* Seleção de Tier */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
                1. Tier da Runa
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <button
                  onClick={() => setSelectedTier('ANY')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    selectedTier === 'ANY'
                      ? 'bg-stone-200 text-stone-950 border-stone-100 ring-2 ring-stone-400'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  Qualquer
                </button>
                {(['T1', 'T2', 'T3', 'T4', 'T5'] as RuneTier[]).map((t) => {
                  const tData = TIER_DATA[t];
                  const isSelected = selectedTier === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTier(t)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? `${tData.badgeBg} ring-2 ring-amber-400`
                          : 'bg-stone-950/60 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <span>{t}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{tData.probability}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Grau / Raridade */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
                2. Grau / Raridade
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={() => setSelectedRank('ANY')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    selectedRank === 'ANY'
                      ? 'bg-stone-200 text-stone-950 border-stone-100 ring-2 ring-stone-400'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  Qualquer
                </button>
                {(['Normal', 'Rara', 'Épica', 'Lendária'] as RuneRank[]).map((r) => {
                  const rData = RANK_DATA[r];
                  const isSelected = selectedRank === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setSelectedRank(r)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? `bg-stone-800 border-amber-400 text-amber-300 ring-2 ring-amber-400/50`
                          : `bg-stone-950/60 ${rData.textColor} border-stone-800 hover:border-stone-700`
                      }`}
                    >
                      <span>{r}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{rData.probability}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Formato */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 block">
                3. Formato da Runa (Cada um tem 20% de chance)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setSelectedShape('ANY');
                    setSelectedMainStat('ANY');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold border text-left transition-all ${
                    selectedShape === 'ANY'
                      ? 'bg-stone-200 text-stone-950 border-stone-100 ring-2 ring-stone-400'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  Qualquer Formato
                </button>
                {(['Círculo', 'Quadrado', 'Triângulo', 'Pentágono', 'Hexágono'] as RuneShape[]).map((s) => {
                  const sData = SHAPE_DATA[s];
                  const isSelected = selectedShape === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedShape(s);
                        setSelectedMainStat('ANY');
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-950/50 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                          : 'bg-stone-950/60 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{s}</div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[110px]">
                          {s === 'Círculo' ? 'Ataque' : s === 'Quadrado' ? 'Defesa' : s === 'Pentágono' ? 'HP' : 'Híbrido'}
                        </div>
                      </div>
                      <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Atributo Principal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  4. Atributo Principal
                </label>
                {selectedShape !== 'ANY' && (
                  <span className="text-[11px] text-stone-400">
                    Formato: <strong className="text-stone-300">{selectedShape}</strong>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedMainStat('ANY')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                    selectedMainStat === 'ANY'
                      ? 'bg-stone-200 text-stone-950 border-stone-100 font-bold'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800'
                  }`}
                >
                  Qualquer
                </button>
                {availableMainStats.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedMainStat(st)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      selectedMainStat === st
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-stone-950/60 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Sub-Atributos Desejados (Meta) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  5. Sub-Atributos Desejados (Máx. 3)
                </label>
                <span className="text-xs text-amber-400 font-semibold">
                  {selectedSubStats.length} de 3 selecionados
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {POSSIBLE_SUBSTATS.map((sub) => {
                  const isChecked = selectedSubStats.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubStat(sub.id)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs border text-left transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-semibold'
                          : 'bg-stone-950/40 border-stone-800/80 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-amber-400 border-amber-300 text-stone-950'
                              : 'border-stone-700 bg-stone-900'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{sub.name}</span>
                      </div>
                      {sub.isMeta && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-amber-900/60 text-amber-300 font-bold ml-1">
                          META
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna de Resultados e Estatísticas (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card Principal de Probabilidade */}
            <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 p-5 rounded-2xl border border-amber-500/30 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Probabilidade Exata
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono text-[11px]">
                  KOG Rate
                </span>
              </div>

              {/* Valor de destaque */}
              <div className="my-3">
                <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight flex items-baseline gap-1">
                  <span>
                    {calculatedProbability.totalPercent < 0.0001 && calculatedProbability.totalPercent > 0
                      ? calculatedProbability.totalPercent.toExponential(3)
                      : calculatedProbability.totalPercent.toFixed(4)}
                    %
                  </span>
                </div>
                <div className="text-sm font-semibold text-stone-300 mt-1">
                  {calculatedProbability.oneInN === Infinity ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Combinação Impossível (ex: T1 com mais de 1 sub-atributo)
                    </span>
                  ) : (
                    <span>
                      Aproximadamente <strong className="text-amber-300 font-bold">1 em {calculatedProbability.oneInN.toLocaleString('pt-BR')}</strong> baús
                    </span>
                  )}
                </div>
              </div>

              {/* Decomposição dos fatores multiplicativos */}
              <div className="space-y-1.5 pt-3 border-t border-stone-800 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Tier & Grau ({selectedTier} {selectedRank}):</span>
                  <span className="text-stone-200 font-mono font-medium">
                    {calculatedProbability.tierRankPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Formato ({selectedShape}):</span>
                  <span className="text-stone-200 font-mono font-medium">
                    {calculatedProbability.shapePercent.toFixed(1)}%
                  </span>
                </div>
                {selectedMainStat !== 'ANY' && (
                  <div className="flex justify-between text-stone-400">
                    <span>Atributo Principal ({selectedMainStat}):</span>
                    <span className="text-stone-200 font-mono font-medium">
                      {calculatedProbability.mainStatPercent.toFixed(1)}%
                    </span>
                  </div>
                )}
                {selectedSubStats.length > 0 && (
                  <div className="flex justify-between text-stone-400">
                    <span>Sub-Atributos ({selectedSubStats.length} escolhidos):</span>
                    <span className="text-stone-200 font-mono font-medium">
                      {calculatedProbability.subStatPercent.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantos baús preciso abrir? (Tabela de Confiança) */}
            <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2 mb-1">
                <Box className="w-4 h-4 text-amber-400" />
                Quantos Baús para ter Certeza?
              </h4>
              <p className="text-xs text-stone-400 mb-3">
                Número de Baús de Invocação Avançados necessários para atingir cada nível de certeza estatística:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="font-medium text-stone-300">50% de Certeza (Mediana / Média de Jogadores)</span>
                  </div>
                  <span className="font-mono font-bold text-blue-300">
                    {conf50 === Infinity ? '—' : `${conf50.toLocaleString('pt-BR')} baús`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-medium text-stone-300">75% de Certeza (Bom Planejamento)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300">
                    {conf75 === Infinity ? '—' : `${conf75.toLocaleString('pt-BR')} baús`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-amber-500/30 bg-amber-950/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="font-semibold text-amber-200">90% de Certeza (Recomendado para Meta)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">
                    {conf90 === Infinity ? '—' : `${conf90.toLocaleString('pt-BR')} baús`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="font-medium text-stone-300">99% de Certeza (Garantia Quase Absoluta)</span>
                  </div>
                  <span className="font-mono font-bold text-purple-300">
                    {conf99 === Infinity ? '—' : `${conf99.toLocaleString('pt-BR')} baús`}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulador "Se eu abrir N baús" */}
            <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  Simulador de Baús em Estoque
                </h4>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {simulatedChests} baús
                </span>
              </div>

              <p className="text-xs text-stone-400 mb-3">
                Ajuste quantos baús você tem ou pretende abrir para ver sua chance real:
              </p>

              <input
                type="range"
                min="1"
                max="2000"
                step="1"
                value={simulatedChests}
                onChange={(e) => setSimulatedChests(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer mb-3"
              />

              <div className="flex gap-2 mb-4">
                {[10, 50, 100, 250, 500, 1000].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSimulatedChests(count)}
                    className={`flex-1 py-1 text-[11px] rounded font-semibold border transition-all ${
                      simulatedChests === count
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>

              {/* Barra de Progresso de Chance */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-300">Chance de obter ao menos 1:</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {chanceInSelectedChests.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-stone-950 rounded-full h-3 border border-stone-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      chanceInSelectedChests >= 80
                        ? 'bg-emerald-500'
                        : chanceInSelectedChests >= 50
                        ? 'bg-amber-500'
                        : chanceInSelectedChests >= 25
                        ? 'bg-orange-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, chanceInSelectedChests))}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-400 italic">
                  {chanceInSelectedChests >= 90
                    ? 'Excelente chance! É altamente provável que você tire neste lote.'
                    : chanceInSelectedChests >= 50
                    ? 'Chance moderada (mais provável que dê certo do que errado).'
                    : 'Chance baixa. Considere acumular mais baús ou utilizar runas alternativas.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tabelas Oficiais KOG (Baú Avançado) */}
      {activeTab === 'official_tables' && (
        <div className="space-y-6">
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Matriz Oficial de Invocação KOG Games
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Taxas exatas divulgadas para o Baú de Invocação de Runa Avançado (Advanced Rune Summon Chest).
                </p>
              </div>

              {/* Filtro rápido por Tier */}
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
                <span className="text-xs text-stone-400 px-2 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Tier:
                </span>
                {['ALL', 'T1', 'T2', 'T3', 'T4', 'T5'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTableFilterTier(t)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      tableFilterTier === t
                        ? 'bg-amber-500 text-stone-950'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabela de Matriz Tier x Grau */}
            <div className="overflow-x-auto rounded-xl border border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Tier</th>
                    <th className="py-3 px-4 font-bold text-gray-300">Normal (Comum)</th>
                    <th className="py-3 px-4 font-bold text-sky-400">Rara</th>
                    <th className="py-3 px-4 font-bold text-purple-400">Épica</th>
                    <th className="py-3 px-4 font-bold text-amber-400">Lendária</th>
                    <th className="py-3 px-4 font-bold text-stone-300">Total do Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 bg-stone-900/40 font-mono">
                  {(['T1', 'T2', 'T3', 'T4', 'T5'] as RuneTier[])
                    .filter((t) => tableFilterTier === 'ALL' || tableFilterTier === t)
                    .map((t) => {
                      const tData = TIER_DATA[t];
                      const row = TIER_RANK_MATRIX[t];
                      const isT5 = t === 'T5';
                      return (
                        <tr
                          key={t}
                          className={`hover:bg-stone-850/60 transition-colors ${
                            isT5 ? 'bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-sans font-bold">
                            <span className={`px-2 py-0.5 rounded text-xs border ${tData.badgeBg}`}>
                              {t}
                            </span>
                            <span className="ml-2 text-stone-300 text-xs font-normal">
                              {tData.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {row.Normal > 0 ? `${row.Normal.toFixed(4)}%` : '—'}
                          </td>
                          <td className="py-3 px-4 text-sky-400">
                            {row.Rara > 0 ? `${row.Rara.toFixed(4)}%` : '—'}
                          </td>
                          <td className="py-3 px-4 text-purple-400">
                            {row.Épica > 0 ? `${row.Épica.toFixed(4)}%` : '—'}
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-400">
                            {row.Lendária > 0 ? (
                              <span className={isT5 ? 'text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40' : ''}>
                                {row.Lendária.toFixed(4)}%
                                {isT5 && ' (1 em 667)'}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-200">
                            {tData.probability.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formatos e Atributos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.values(SHAPE_DATA)).map((shape) => (
              <div
                key={shape.shape}
                className="bg-stone-900/60 p-4 rounded-xl border border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-stone-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Runa {shape.name}
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400">
                    20.00%
                  </span>
                </div>

                <p className="text-xs text-stone-400">{shape.description}</p>

                <div className="pt-2 border-t border-stone-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Atributos Principais Possíveis:
                  </span>
                  {shape.primaryStats.map((st) => (
                    <div
                      key={st.stat}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-stone-950/50"
                    >
                      <span className="text-stone-300">{st.stat}</span>
                      <span className="font-mono text-amber-400 font-bold">{st.probability}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Runas de Habilidade (Skill Runes) */}
      {activeTab === 'skill_runes' && (
        <div className="space-y-6">
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2 mb-1">
              <Box className="w-4 h-4 text-amber-400" />
              Baú de Invocação de Runa de Habilidade Avançado
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Taxas oficiais KOG para obtenção de Runas de Habilidade por Grau e Efeitos por Cor.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {SKILL_RUNE_BOX_RATES.map((item) => (
                <div
                  key={item.rank}
                  className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 text-center space-y-1"
                >
                  <span className="text-xs font-semibold text-stone-400 block">{item.rank}</span>
                  <span className="text-xl font-black text-amber-300 font-mono block">
                    {item.rate.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-stone-400 block">
                    {item.rank === 'Lendária' ? '1 em 50 caixas' : item.rank === 'Épica' ? '1 em 5 caixas' : 'Comum'}
                  </span>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Tipos de Runas de Habilidade e Seus Efeitos:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SKILL_RUNE_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 rounded-xl border ${type.color} space-y-2`}
                >
                  <h5 className="font-bold text-sm text-stone-100">{type.name}</h5>
                  <p className="text-xs text-stone-300">{type.effect}</p>
                  <div className="pt-2 border-t border-stone-800/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Normal:</span>
                      <span className="font-bold text-stone-200">{type.bonus.Normal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Rara:</span>
                      <span className="font-bold text-sky-300">{type.bonus.Rara}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Épica:</span>
                      <span className="font-bold text-purple-300">{type.bonus.Épica}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Lendária:</span>
                      <span className="font-bold text-amber-300">{type.bonus.Lendária}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
