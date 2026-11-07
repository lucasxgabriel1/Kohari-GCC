import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  BASE_ENHANCE_STEPS,
  BOOSTER_OPTIONS,
  POSSIBLE_SUBSTATS,
  BoosterOption,
  RuneTier,
  RuneRank,
  RuneShape,
  TIER_DATA,
  RUNES_BR_SECONDARY_NAME_TO_ID,
} from '../data/runeData';
import { RuneCard, RuneInstance } from './RuneCard';
import { sounds } from '../utils/soundEffects';
import { getEffectiveStepRates, formatGP } from '../utils/probabilityMath';
import {
  Hammer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Flame,
  Gem,
  Coins,
  History,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface AttemptLog {
  id: string;
  attemptNumber: number;
  fromLevel: number;
  toLevel: number;
  result: 'SUCCESS' | 'STAY' | 'DROP';
  stonesCost: number;
  gpCost: number;
  timestamp: Date;
}

export const EnhanceSimulator: React.FC = () => {
  // Configuração da Runa na Forja
  const [tier, setTier] = useState<RuneTier>('T5');
  const [rank, setRank] = useState<RuneRank>('Lendária');
  const [shape, setShape] = useState<RuneShape>('Triângulo');
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [subStats, setSubStats] = useState<RuneInstance['subStats']>([]);
  const [selectedBoosterId, setSelectedBoosterId] = useState<string>('none');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Estados de animação e auto-forja
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoTargetLevel, setAutoTargetLevel] = useState<number>(9);
  const [autoSpeed, setAutoSpeed] = useState<number>(350); // ms por tentativa

  // Estatísticas acumuladas
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [stayCount, setStayCount] = useState<number>(0);
  const [dropCount, setDropCount] = useState<number>(0);
  const [spentDarkStones, setSpentDarkStones] = useState<number>(0);
  const [spentGP, setSpentGP] = useState<number>(0);
  const [logs, setLogs] = useState<AttemptLog[]>([]);
  const [lastOutcome, setLastOutcome] = useState<{
    type: 'SUCCESS' | 'STAY' | 'DROP';
    message: string;
  } | null>(null);

  const autoRunTimerRef = useRef<number | null>(null);

  const selectedBooster: BoosterOption =
    BOOSTER_OPTIONS.find((b) => b.id === selectedBoosterId) || BOOSTER_OPTIONS[0];

  // Sincronizar preferência de áudio
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Limpeza de timer
  useEffect(() => {
    return () => {
      if (autoRunTimerRef.current) {
        window.clearTimeout(autoRunTimerRef.current);
      }
    };
  }, []);

  // Multiplicador de custo pelo Tier
  const tierCostMultiplier = tier === 'T1' ? 0.4 : tier === 'T2' ? 0.6 : tier === 'T3' ? 0.8 : tier === 'T4' ? 0.9 : 1.0;

  // Objeto Runa atual
  const currentRune: RuneInstance = {
    id: 'forge-rune',
    tier,
    rank,
    shape,
    level: currentLevel,
    mainStat: {
      name: shape === 'Círculo' ? 'Ataque' : shape === 'Quadrado' ? 'Defesa' : shape === 'Pentágono' ? 'Vitalidade' : 'Ataque Especial',
      value: Math.round((shape === 'Círculo' ? 850 : 1200) * TIER_DATA[tier].baseMainStatT5Factor * (1 + currentLevel * 0.22)),
    },
    subStats,
  };

  // Rolar um novo sub-atributo se desbloqueado
  const rollNewSubStat = (currentList: RuneInstance['subStats']): RuneInstance['subStats'] => {
    const mainCanonical = RUNES_BR_SECONDARY_NAME_TO_ID[currentRune.mainStat.name] ?? currentRune.mainStat.name;
    const existingIds = currentList.map((s) => RUNES_BR_SECONDARY_NAME_TO_ID[s.id] ?? s.id);
    const available = POSSIBLE_SUBSTATS.filter(
      (s) =>
        !existingIds.includes(RUNES_BR_SECONDARY_NAME_TO_ID[s.id] ?? s.id) &&
        (RUNES_BR_SECONDARY_NAME_TO_ID[s.id] ?? s.id) !== mainCanonical
    );
    if (available.length === 0) return currentList;

    const chosen = available[Math.floor(Math.random() * available.length)];
    const valRange = chosen.maxValT5 - chosen.minValT5;
    const rolledVal = chosen.minValT5 + Math.random() * valRange * TIER_DATA[tier].baseMainStatT5Factor;
    const rounded = chosen.unit === '%' ? Math.round(rolledVal * 10) / 10 : Math.round(rolledVal);

    return [
      ...currentList,
      {
        id: chosen.id,
        name: chosen.name,
        value: rounded,
        unit: chosen.unit,
        isMeta: chosen.isMeta,
      },
    ];
  };

  // Executa UMA tentativa de fortalecimento
  const executeSingleEnhance = (forceInstant: boolean = false): boolean => {
    if (currentLevel >= 9) {
      setIsAutoRunning(false);
      return false;
    }

    const currentStep = BASE_ENHANCE_STEPS[currentLevel];
    if (!currentStep) return false;

    const rates = getEffectiveStepRates(currentStep, selectedBooster);
    const costStones = Math.round(currentStep.darkStonesCost * tierCostMultiplier);
    const costGP = Math.round(currentStep.gpCost * tierCostMultiplier);

    setSpentDarkStones((prev) => prev + costStones);
    setSpentGP((prev) => prev + costGP);
    setTotalAttempts((prev) => prev + 1);

    if (!forceInstant) {
      sounds.playHammerForge();
    }

    const roll = Math.random() * 100;
    let result: 'SUCCESS' | 'STAY' | 'DROP' = 'STAY';

    if (roll < rates.successRate) {
      // Sucesso!
      result = 'SUCCESS';
      const newLvl = currentLevel + 1;
      setCurrentLevel(newLvl);
      setSuccessCount((prev) => prev + 1);

      // Desbloquear sub-atributos no +3, +6, +9 se houver vaga
      if (currentStep.unlocksSubStat) {
        setSubStats((prev) => rollNewSubStat(prev));
      }

      setLastOutcome({
        type: 'SUCCESS',
        message: `Sucesso! Runa aprimorada para +${newLvl}!`,
      });

      if (newLvl >= 9) {
        if (!forceInstant) {
          sounds.playLegendaryFanfare();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        setIsAutoRunning(false);
      } else if (!forceInstant) {
        sounds.playSuccess();
      }
    } else if (roll < rates.successRate + rates.dropRate) {
      // Rebaixou de nível
      result = 'DROP';
      const newLvl = Math.max(0, currentLevel - 1);
      setCurrentLevel(newLvl);
      setDropCount((prev) => prev + 1);

      setLastOutcome({
        type: 'DROP',
        message: `Falha! O nível caiu para +${newLvl}!`,
      });

      if (!forceInstant) {
        sounds.playBreak();
      }
    } else {
      // Permaneceu
      result = 'STAY';
      setStayCount((prev) => prev + 1);

      setLastOutcome({
        type: 'STAY',
        message: `Falhou! O nível da runa permaneceu em +${currentLevel}.`,
      });

      if (!forceInstant) {
        sounds.playFail();
      }
    }

    // Registrar no histórico
    const logItem: AttemptLog = {
      id: Math.random().toString(36).substring(2, 9),
      attemptNumber: totalAttempts + 1,
      fromLevel: currentLevel,
      toLevel: result === 'SUCCESS' ? currentLevel + 1 : result === 'DROP' ? Math.max(0, currentLevel - 1) : currentLevel,
      result,
      stonesCost: costStones,
      gpCost: costGP,
      timestamp: new Date(),
    };
    setLogs((prev) => [logItem, ...prev.slice(0, 49)]);

    return true;
  };

  // Botão manual de Fortalecer
  const handleManualEnhance = () => {
    if (isEnhancing || currentLevel >= 9) return;
    setIsEnhancing(true);

    executeSingleEnhance(false);

    window.setTimeout(() => {
      setIsEnhancing(false);
    }, 250);
  };

  // Loop de auto-forja
  useEffect(() => {
    if (!isAutoRunning) {
      if (autoRunTimerRef.current) {
        window.clearTimeout(autoRunTimerRef.current);
      }
      return;
    }

    if (currentLevel >= autoTargetLevel || currentLevel >= 9) {
      setIsAutoRunning(false);
      return;
    }

    autoRunTimerRef.current = window.setTimeout(() => {
      executeSingleEnhance(autoSpeed <= 50);
    }, autoSpeed);

    return () => {
      if (autoRunTimerRef.current) {
        window.clearTimeout(autoRunTimerRef.current);
      }
    };
  }, [isAutoRunning, currentLevel, autoTargetLevel, autoSpeed, selectedBooster]);

  // Resetar a forja
  const handleResetForge = () => {
    setIsAutoRunning(false);
    setCurrentLevel(0);
    setSubStats([]);
    setTotalAttempts(0);
    setSuccessCount(0);
    setStayCount(0);
    setDropCount(0);
    setSpentDarkStones(0);
    setSpentGP(0);
    setLogs([]);
    setLastOutcome(null);
  };

  const nextStep = BASE_ENHANCE_STEPS[currentLevel];
  const nextRates = nextStep ? getEffectiveStepRates(nextStep, selectedBooster) : null;

  return (
    <div className="space-y-6">
      {/* Barra de Controles Superiores & Som */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            Forja & Simulador de Fortalecimento em Tempo Real
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Teste sua sorte com as taxas reais do Grand Chase e sinta o impacto dos custos de Darkstones e GP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Som On/Off */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                : 'bg-stone-950 text-stone-400 border-stone-800'
            }`}
            title="Alternar Efeitos Sonoros"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
          </button>

          {/* Resetar */}
          <button
            onClick={handleResetForge}
            className="p-2 px-3 rounded-lg border border-stone-800 bg-stone-950 text-stone-300 hover:text-stone-100 hover:border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar Forja</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Central da Forja (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card da Bigorna & Runa Ativa */}
          <div className="bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 p-6 rounded-2xl border border-stone-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Efeito místico de fundo */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
                currentLevel >= 9
                  ? 'bg-gradient-to-t from-amber-500/20 via-yellow-400/10 to-transparent opacity-100'
                  : currentLevel >= 6
                  ? 'bg-gradient-to-t from-purple-500/15 via-transparent to-transparent opacity-80'
                  : 'opacity-0'
              }`}
            />

            {/* Configurar tipo de runa na forja */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-800 text-xs">
              <span className="text-stone-400 font-bold uppercase tracking-wider">
                Configurar Runa Base:
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={tier}
                  onChange={(e) => {
                    setTier(e.target.value as RuneTier);
                    setSubStats([]);
                  }}
                  className="bg-stone-950 border border-stone-800 text-stone-300 rounded px-2 py-1 focus:ring-1 focus:ring-amber-400"
                >
                  {(['T1', 'T2', 'T3', 'T4', 'T5'] as RuneTier[]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value as RuneRank)}
                  className="bg-stone-950 border border-stone-800 text-stone-300 rounded px-2 py-1 focus:ring-1 focus:ring-amber-400"
                >
                  {(['Normal', 'Rara', 'Épica', 'Lendária'] as RuneRank[]).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value as RuneShape)}
                  className="bg-stone-950 border border-stone-800 text-stone-300 rounded px-2 py-1 focus:ring-1 focus:ring-amber-400"
                >
                  {(['Círculo', 'Quadrado', 'Triângulo', 'Pentágono', 'Hexágono'] as RuneShape[]).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exibição da Runa na Forja */}
            <div className="w-full max-w-sm my-2 transform transition-transform hover:scale-[1.01]">
              <RuneCard rune={currentRune} highlightGodRoll={true} />
            </div>

            {/* Mensagem do último resultado */}
            {lastOutcome && (
              <div
                className={`mt-4 w-full p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                  lastOutcome.type === 'SUCCESS'
                    ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                    : lastOutcome.type === 'DROP'
                    ? 'bg-rose-950/70 border-rose-500/70 text-rose-300'
                    : 'bg-stone-950/80 border-stone-700 text-stone-300'
                }`}
              >
                {lastOutcome.message}
              </div>
            )}

            {/* Informações da Próxima Tentativa */}
            {nextStep && nextRates ? (
              <div className="w-full mt-4 p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/90 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Sucesso Efetivo</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    {nextRates.successRate.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Risco de Queda</span>
                  <span className={`font-bold font-mono text-sm ${nextRates.dropRate > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {nextRates.dropRate > 0 ? `${nextRates.dropRate.toFixed(1)}%` : '0% (Seguro)'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Pedras Negras</span>
                  <span className="text-purple-300 font-bold font-mono text-sm">
                    {Math.round(nextStep.darkStonesCost * tierCostMultiplier)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Custo em GP</span>
                  <span className="text-yellow-300 font-bold font-mono text-sm">
                    {formatGP(Math.round(nextStep.gpCost * tierCostMultiplier))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs text-center font-bold">
                🎉 Runa no Nível Máximo (+9)! Parabéns, guerreiro de Grand Chase!
              </div>
            )}

            {/* Seletor de Booster na Forja */}
            <div className="w-full mt-4 flex flex-col sm:flex-row items-center gap-2">
              <label className="text-xs text-stone-400 whitespace-nowrap">Auxílio / Booster:</label>
              <select
                value={selectedBoosterId}
                onChange={(e) => setSelectedBoosterId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 text-xs text-stone-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-400"
              >
                {BOOSTER_OPTIONS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ações da Forja: Manual e Automático */}
            <div className="w-full mt-5 space-y-3">
              {/* Botão de Fortalecer Manual */}
              <button
                disabled={currentLevel >= 9 || isAutoRunning}
                onClick={handleManualEnhance}
                className={`w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  currentLevel >= 9
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    : isEnhancing
                    ? 'bg-amber-600 text-stone-950 scale-[0.99]'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 hover:brightness-110 active:scale-[0.99] shadow-amber-500/20 cursor-pointer'
                }`}
              >
                <Hammer className={`w-5 h-5 ${isEnhancing ? 'animate-bounce' : ''}`} />
                <span>
                  {currentLevel >= 9
                    ? 'Nível Máximo Atingido (+9)'
                    : `Fortalecer (+${currentLevel} → +${currentLevel + 1})`}
                </span>
              </button>

              {/* Controles de Auto-Fortalecimento */}
              <div className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Fortalecimento Automático
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Parar no:</span>
                    <select
                      value={autoTargetLevel}
                      onChange={(e) => setAutoTargetLevel(Number(e.target.value))}
                      className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-2 py-0.5"
                    >
                      {[3, 6, 7, 8, 9].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          +{lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={currentLevel >= autoTargetLevel || currentLevel >= 9}
                    onClick={() => setIsAutoRunning(!isAutoRunning)}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isAutoRunning
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : currentLevel >= autoTargetLevel
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        : 'bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700'
                    }`}
                  >
                    {isAutoRunning ? (
                      <>
                        <Pause className="w-4 h-4" /> Parar Auto-Forja
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-emerald-400" /> Iniciar Auto-Forja
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-[11px] bg-stone-900 p-1 rounded-lg border border-stone-800">
                    <span className="text-stone-400 px-1">Velocidade:</span>
                    {[
                      { label: 'Normal', speed: 400 },
                      { label: 'Rápido', speed: 150 },
                      { label: 'Turbo', speed: 30 },
                    ].map((sp) => (
                      <button
                        key={sp.speed}
                        onClick={() => setAutoSpeed(sp.speed)}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          autoSpeed === sp.speed
                            ? 'bg-amber-500 text-stone-950'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Estatísticas e Histórico (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Estatísticas da Sessão Atual */}
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-4">
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Recursos e Desempenho Real
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-stone-400 font-medium">Tentativas Totais</span>
                <div className="text-2xl font-black text-stone-100 font-mono">
                  {totalAttempts}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/70 border border-purple-900/40 space-y-1">
                <span className="text-purple-300 font-medium flex items-center gap-1">
                  <Gem className="w-3.5 h-3.5" /> Pedras Negras
                </span>
                <div className="text-2xl font-black text-purple-300 font-mono">
                  {spentDarkStones.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/70 border border-yellow-900/40 space-y-1">
                <span className="text-yellow-300 font-medium flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> Total em GP
                </span>
                <div className="text-xl font-black text-yellow-300 font-mono truncate">
                  {formatGP(spentGP)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-stone-400 font-medium">Taxa de Sucesso Real</span>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {totalAttempts > 0 ? `${((successCount / totalAttempts) * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Barra de distribuição dos desfechos */}
            <div className="space-y-1.5 pt-2 border-t border-stone-800 text-xs">
              <div className="flex justify-between text-stone-400">
                <span className="text-emerald-400">Sucessos: {successCount}</span>
                <span className="text-stone-400">Permaneceu: {stayCount}</span>
                <span className="text-rose-400">Quedas: {dropCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden flex">
                <div
                  style={{ width: `${totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full"
                />
                <div
                  style={{ width: `${totalAttempts > 0 ? (stayCount / totalAttempts) * 100 : 0}%` }}
                  className="bg-stone-600 h-full"
                />
                <div
                  style={{ width: `${totalAttempts > 0 ? (dropCount / totalAttempts) * 100 : 0}%` }}
                  className="bg-rose-500 h-full"
                />
              </div>
            </div>
          </div>

          {/* Histórico das Últimas Tentativas */}
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Histórico de Forja ({logs.length})
              </h4>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="text-[11px] text-stone-400 hover:text-stone-300"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {logs.length === 0 ? (
                <div className="text-stone-400 text-center py-6 italic">
                  Nenhum fortalecimento realizado ainda. Clique em "Fortalecer" para começar!
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-2 rounded-lg border font-mono text-[11px] ${
                      log.result === 'SUCCESS'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : log.result === 'DROP'
                        ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">#{log.attemptNumber}</span>
                      <span className="font-bold text-stone-200">
                        +{log.fromLevel} &rarr; +{log.toLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-sans font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-900/80 text-emerald-200'
                            : log.result === 'DROP'
                            ? 'bg-rose-900/80 text-rose-200'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {log.result === 'SUCCESS'
                          ? 'Sucesso'
                          : log.result === 'DROP'
                          ? 'Caiu'
                          : 'Falhou'}
                      </span>
                      <span className="text-stone-400 text-[10px]">
                        -{log.stonesCost} pedras
                      </span>
                    </div>
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
