import React, { useState } from 'react';
import { ChestGachaSimulator } from './ChestGachaSimulator';
import { RuneComparator } from './RuneComparator';
import {
  Scale,
  Box,
  Shield,
} from 'lucide-react';

export type StatSubTab = 'compare' | 'chests';

export const StatRuneSection: React.FC = () => {
  const [subTab, setSubTab] = useState<StatSubTab>('compare');

  const subNavItems = [
    {
      id: 'compare' as StatSubTab,
      label: 'Comparar Runas',
      sublabel: 'Comparação A vs B (Estilo Runes-BR)',
      icon: Scale,
    },
    {
      id: 'chests' as StatSubTab,
      label: 'Abrir Baús (Gacha)',
      sublabel: 'Simulador 1x, 10x, 100x',
      icon: Box,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header da Seção de Runa de Atributo com Imagem T5 e Paleta Roxo & Dourado */}
      <div className="bg-gradient-to-r from-purple-950/80 via-stone-900 to-amber-950/50 p-5 sm:p-6 rounded-2xl border-2 border-amber-400/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/assets/aistudio/image_32232280.png"
              alt="Runa de atributo T5"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl border-2 border-amber-400 shadow-xl bg-purple-950/90 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-amber-300 border border-amber-400/40">
                  Sistema de Runas de Atributo (T1 a T5)
                </span>
                <span className="text-xs text-stone-300 flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> KOG Oficial Classic
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight mt-1 flex items-center gap-2">
                <span>Calculadora & Comparador de Runa de Atributo</span>
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                Comparação de runas (A vs B) com cálculo de atributos por Formato, Tier (T1 a T5), Raridade e Nível (+0 a +9) oficial KOG.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-menu interno para Runa de Atributo */}
      <div className="bg-stone-900/60 p-2.5 rounded-2xl border border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Renderização do componente ativo dentro de Runa de Atributo */}
      <div>
        {subTab === 'compare' && <RuneComparator />}
        {subTab === 'chests' && <ChestGachaSimulator />}
      </div>
    </div>
  );
};
