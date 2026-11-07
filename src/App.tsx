import React, { useState } from 'react';
import { SkillRuneSection } from './components/SkillRuneSection';
import { StatRuneSection } from './components/StatRuneSection';
import { GuidesSection } from './components/GuidesSection';
import { Sparkles, Shield, BookOpen } from 'lucide-react';

export type MainRuneSlot = 'skill' | 'stat' | 'guides';

export default function App() {
  const [selectedSlot, setSelectedSlot] = useState<MainRuneSlot>('skill');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner Oficial KOG */}
      <div className="bg-gradient-to-r from-amber-950/70 via-stone-900 to-red-950/70 border-b border-stone-800/80 px-4 py-2 text-center text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Calculadora de Probabilidades Oficiais de Runas — <strong>Grand Chase Classic & History</strong> (KOG Games)
          </span>
        </div>
      </div>

      {/* Cabeçalho Principal com os Slots no Topo */}
      <header className="border-b border-stone-800/80 bg-stone-950/95 sticky top-0 z-30 shadow-2xl backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          {/* Título e Identificação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300">
                <Sparkles className="w-4 h-4 text-stone-950" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-stone-100 flex items-center gap-2">
                  <span>Calculadora de Runas</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Grand Chase
                  </span>
                </h1>
                <p className="text-xs text-stone-400">
                  Selecione a aba desejada para calcular probabilidades, comparar atributos ou consultar guias.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Taxas Oficiais KOG</span>
            </div>
          </div>

          {/* OS 3 SLOTS: Runa de habilidade, Runa de atributo, Guias */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            {/* Slot 1: Runa de habilidade */}
            <button
              onClick={() => setSelectedSlot('skill')}
              className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer group select-none flex items-center justify-between ${
                selectedSlot === 'skill'
                  ? 'border-amber-400 bg-gradient-to-br from-purple-900/70 via-purple-950/80 to-stone-950 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-2 ring-amber-400'
                  : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-purple-500/50 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src="/assets/aistudio/image_de97ce87.png"
                    alt="Runa de habilidade"
                    className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shadow-lg border-2 border-amber-400 bg-purple-950/80 p-0.5 transform group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950 animate-pulse" />
                </div>
                <div>
                  <h2
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      selectedSlot === 'skill' ? 'text-amber-300' : 'text-stone-200 group-hover:text-amber-300'
                    }`}
                  >
                    Runa de habilidade
                  </h2>
                </div>
              </div>

              {selectedSlot === 'skill' && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <span>Ativo</span>
                </div>
              )}
            </button>

            {/* Slot 2: Runa de atributo */}
            <button
              onClick={() => setSelectedSlot('stat')}
              className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer group select-none flex items-center justify-between ${
                selectedSlot === 'stat'
                  ? 'border-amber-400 bg-gradient-to-br from-purple-900/70 via-purple-950/80 to-stone-950 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-2 ring-amber-400'
                  : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-amber-500/50 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src="/assets/aistudio/image_32232280.png"
                    alt="Runa de atributo"
                    className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shadow-lg border-2 border-amber-400 bg-purple-950/80 p-0.5 transform group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950 animate-pulse" />
                </div>
                <div>
                  <h2
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      selectedSlot === 'stat' ? 'text-amber-300' : 'text-stone-200 group-hover:text-amber-300'
                    }`}
                  >
                    Runa de atributo
                  </h2>
                </div>
              </div>

              {selectedSlot === 'stat' && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <span>Ativo</span>
                </div>
              )}
            </button>

            {/* Slot 3: Guias */}
            <button
              onClick={() => setSelectedSlot('guides')}
              className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer group select-none flex items-center justify-between ${
                selectedSlot === 'guides'
                  ? 'border-amber-400 bg-gradient-to-br from-purple-900/70 via-purple-950/80 to-stone-950 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-2 ring-amber-400'
                  : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-purple-500/50 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-lg border-2 border-amber-400 bg-purple-950/80 flex items-center justify-center p-1.5 transform group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950 animate-pulse" />
                </div>
                <div>
                  <h2
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      selectedSlot === 'guides' ? 'text-amber-300' : 'text-stone-200 group-hover:text-amber-300'
                    }`}
                  >
                    Guias
                  </h2>
                </div>
              </div>

              {selectedSlot === 'guides' && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <span>Ativo</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Selecionado */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {selectedSlot === 'skill' ? (
          <SkillRuneSection />
        ) : selectedSlot === 'stat' ? (
          <StatRuneSection />
        ) : (
          <GuidesSection />
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-6 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="text-stone-300 font-medium">
              Calculadora de Runas — Grand Chase Classic (KOG Games)
            </p>
            <p className="text-[11px] text-stone-400">
              Slots: <strong>Runa de habilidade</strong>, <strong>Runa de atributo</strong> e <strong>Guias</strong>. Probabilidades oficiais KOG Games.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-stone-400">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Taxas Oficiais KOG
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

