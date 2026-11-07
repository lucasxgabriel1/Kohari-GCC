import React, { useMemo } from 'react';
import { GC_CHARACTERS } from '../data/gcCharacters';
import { sounds } from '../utils/soundEffects';
import { Target } from 'lucide-react';

interface CharacterSelectorProps {
  selectedCharId: string;
  onSelectChar: (charId: string) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedCharId,
  onSelectChar,
}) => {
  const currentChar = useMemo(() => {
    return GC_CHARACTERS.find((c) => c.id === selectedCharId) || GC_CHARACTERS[22];
  }, [selectedCharId]);

  return (
    <div className="bg-stone-900/90 p-4 sm:p-5 rounded-2xl border-2 border-stone-800 shadow-2xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-black text-stone-100 tracking-tight">
            Selecione o Personagem:
          </h2>
        </div>
        <div className="text-xs text-stone-400 flex items-center gap-2">
          <span>Selecionado:</span>
          <span className="font-bold text-amber-300 px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50">
            {currentChar.name}
          </span>
        </div>
      </div>

      {/* CONTAINER DA IMAGEM OFICIAL (2170x725px) COM OVERLAY INTERATIVO */}
      <div className="relative overflow-x-auto no-scrollbar rounded-2xl border-2 border-stone-800 bg-black p-2 sm:p-3 flex justify-center shadow-2xl">
        <div
          className="relative select-none flex-shrink-0 w-full max-w-[1085px]"
          style={{ aspectRatio: '2170 / 725' }}
        >
          {/* A imagem em alta definição */}
          <img
            src="/assets/aistudio/image_8fb8ddb1.png"
            alt="Seleção de Personagens Grand Chase"
            className="w-full h-full block pointer-events-none rounded-xl"
          />

          {/* Grid de 25 slots interativos sobrepostos exatamente sobre cada personagem */}
          {GC_CHARACTERS.map((char) => {
            const isSelected = char.id === selectedCharId;
            const slotWidthPct = 100 / 13; // 7.6923% por slot
            const slotHeightPct = 50; // 50% por linha

            const leftPct = char.col * slotWidthPct;
            const topPct = char.row * slotHeightPct;

            return (
              <button
                key={char.id}
                onClick={() => {
                  onSelectChar(char.id);
                  sounds.playClick();
                }}
                title={char.displayName || char.name}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${slotWidthPct}%`,
                  height: `${slotHeightPct}%`,
                }}
                className={`absolute z-10 transition-all cursor-pointer group p-1 ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-2 border-yellow-300 bg-amber-400/20 shadow-[0_0_20px_rgba(250,204,21,0.85)] rounded-xl'
                    : 'hover:bg-white/10 hover:ring-1 hover:ring-white/40 rounded-xl'
                }`}
              >
                {/* Cursor de seleção */}
                {isSelected && (
                  <div className="absolute -top-2 -right-1 z-20 pointer-events-none animate-bounce">
                    <div className="w-4 h-4 rounded-full bg-amber-400 border border-stone-950 shadow-md flex items-center justify-center text-[9px] font-black text-stone-950">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-stone-400 text-center italic">
        Personagem ativo: <strong className="text-stone-200">{currentChar.name}</strong>.
      </p>
    </div>
  );
};
