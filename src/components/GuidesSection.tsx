import React, { useState, useEffect, useRef } from 'react';
import { CharacterSelector } from './CharacterSelector';
import { sounds } from '../utils/soundEffects';
import { Sparkles, CheckCircle2, Upload, Image as ImageIcon, BookOpen, Swords } from 'lucide-react';

export type GuideSubTab = 'best_runes' | 'how_to_play_azin';

interface AzinRuneItem {
  id: string;
  fullText: string;
  defaultImage?: string;
  storageKey: string;
}

export const GuidesSection: React.FC = () => {
  // Personagem selecionado (padrão 'azin' para carregar no guia do Azin)
  const [selectedCharId, setSelectedCharId] = useState<string>('azin');
  // Sub-aba ativa (com 'best_runes' correspondente a 'Caminho Abissal')
  const [activeGuideTab, setActiveGuideTab] = useState<GuideSubTab>('best_runes');

  // Imagens personalizadas salvas localmente (caso o usuário envie ou carregue os arquivos originais)
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('azin_guide_rune_images');
      if (saved) {
        setCustomImages(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler imagens salvas:', e);
    }
  }, []);

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomImages((prev) => {
          const next = { ...prev, [id]: dataUrl };
          try {
            localStorage.setItem('azin_guide_rune_images', JSON.stringify(next));
          } catch (err) {
            console.error('Erro ao salvar imagem localmente:', err);
          }
          return next;
        });
        sounds.playSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  const guideTabs = [
    {
      id: 'best_runes' as GuideSubTab,
      label: 'Caminho abissal: Runas',
      icon: Sparkles,
    },
    {
      id: 'how_to_play_azin' as GuideSubTab,
      label: 'Caminho Abissal: Como jogar de azin',
      icon: Swords,
    },
  ];

  // As 3 Runas Certas solicitadas exatamente pelo usuário com imagens originais
  const correctRunes: AzinRuneItem[] = [
    {
      id: 'absoluto_intensidade',
      fullText: 'Absoluto Intensidade Runa: Dano de 4th SKill',
      // Imagem original intacta enviada pelo usuário (sem nenhuma alteração ou filtro de IA)
      defaultImage: '/assets/aistudio/Ins_gnia_R_nica_Roxa_com_10_51__abfcc18d.png',
      storageKey: 'absoluto_intensidade',
    },
    {
      id: 'amplificador_compreensao',
      fullText: 'Amplificador Compreensão Runa: Redução de Custo MP3',
      defaultImage: '/assets/aistudio/runa_compreensao.png',
      storageKey: 'amplificador_compreensao',
    },
    {
      id: 'amplificador_agilidade',
      fullText: 'Amplificador Agilidade Runa: Redução de tempo de espera MP3',
      defaultImage: '/assets/aistudio/runa_agilidade.png',
      storageKey: 'amplificador_agilidade',
    },
  ];

  const renderRuneCard = (rune: AzinRuneItem) => {
    const displayImage = customImages[rune.id] || rune.defaultImage;

    return (
      <div
        key={rune.id}
        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-stone-900/90 border-2 border-emerald-500/40 hover:border-emerald-500/70 shadow-lg transition-all"
      >
        {/* Imagem Original (sem filtros de IA, sem edições artificiais) */}
        <div className="relative group flex-shrink-0">
          {displayImage ? (
            <div className="relative">
              <img
                src={displayImage}
                alt={rune.fullText}
                referrerPolicy="no-referrer"
                className="w-24 sm:w-28 h-auto max-h-28 object-contain rounded-lg flex-shrink-0"
              />
              <button
                type="button"
                onClick={() => fileInputRefs.current[rune.id]?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold cursor-pointer"
                title="Trocar por outra imagem original"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Trocar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRefs.current[rune.id]?.click()}
              className="w-24 sm:w-28 h-24 sm:h-28 rounded-lg border-2 border-dashed border-stone-700 bg-stone-950/70 hover:border-emerald-500/80 hover:bg-stone-900 transition-all flex flex-col items-center justify-center gap-2 p-2 text-stone-400 hover:text-emerald-300 cursor-pointer"
              title="Clique para selecionar a imagem original do seu computador"
            >
              <ImageIcon className="w-6 h-6 text-stone-500" />
              <span className="text-[10px] text-center font-semibold leading-tight">
                Inserir Imagem Original
              </span>
            </button>
          )}

          {/* Input oculto para upload da imagem original */}
          <input
            type="file"
            accept="image/*"
            ref={(el) => {
              fileInputRefs.current[rune.id] = el;
            }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(rune.id, file);
            }}
            className="hidden"
          />
        </div>

        {/* Texto solicitado na frente da imagem */}
        <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
          <h4 className="text-base sm:text-xl font-bold text-amber-200 leading-snug">
            {rune.fullText}
          </h4>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* SELETOR DE PERSONAGENS DENTRO DE GUIAS */}
      <CharacterSelector
        selectedCharId={selectedCharId}
        onSelectChar={setSelectedCharId}
      />

      {/* NAVEGAÇÃO DE SUB-ABAS (Melhores Runas + futuras abas ao lado) */}
      <div className="space-y-4">
        <div className="bg-stone-900/60 p-2.5 rounded-2xl border border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {guideTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGuideTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveGuideTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO DA SUB-ABA 'CAMINHO ABISSAL' */}
        {activeGuideTab === 'best_runes' && (
          <div>
            {selectedCharId === 'azin' ? (
              /* GUIA DO AZIN: RUNAS CERTAS E ABA EXPLICAÇÃO ALINHADA NA MESMA ALTURA */
              <div className="pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Coluna da Esquerda: Runas Certas */}
                  <div className="lg:col-span-7 xl:col-span-7 flex flex-col space-y-4">
                    {/* Aba / Título 'Runas Certas' */}
                    <div className="flex items-center gap-3">
                      <div className="py-2.5 px-5 rounded-xl text-center text-sm sm:text-base font-bold border-2 border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/40 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Runas Certas</span>
                      </div>
                    </div>

                    {/* Lista Vertical de Runas Certas (3 Cards) */}
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      {correctRunes.map(renderRuneCard)}
                    </div>
                  </div>

                  {/* Coluna da Direita: Aba 'Explicação' perfeitamente alinhada e com a mesma altura */}
                  <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-4">
                    {/* Aba / Título 'Explicação' alinhada na mesma altura da aba 'Runas Certas' */}
                    <div className="flex items-center gap-3">
                      <div className="py-2.5 px-5 rounded-xl text-center text-sm sm:text-base font-bold border-2 border-amber-500/60 bg-amber-500/15 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>Explicação</span>
                      </div>
                    </div>

                    {/* Caixa de Conteúdo da Explicação ocupando exatamente a mesma altura dos cards ao lado */}
                    <div className="rounded-2xl border border-stone-800 bg-[#0d0e12]/95 p-5 sm:p-6 shadow-xl flex-1 flex flex-col justify-between space-y-4">
                      {/* Ponto 1: MP3 Divisor de Rios */}
                      <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        <p className="text-sm sm:text-base text-stone-200 font-medium leading-relaxed">
                          Você usa a segunda e terceira runa de <span className="text-amber-300 font-bold">MP3</span> para conseguir usar 2x seguidas o <span className="text-emerald-300 font-bold">divisor de rios</span>
                        </p>
                      </div>

                      {/* Ponto 2: MP4 Tec. secreta do gelo */}
                      <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        <p className="text-sm sm:text-base text-stone-200 font-medium leading-relaxed">
                          Apenas a primeira é de <span className="text-amber-300 font-bold">MP4</span> para aumentar o dano da skill de clear <span className="text-cyan-300 font-bold">&apos;&apos; Tec. secreta do gelo &apos;&apos;</span>
                        </p>
                      </div>

                      {/* Ponto 3: Pergunta em vermelho e resposta em branco */}
                      <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        <div className="text-sm sm:text-base leading-relaxed">
                          <span className="text-rose-400 font-bold block mb-1">por que não usar todas de MP4 ?</span>
                          <span className="text-white font-medium block">Sempre que você precisar da MP4 para o clear, você vai ter mana full, então ter as 2 ultimas runas de MP4 é completamente inutil</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO: SUB STATUS DAS RUNAS DE HABILIDADE E EXPLICAÇÃO LADO A LADO */}
                <div className="mt-8 pt-6 border-t border-stone-800/80">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Coluna da Esquerda: Sub Status das Runas de habilidade */}
                    <div className="lg:col-span-7 xl:col-span-7 flex flex-col space-y-4">
                      {/* Título */}
                      <div className="flex items-center gap-3">
                        <div className="py-2.5 px-5 rounded-xl text-center text-sm sm:text-base font-bold border-2 border-amber-500/60 bg-amber-500/15 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Sub Status das Runas de habilidade</span>
                        </div>
                      </div>

                      {/* Imagem enquadrada perfeitamente com a moldura original do jogo, sem bordas pretas adicionais */}
                      <div className="flex-1 flex items-start justify-center lg:justify-start">
                        <img
                          src="/assets/aistudio/image_8e379b09.png"
                          alt="Sub Status das Runas de habilidade"
                          className="w-full max-w-[480px] h-auto object-contain rounded-2xl shadow-2xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
                        />
                      </div>
                    </div>

                    {/* Coluna da Direita: Aba 'Explicação' ao lado da imagem */}
                    <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-4">
                      {/* Aba / Título 'Explicação' idêntica à superior */}
                      <div className="flex items-center gap-3">
                        <div className="py-2.5 px-5 rounded-xl text-center text-sm sm:text-base font-bold border-2 border-amber-500/60 bg-amber-500/15 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span>Explicação</span>
                        </div>
                      </div>

                      {/* Caixa de Conteúdo da Explicação alinhada em altura */}
                      <div className="rounded-2xl border border-stone-800 bg-[#0d0e12]/95 p-5 sm:p-6 shadow-xl flex-1 flex flex-col justify-start space-y-4">
                        {/* Ponto 1: Quantidade recomendada */}
                        <div className="p-4 sm:p-5 rounded-xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                          <div className="text-sm sm:text-base leading-relaxed space-y-2.5">
                            <h4 className="text-amber-300 font-bold text-base sm:text-lg">
                              Quantas Tecnicas secretas do gelo pegar ?
                            </h4>
                            <p className="text-white font-medium leading-relaxed">
                              Se a runa for <span className="text-purple-400 font-bold">lendária</span> precisa de ao menos <span className="text-emerald-300 font-bold">3</span> ( fica <span className="text-emerald-300 font-bold">9% de dano</span> ) para começar, mas se for profissionalizar, busque <span className="text-cyan-300 font-bold">5-6</span> que totaliza <span className="text-emerald-300 font-bold">15 a 18%</span> de dano na skill <span className="text-amber-300 font-bold">MP4</span>
                            </p>
                          </div>
                        </div>

                        {/* Ponto 2: Outra dica */}
                        <div className="p-4 sm:p-5 rounded-xl bg-stone-900/80 border border-stone-800/90 flex items-start gap-3.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                          <div className="text-sm sm:text-base leading-relaxed space-y-1.5">
                            <span className="text-amber-300 font-bold block text-base">
                              Outra dica:
                            </span>
                            <p className="text-white font-medium leading-relaxed">
                              Busque <span className="text-cyan-300 font-bold">2 tec. secreta do gelo</span> em cada runa, <span className="text-emerald-400 font-bold">prioridade 100%</span>, qualquer outra skill você ignora.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* OUTROS PERSONAGENS (Por enquanto sem conteúdo conforme solicitado) */
              <div className="min-h-[40px]" />
            )}
          </div>
        )}

        {/* CONTEÚDO DA SUB-ABA 'CAMINHO ABISSAL: COMO JOGAR DE AZIN' */}
        {activeGuideTab === 'how_to_play_azin' && (
          <div className="pt-2">
            <div className="rounded-2xl border border-stone-800 bg-[#0d0e12]/95 p-6 sm:p-8 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-amber-200">
                Caminho Abissal: Como jogar de azin
              </h3>
              <p className="text-stone-400 max-w-lg mx-auto text-sm sm:text-base">
                Espaço configurado para as dicas de combate, mecânicas de esquiva, combos e rotações de habilidades do Azin no Caminho Abissal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
