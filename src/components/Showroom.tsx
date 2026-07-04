import React, { useState, useEffect } from 'react';
import { SavedCase } from '../types';
import { sounds } from './SoundEffects';
import { Trash2, Play, Sparkles, FolderHeart } from 'lucide-react';

interface ShowroomProps {
  onSelectCaseToPlay: (savedCase: SavedCase) => void;
  onSelectCaseToEdit: (savedCase: SavedCase) => void;
}

export const Showroom: React.FC<ShowroomProps> = ({
  onSelectCaseToPlay,
  onSelectCaseToEdit,
}) => {
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);

  // Load saved cases from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('smartphone_cases_gallery');
      if (stored) {
        setSavedCases(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading saved cases:', e);
    }
  }, []);

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTrash();
    const updated = savedCases.filter((c) => c.id !== id);
    setSavedCases(updated);
    try {
      localStorage.setItem('smartphone_cases_gallery', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto max-h-[85vh] select-none">
      
      {/* Gallery Header */}
      <div className="text-center mb-8 flex flex-col items-center gap-1">
        <div className="p-3 bg-pink-100 rounded-full text-pink-500 shadow-inner">
          <FolderHeart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-sans font-black tracking-tight text-slate-800 mt-2">Minha Coleção Brilhante</h1>
        <p className="text-xs text-slate-500 font-medium max-w-sm">
          Aqui estão todas as capinhas de celular que você criou! Clique em uma para brincar, editar ou personalizar ainda mais.
        </p>
      </div>

      {savedCases.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-3xl border-2 border-dashed border-pink-200 shadow-sm max-w-md mx-auto mt-4">
          <span className="text-5xl animate-[bounce_2s_infinite_ease-in-out]">📱</span>
          <h3 className="font-sans font-bold text-slate-700 text-lg mt-4">Nenhuma capinha criada ainda!</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 font-medium leading-relaxed">
            Volte para o **Designer DIY** para criar sua primeiríssima capinha brilhante de smartphone com adesivos e pingentes!
          </p>
        </div>
      ) : (
        /* Cute Display Shelf */
        <div className="flex flex-col gap-12">
          
          {/* Shelves loop (display 3 cases per shelf level) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {savedCases.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col items-center transition-all duration-300"
              >
                {/* Smartphone Preview Card with tactile hover scale and glow effect */}
                <div 
                   onClick={() => {
                     sounds.playPop();
                     onSelectCaseToEdit(item);
                   }}
                   className="w-44 h-80 rounded-[32px] bg-slate-100 p-2.5 shadow-md hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:scale-105 hover:-translate-y-2.5 cursor-pointer transition-all duration-300 ease-out border-4 border-white flex flex-col relative overflow-hidden"
                   style={{ backgroundColor: item.caseColor }}
                >
                  
                  {/* Outer ears indicator inside case background */}
                  {item.ears !== 'none' && (
                    <div className="absolute top-0 inset-x-0 h-8 flex justify-center -translate-y-2 pointer-events-none select-none">
                      {item.ears === 'cat' && (
                        <div className="flex justify-between w-32 px-4 opacity-80">
                          <div className="w-6 h-6 rotate-45 rounded-sm" style={{ backgroundColor: item.earsColor }} />
                          <div className="w-6 h-6 rotate-45 rounded-sm" style={{ backgroundColor: item.earsColor }} />
                        </div>
                      )}
                      {item.ears === 'bunny' && (
                        <div className="flex justify-between w-24 px-2 opacity-80">
                          <div className="w-4 h-12 rounded-t-full rotate-[-12deg]" style={{ backgroundColor: item.earsColor }} />
                          <div className="w-4 h-12 rounded-t-full rotate-[12deg]" style={{ backgroundColor: item.earsColor }} />
                        </div>
                      )}
                      {item.ears === 'bear' && (
                        <div className="flex justify-between w-28 px-4 opacity-80">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.earsColor }} />
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.earsColor }} />
                        </div>
                      )}
                      {item.ears === 'unicorn' && (
                        <div className="w-4 h-10 rounded-t-full bg-yellow-300 animate-pulse border-r-2 border-white" />
                      )}
                    </div>
                  )}

                  {/* Camera module cutout visual */}
                  <div className="w-11 h-11 rounded-xl bg-slate-950/80 p-1 mb-2 shadow-inner flex flex-col gap-1 items-center justify-center relative">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-900" />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  </div>

                  {/* Drawn Canvas doodle layer thumbnail */}
                  <div className="flex-1 rounded-[22px] overflow-hidden bg-white/10 relative border border-white/20">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt="Minha Pintura"
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700/30">
                        ✨
                      </div>
                    )}

                    {/* Miniature sticker dots overlay */}
                    {item.stickers.slice(0, 3).map((st) => (
                      <div
                        key={st.id}
                        className="absolute text-xl pointer-events-none select-none"
                        style={{
                          left: `${st.x}%`,
                          top: `${st.y}%`,
                          transform: `translate(-50%, -50%) scale(${st.scale * 0.6}) rotate(${st.rotation}deg)`,
                        }}
                      >
                        {st.type === 'emoji' ? st.value : '⭐'}
                      </div>
                    ))}

                    {/* Miniature PopSocket */}
                    {item.popSocket && (
                      <div
                        className="absolute w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs pointer-events-none"
                        style={{
                          left: `${item.popSocket.x}%`,
                          top: `${item.popSocket.y}%`,
                          backgroundColor: item.caseColor,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        💖
                      </div>
                    )}
                  </div>

                  {/* Decorative dangling charm representation */}
                  {item.charm && (
                    <div className="absolute bottom-6 right-2 w-4 h-10 border border-dashed border-white/60 bg-pink-100/30 rounded-full flex items-center justify-center text-xs pointer-events-none animate-bounce">
                      ✨
                    </div>
                  )}

                </div>

                {/* Case Actions Layer */}
                <div className="mt-3 text-center flex flex-col items-center">
                  <h4 className="font-sans font-extrabold text-slate-700 text-sm tracking-tight">{item.name || 'Capinha Linda'}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{item.date}</p>
                  
                  {/* Mini control buttons */}
                  <div className="mt-2.5 flex gap-1.5 opacity-90">
                    <button
                      id={`play-saved-case-${item.id}`}
                      onClick={() => {
                        sounds.playPop();
                        onSelectCaseToPlay(item);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white rounded-full text-xs font-black flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Jogar OS
                    </button>
                    <button
                      id={`delete-saved-case-${item.id}`}
                      onClick={(e) => handleDeleteCase(item.id, e)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white rounded-full shadow-md cursor-pointer"
                      title="Excluir Capinha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Elegant White Toy Shelf plank underneath the designs */}
                <div className="w-48 h-2 bg-white rounded-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-slate-100 mt-2 z-[-1]" />
                <div className="w-40 h-3 bg-pink-200/40 rounded-b-lg shadow-sm z-[-2] -mt-1" />
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Floating Sparkly Details */}
      {savedCases.length > 0 && (
        <div className="text-center mt-12 text-[11px] text-pink-500 font-bold flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 animate-spin text-yellow-400" /> Deslize e explore o seu adorável armário de criações!
        </div>
      )}

    </div>
  );
};
