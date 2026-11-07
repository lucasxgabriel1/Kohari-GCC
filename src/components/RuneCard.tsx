import React from 'react';
import { RuneTier, RuneRank, RuneShape, TIER_DATA, RANK_DATA, SHAPE_DATA, getMainStatUnit } from '../data/runeData';
import { Sparkles, Shield, Swords, Heart, Zap, Crosshair } from 'lucide-react';

export interface RuneInstance {
  id: string;
  name?: string;
  tier: RuneTier;
  rank: RuneRank;
  shape: RuneShape;
  level: number;
  mainStat: {
    name: string;
    value: number;
  };
  subStats: {
    id: string;
    name: string;
    value: number;
    unit: string;
    isMeta?: boolean;
    unlockedAtLevel?: number;
  }[];
}

interface RuneCardProps {
  rune: RuneInstance;
  compact?: boolean;
  highlightGodRoll?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const RuneCard: React.FC<RuneCardProps> = ({
  rune,
  compact = false,
  highlightGodRoll = false,
  onSelect,
  isSelected = false,
}) => {
  const tierInfo = TIER_DATA[rune.tier];
  const rankInfo = RANK_DATA[rune.rank];
  const shapeInfo = SHAPE_DATA[rune.shape];

  const getMainStatIcon = (statName: string) => {
    switch (statName) {
      case 'Ataque':
      case 'Ataque Especial':
      case 'Dano Crítico':
        return <Swords className="w-4 h-4 text-rose-400" />;
      case 'Chance de Crítico':
        return <Crosshair className="w-4 h-4 text-amber-400" />;
      case 'Defesa':
      case 'Defesa Especial':
      case 'Dano Crítico Recebido (-)':
      case 'Resistência a Contaminação':
        return <Shield className="w-4 h-4 text-sky-400" />;
      case 'HP':
      case 'Vitalidade':
      case 'Recuperação de HP':
        return <Heart className="w-4 h-4 text-emerald-400" />;
      case 'Recuperação de MP/AP':
      case 'Redução Custo de MP/AP no Contra-Ataque':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  const renderShapeIcon = () => {
    const strokeColor = rune.tier === 'T5' ? '#fbbf24' : rune.tier === 'T4' ? '#c084fc' : rune.tier === 'T3' ? '#60a5fa' : '#34d399';
    switch (rune.shape) {
      case 'Círculo':
        return (
          <svg className="w-8 h-8 drop-shadow-md" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="14" fill="none" stroke={strokeColor} strokeWidth="3" />
            <circle cx="20" cy="20" r="8" fill={strokeColor} fillOpacity="0.25" />
          </svg>
        );
      case 'Quadrado':
        return (
          <svg className="w-8 h-8 drop-shadow-md" viewBox="0 0 40 40">
            <rect x="7" y="7" width="26" height="26" rx="4" fill="none" stroke={strokeColor} strokeWidth="3" />
            <rect x="12" y="12" width="16" height="16" rx="2" fill={strokeColor} fillOpacity="0.25" />
          </svg>
        );
      case 'Triângulo':
        return (
          <svg className="w-8 h-8 drop-shadow-md" viewBox="0 0 40 40">
            <polygon points="20,6 34,32 6,32" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
            <polygon points="20,13 29,30 11,30" fill={strokeColor} fillOpacity="0.25" strokeLinejoin="round" />
          </svg>
        );
      case 'Pentágono':
        return (
          <svg className="w-8 h-8 drop-shadow-md" viewBox="0 0 40 40">
            <polygon points="20,6 35,17 29,33 11,33 5,17" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
            <polygon points="20,12 30,20 26,30 14,30 10,20" fill={strokeColor} fillOpacity="0.25" strokeLinejoin="round" />
          </svg>
        );
      case 'Hexágono':
        return (
          <svg className="w-8 h-8 drop-shadow-md" viewBox="0 0 40 40">
            <polygon points="20,5 34,13 34,27 20,35 6,27 6,13" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
            <polygon points="20,11 29,16 29,24 20,29 11,24 11,16" fill={strokeColor} fillOpacity="0.25" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const isLegendary = rune.rank === 'Lendária';
  const isT5 = rune.tier === 'T5';

  return (
    <div
      onClick={onSelect}
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 select-none ${
        compact ? 'p-3' : 'p-4'
      } ${
        isSelected
          ? 'ring-2 ring-amber-400 border-amber-400 bg-stone-900/90'
          : 'bg-stone-900/80 hover:bg-stone-850 hover:border-stone-500'
      } ${rankInfo.borderClass} ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {/* Background glow by rank and tier */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${rankInfo.bgGlow} pointer-events-none opacity-80`}
      />

      {/* T5 Golden shine ribbon */}
      {isT5 && (
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-16 h-16 bg-amber-400/20 rotate-45 pointer-events-none filter blur-md" />
      )}

      {/* Header: Shape Icon + Badges + Level */}
      <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-stone-950/70 border border-stone-800">
            {renderShapeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tierInfo.badgeBg}`}>
                {rune.tier}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-950/80 border border-stone-700 ${rankInfo.textColor}`}>
                {rune.rank}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 font-medium">
              Runa {rune.shape}
            </p>
          </div>
        </div>

        {/* Enhancement Level Badge */}
        <div className={`px-2.5 py-1 rounded-lg font-black text-sm tracking-wider shadow-inner flex items-center gap-1 ${
          rune.level >= 9
            ? 'bg-gradient-to-r from-amber-500 to-yellow-300 text-stone-950 shadow-amber-400/50'
            : rune.level >= 6
            ? 'bg-purple-900 text-purple-200 border border-purple-500'
            : rune.level > 0
            ? 'bg-sky-950 text-sky-300 border border-sky-600'
            : 'bg-stone-950 text-stone-400 border border-stone-800'
        }`}>
          {rune.level >= 9 && <Sparkles className="w-3 h-3 text-stone-950 animate-spin" />}
          +{rune.level}
        </div>
      </div>

      {/* Main Stat section */}
      <div className="relative z-10 bg-stone-950/70 rounded-lg p-2.5 mb-2.5 border border-stone-800/80">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1 font-medium">
            {getMainStatIcon(rune.mainStat.name)}
            {rune.mainStat.name} (Principal)
          </span>
          <span className="text-stone-200 font-bold text-sm">
            +{rune.mainStat.value.toLocaleString('pt-BR')}{getMainStatUnit(rune.mainStat.name)}
          </span>
        </div>
      </div>

      {/* Sub-stats section */}
      <div className="relative z-10 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800/60 pb-1">
          <span>Sub-Atributos ({rune.subStats.length}/3)</span>
          {highlightGodRoll && (
            <span className="text-amber-400 text-[10px] flex items-center gap-0.5 font-bold">
              <Crosshair className="w-2.5 h-2.5" /> META
            </span>
          )}
        </div>

        {rune.subStats.length === 0 ? (
          <div className="text-xs text-stone-400 py-1 italic">
            Nenhum sub-atributo ativo (desbloqueia ao fortalecer no +3, +6, +9)
          </div>
        ) : (
          rune.subStats.map((sub, i) => (
            <div
              key={i}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                sub.isMeta
                  ? 'bg-amber-950/30 border border-amber-500/30 text-amber-200'
                  : 'bg-stone-950/40 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-1">
                {sub.isMeta && <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                <span className="truncate max-w-[150px]">{sub.name}</span>
              </div>
              <span className="font-bold ml-2">
                +{sub.value.toLocaleString('pt-BR')}
                {sub.unit}
              </span>
            </div>
          ))
        )}

        {/* Empty slots placeholders */}
        {Array.from({ length: Math.max(0, 3 - rune.subStats.length) }).map((_, idx) => {
          const unlockLevel = rune.subStats.length === 0 ? (idx === 0 ? 3 : idx === 1 ? 6 : 9) : rune.subStats.length === 1 ? (idx === 0 ? 6 : 9) : 9;
          return (
            <div
              key={`empty-${idx}`}
              className="flex items-center justify-between text-[11px] px-2 py-0.5 rounded border border-dashed border-stone-800 text-stone-400"
            >
              <span>Slot Vazio</span>
              <span className="text-[10px]">Libera no +{unlockLevel}</span>
            </div>
          );
        })}
      </div>

      {/* Special badge for T5 Legendary */}
      {isT5 && isLegendary && (
        <div className="mt-2 text-center py-0.5 rounded bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          Runa Perfeita (0.15% KOG Rate)
        </div>
      )}
    </div>
  );
};
