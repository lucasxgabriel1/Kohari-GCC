import React, { useState, useMemo } from 'react';
import { GC_CHARACTERS } from '../data/gcCharacters';
import { CharacterSelector } from './CharacterSelector';
import { RuneCompletionSimulator } from './RuneCompletionSimulator';

export const SkillRuneSection: React.FC = () => {
  // Personagem selecionado (padrão 'dio')
  const [selectedCharId, setSelectedCharId] = useState<string>('dio');

  // Localizar personagem atual
  const currentChar = useMemo(() => {
    return GC_CHARACTERS.find((c) => c.id === selectedCharId) || GC_CHARACTERS[22]; // Dio é index 22
  }, [selectedCharId]);

  return (
    <div className="space-y-6">
      {/* SELETOR OFICIAL DE PERSONAGENS */}
      <CharacterSelector
        selectedCharId={selectedCharId}
        onSelectChar={setSelectedCharId}
      />

      {/* SEÇÃO DO DIO: SIMULADOR DE CONCLUSÃO DA RUNA */}
      {selectedCharId === 'dio' && (
        <div className="max-w-4xl mx-auto w-full pt-2">
          <RuneCompletionSimulator charName={currentChar.name} charId={currentChar.id} />
        </div>
      )}
    </div>
  );
};

