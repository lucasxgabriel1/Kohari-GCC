import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Scroll,
  ShieldCheck,
  Target,
  AlertCircle,
  Lock,
  Unlock,
  Layers,
  RotateCcw,
} from 'lucide-react';
import {
  RuneSearchMode,
  calculateRuneProbability,
  formatPercentage,
  getMaxSearchableSkills,
} from '../utils/runeMath';
import { GC_CHARACTERS } from '../data/gcCharacters';

interface RuneCompletionSimulatorProps {
  charName?: string;
  charId?: string;
}

interface SelectedSkillSlot {
  name: string;
  ratePercent: number; // Porcentagem (ex: 6.6667)
}

export const RuneCompletionSimulator: React.FC<RuneCompletionSimulatorProps> = ({
  charName = 'Dio',
  charId = 'dio',
}) => {
  // 1. Quantidade de slots travados na runa (0, 1 ou 2)
  const [lockedSlots, setLockedSlots] = useState<0 | 1 | 2>(1);

  // 2. Quantidade de habilidades a buscar (1, 2 ou 3)
  const [skillsWantedCount, setSkillsWantedCount] = useState<1 | 2 | 3>(2);

  // 3. Modo de Busca: Modo A (Qualquer uma - OU) ou Modo B (Todas simultâneas - E)
  const [searchMode, setSearchMode] = useState<RuneSearchMode>('ALL');

  // Obter exclusivamente as 15 habilidades oficiais do Dio
  const dioSkills = useMemo(() => {
    const char = GC_CHARACTERS.find((c) => c.id === 'dio') || GC_CHARACTERS[22];
    if (char && char.skills && char.skills.length > 0) {
      return char.skills.map((s) => ({
        name: s.name,
        rate: s.rate || 6.6667,
      }));
    }
    // Fallback garantido das 15 habilidades do Dio
    return [
      { name: 'Foice Mortal / Estrela da Morte', rate: 6.6667 },
      { name: 'Garra Demoníaca / Esquife de Ossos', rate: 6.6667 },
      { name: 'Esfera das Trevas', rate: 6.6667 },
      { name: 'Espada Vingadora / Lança Diabólica', rate: 6.6667 },
      { name: 'Choque Fantasmagórico / Estocada', rate: 6.6667 },
      { name: 'Zona Mortal', rate: 6.6667 },
      { name: 'Aparar / Brilho Caótico', rate: 6.6667 },
      { name: 'Carga com Lança / Fenda Profunda', rate: 6.6667 },
      { name: 'Giro Audaz / Empalar', rate: 6.6667 },
      { name: 'Lança Perfurante', rate: 6.6667 },
      { name: 'Corte Caótico', rate: 6.6667 },
      { name: 'Destruição', rate: 6.6667 },
      { name: 'Império Sombrio', rate: 6.6667 },
      { name: 'Marca da Morte', rate: 6.6667 },
      { name: 'Julgamento Antecipado', rate: 6.6667 },
    ];
  }, []);

  // Lista de habilidades selecionadas (inicializada com habilidades do Dio)
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkillSlot[]>([
    { name: 'Foice Mortal / Estrela da Morte', ratePercent: 6.6667 },
    { name: 'Garra Demoníaca / Esquife de Ossos', ratePercent: 6.6667 },
    { name: 'Esfera das Trevas', ratePercent: 6.6667 },
  ]);

  // Regra de Validação: Ajuste automático quando lockedSlots muda
  // 0 travados -> máx 3 habilidades
  // 1 travado  -> máx 2 habilidades
  // 2 travados -> máx 1 habilidade
  const maxSkills = getMaxSearchableSkills(lockedSlots);

  useEffect(() => {
    if (skillsWantedCount > maxSkills) {
      setSkillsWantedCount(maxSkills as 1 | 2 | 3);
    }
  }, [maxSkills, skillsWantedCount]);

  // Probabilidades em decimal das habilidades ativas
  const activeSkillsProbabilities = useMemo(() => {
    const count = Math.min(skillsWantedCount, maxSkills);
    const probs: number[] = [];
    for (let i = 0; i < count; i++) {
      const skill = selectedSkills[i] || { name: 'Habilidade', ratePercent: 6.6667 };
      probs.push(Math.max(0, Math.min(100, skill.ratePercent)) / 100);
    }
    return probs;
  }, [skillsWantedCount, maxSkills, selectedSkills]);

  // Cálculos matemáticos unificados
  const calcResult = useMemo(() => {
    return calculateRuneProbability({
      lockedSlots,
      searchMode,
      skillsProbabilities: activeSkillsProbabilities,
      attempts: 1,
    });
  }, [lockedSlots, searchMode, activeSkillsProbabilities]);

  // Atualizar uma habilidade configurada
  const updateSkill = (index: number, name: string, ratePercent: number) => {
    setSelectedSkills((prev) => {
      const copy = [...prev];
      copy[index] = { name, ratePercent };
      return copy;
    });
  };

  // Resetar habilidades para as primeiras do Dio
  const resetDioSkills = () => {
    setSelectedSkills([
      { name: dioSkills[0].name, ratePercent: dioSkills[0].rate },
      { name: dioSkills[1].name, ratePercent: dioSkills[1].rate },
      { name: dioSkills[2].name, ratePercent: dioSkills[2].rate },
    ]);
  };

  return (
    <div className="w-full bg-stone-950 text-stone-100 p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-2xl space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div className="flex items-start sm:items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Simulador de Runa de habilidades do • Dio
            </h3>
            <p className="text-xs text-stone-400 font-medium">
              habilidades totais possíveis 15
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetDioSkills}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer font-medium self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Restaurar Habilidades do Dio</span>
        </button>
      </div>

      {/* 1. INDICADOR VISUAL DOS 3 SLOTS DA RUNA */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold text-stone-200">
              Slots da Runa (Exatamente 3 Slots):
            </span>
          </div>
          <span className="text-xs text-stone-400">
            {lockedSlots} {lockedSlots === 1 ? 'travado' : 'travados'} • {calcResult.freeSlots} {calcResult.freeSlots === 1 ? 'livre' : 'livres'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((slotIdx) => {
            const isLocked = slotIdx < lockedSlots;
            return (
              <div
                key={slotIdx}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  isLocked
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/90 border-stone-700/60 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Slot {slotIdx + 1}</span>
                </div>
                <span className={`text-[11px] font-semibold mt-1 ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isLocked ? 'Travado' : 'Livre para Roll'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SELEÇÃO DE SLOTS TRAVADOS (0, 1 OU 2) */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-stone-200">
          Selecione quantos atributos vão ser travados (0, 1 ou 2):
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {([0, 1, 2] as const).map((val) => {
            const isSelected = lockedSlots === val;
            const cost = val === 0 ? 1 : val === 1 ? 2 : 3;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setLockedSlots(val)}
                className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-lg'
                    : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:bg-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                  <ShieldCheck className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{val} {val === 1 ? 'travado' : 'travados'}</span>
                </div>
                <span className="text-[11px] text-stone-400 font-medium">
                  {cost} {cost === 1 ? 'pergaminho' : 'pergaminhos'}/tentativa
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. QUANTIDADE DE HABILIDADES A BUSCAR (1, 2 OU 3) COM DESABILITAÇÃO EM CINZA */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-stone-200">
            Quantas habilidades você quer buscar?
          </label>
          <span className="text-[11px] text-stone-400">
            (Disponível até {maxSkills} conforme os slots livres)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {([1, 2, 3] as const).map((count) => {
            const isDisabled = count > maxSkills;
            const isSelected = skillsWantedCount === count && !isDisabled;

            return (
              <button
                key={count}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && setSkillsWantedCount(count)}
                className={`py-3 px-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  isDisabled
                    ? 'opacity-35 cursor-not-allowed bg-stone-900/40 border-stone-800 text-stone-500 select-none'
                    : isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-lg cursor-pointer'
                    : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:bg-stone-800 hover:border-stone-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  {isDisabled ? (
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                  ) : (
                    <Target className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                  )}
                  <span>{count} {count === 1 ? 'Habilidade' : 'Habilidades'}</span>
                </div>
                <span className="text-[11px] font-medium">
                  {isDisabled ? (
                    <span className="text-red-400/80">Desabilitado (excede 3)</span>
                  ) : (
                    <span className="text-stone-400">Permitido</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MODOS DE BUSCA: MODO A (QUALQUER UMA - OU) vs MODO B (TODAS SIMULTÂNEAS - E) */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-stone-200">
          Modo de Combinação das Habilidades do Dio:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* MODO A: QUALQUER UMA (OU) */}
          <button
            type="button"
            onClick={() => setSearchMode('ANY')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
              searchMode === 'ANY'
                ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-900 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-300">
                Modo A — Qualquer uma (OU)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                searchMode === 'ANY' ? 'bg-amber-400 text-stone-950 font-black' : 'bg-stone-800 text-stone-400'
              }`}>
                P = 1 - (1 - p)^N
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Conseguir <strong>pelo menos uma</strong> das habilidades selecionadas nos slots livres (ex: Foice Mortal OU Garra Demoníaca).
            </p>
          </button>

          {/* MODO B: TODAS AS HABILIDADES (E) */}
          <button
            type="button"
            onClick={() => setSearchMode('ALL')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
              searchMode === 'ALL'
                ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-900 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-300">
                Modo B — Todas juntas (E)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                searchMode === 'ALL' ? 'bg-amber-400 text-stone-950 font-black' : 'bg-stone-800 text-stone-400'
              }`}>
                P = Permut. × Π p_i
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Conseguir <strong>todas</strong> as habilidades selecionadas na mesma rolagem, uma em cada slot livre (ex: Foice Mortal E Garra Demoníaca).
            </p>
          </button>
        </div>
      </div>

      {/* 5. CONFIGURAÇÃO DAS HABILIDADES DO DIO BUSCADAS */}
      <div className="space-y-3 pt-1">
        <label className="text-sm font-semibold text-stone-200 block">
          Habilidades do Dio Selecionadas:
        </label>

        <div className="space-y-2">
          {Array.from({ length: skillsWantedCount }).map((_, idx) => {
            const current = selectedSkills[idx] || { name: dioSkills[idx]?.name || 'Habilidade', ratePercent: 6.6667 };
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-stone-800 bg-stone-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <select
                      value={current.name}
                      onChange={(e) => {
                        const chosenName = e.target.value;
                        const found = dioSkills.find((s) => s.name === chosenName);
                        const rate = found ? found.rate : 6.6667;
                        updateSkill(idx, chosenName, rate);
                      }}
                      className="w-full bg-stone-950 border border-stone-700 text-white text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                    >
                      {dioSkills.map((sk) => (
                        <option key={sk.name} value={sk.name}>
                          {sk.name} ({sk.rate.toFixed(4)}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="text-xs text-stone-400">Taxa oficial:</span>
                  <span className="px-2 py-1 rounded bg-stone-950 border border-stone-800 text-xs font-bold text-amber-400">
                    {current.ratePercent.toFixed(4)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. PAINEL DE RESULTADOS COM "CHANCE DE CONSEGUIR A RUNA" COMO INDICADOR PRINCIPAL */}
      <div className="pt-2 space-y-4">
        {/* CARDS PRINCIPAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Chance de conseguir a runa (Probabilidade em 1 tentativa única) */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-semibold text-stone-300">Chance de conseguir a runa</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                1 Tentativa
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
              {formatPercentage(calcResult.singleAttemptChance, 4)}
            </div>
            <p className="text-[11px] text-stone-400">
              Probabilidade por rolagem com {calcResult.freeSlots} {calcResult.freeSlots === 1 ? 'slot livre' : 'slots livres'}
            </p>
          </div>

          {/* Média de Pergaminhos */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-semibold text-stone-300">Média de Pergaminhos</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400">
                Gasto Estimado
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight flex items-center gap-2">
              <Scroll className="w-6 h-6 text-amber-400" />
              <span>
                {calcResult.singleAttemptChance > 0
                  ? Math.round(calcResult.averageScrolls).toLocaleString('pt-BR')
                  : '—'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Gasto estatístico médio até obter a runa desejada
            </p>
          </div>
        </div>

        {/* MÉTRICAS ESTATÍSTICAS SECUNDÁRIAS (TENTATIVAS MÉDIAS E CUSTO POR TENTATIVA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-stone-300 block">Tentativas Médias (1 / P)</span>
              <span className="text-[11px] text-stone-400">Média estatística de rolagens</span>
            </div>
            <div className="text-2xl font-black text-stone-100">
              {calcResult.singleAttemptChance > 0
                ? calcResult.averageAttempts % 1 === 0
                  ? calcResult.averageAttempts.toFixed(0)
                  : calcResult.averageAttempts.toFixed(1)
                : '—'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-stone-300 block">Custo por Tentativa</span>
              <span className="text-[11px] text-stone-400">
                {lockedSlots} {lockedSlots === 1 ? 'slot travado' : 'slots travados'}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {calcResult.costPerAttempt} {calcResult.costPerAttempt === 1 ? 'pergaminho' : 'pergaminhos'}
            </div>
          </div>
        </div>

        {/* Barra de Progresso Visual da Chance de conseguir a runa */}
        <div className="space-y-1.5">
          <div className="w-full bg-stone-900 h-3 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, Math.max(1, calcResult.singleAttemptChance * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* DETALHAMENTO MATEMÁTICO */}
        <div className="bg-stone-900/50 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2 text-xs text-stone-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-stone-200">
                {searchMode === 'ANY' ? (
                  <>Modo A (Qualquer uma): P = 1 - (1 - p)^{calcResult.freeSlots}</>
                ) : (
                  <>Modo B (Todas juntas): P = {skillsWantedCount === 2 ? '2 × pA × pB' : skillsWantedCount === 3 ? '6 × pA × pB × pC' : 'pA'}</>
                )}
              </p>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Com <strong>{lockedSlots} {lockedSlots === 1 ? 'slot travado' : 'slots travados'}</strong> e <strong>{calcResult.freeSlots} {calcResult.freeSlots === 1 ? 'slot livre' : 'slots livres'}</strong>, cada tentativa consome <strong>{calcResult.costPerAttempt} {calcResult.costPerAttempt === 1 ? 'pergaminho' : 'pergaminhos'}</strong>. A chance de conseguir a runa em 1 tentativa é de <strong>{formatPercentage(calcResult.singleAttemptChance, 4)}</strong>. Em média são necessárias <strong>{calcResult.singleAttemptChance > 0 ? (calcResult.averageAttempts % 1 === 0 ? calcResult.averageAttempts.toFixed(0) : calcResult.averageAttempts.toFixed(1)) : '—'} tentativas</strong> (gasto médio de <strong>{calcResult.singleAttemptChance > 0 ? Math.round(calcResult.averageScrolls).toLocaleString('pt-BR') : '—'} pergaminhos</strong>) para obter o objetivo desejado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
