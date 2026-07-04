import React, { useState, useEffect } from 'react';
import { CaseCustomizer } from './components/CaseCustomizer';
import { Showroom } from './components/Showroom';
import { InteractivePlayMode } from './components/InteractivePlayMode';
import { SavedCase } from './types';
import { sounds } from './components/SoundEffects';
import { Sparkles, Heart, Smartphone, FolderHeart, Paintbrush, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

type AppView = 'designer' | 'showroom' | 'play_mode';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('designer');
  const [caseToEdit, setCaseToEdit] = useState<SavedCase | null>(null);
  const [caseToPlay, setCaseToPlay] = useState<SavedCase | null>(null);
  const [isMuted, setIsMuted] = useState(sounds.getMute());

  // Trigger a soft bubble pop sound on navigation clicks
  const handleNavigate = (view: AppView) => {
    sounds.playPop();
    setActiveView(view);
    if (view !== 'designer') {
      setCaseToEdit(null);
    }
  };

  const handleSelectCaseToPlay = (savedCase: SavedCase) => {
    sounds.playPop();
    setCaseToPlay(savedCase);
    setActiveView('play_mode');
  };

  const handleSelectCaseToEdit = (savedCase: SavedCase) => {
    sounds.playPop();
    setCaseToEdit(savedCase);
    setActiveView('designer');
  };

  const handleSavedSuccessfully = () => {
    // Navigate to showroom to celebrate
    setActiveView('showroom');
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex flex-col font-sans text-slate-800 relative overflow-hidden select-none">
      
      {/* Dynamic drifting background pastel dust bubbles for kid feel */}
      <div className="absolute top-10 left-[10%] w-32 h-32 rounded-full bg-pink-200/40 filter blur-xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-[15%] w-44 h-44 rounded-full bg-indigo-200/40 filter blur-xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-[40%] w-24 h-24 rounded-full bg-yellow-100/50 filter blur-lg animate-bounce pointer-events-none" />

      {/* 1. APP NAVBAR HEADER */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/40 sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        
        {/* Brand/Logo Title */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigate('designer')}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 flex items-center justify-center text-white shadow-md animate-bounce">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-black tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              SparkleCase DIY
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wide uppercase -mt-0.5">
              Personalizador de Capinha e Jogo Interativo
            </p>
          </div>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center gap-3 select-none">
          
          <button
            id="nav-diy-designer-btn"
            onClick={() => handleNavigate('designer')}
            className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              activeView === 'designer'
                ? 'bg-pink-500 text-white scale-105'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" /> Designer DIY
          </button>

          <button
            id="nav-my-collection-btn"
            onClick={() => handleNavigate('showroom')}
            className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              activeView === 'showroom'
                ? 'bg-purple-500 text-white scale-105'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5" /> Minha Coleção
          </button>

          {/* Master Volume Button */}
          <button
            id="master-mute-toggle"
            onClick={handleToggleMute}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-sm transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-500 hover:bg-emerald-100'
            }`}
            title={isMuted ? 'Ativar som' : 'Silenciar som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* 2. MAIN CORE APPLICATION WINDOW */}
      <main className="flex-1 flex flex-col items-center justify-center relative py-6 z-10">
        
        {/* VIEW A: DIY CUSTOMIZER WORKSPACE */}
        {activeView === 'designer' && (
          <CaseCustomizer
            caseToEdit={caseToEdit}
            onSavedSuccessfully={handleSavedSuccessfully}
            onClearEdit={() => setCaseToEdit(null)}
          />
        )}

        {/* VIEW B: SHOWROOM COLLECTION */}
        {activeView === 'showroom' && (
          <Showroom
            onSelectCaseToPlay={handleSelectCaseToPlay}
            onSelectCaseToEdit={handleSelectCaseToEdit}
          />
        )}

        {/* VIEW C: LIVE PLAY OS MODE */}
        {activeView === 'play_mode' && caseToPlay && (
          <div className="flex-1 flex flex-col items-center p-4 w-full max-w-md animate-[fadeIn_0.4s_ease_out]">
            
            {/* Back Button */}
            <div className="w-full flex justify-start mb-6 select-none">
              <button
                id="play-mode-back-btn"
                onClick={() => handleNavigate('showroom')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para o Armário
              </button>
            </div>

            {/* LIVE SMARTPHONE SCREEN PREVIEW HOLDER (framed inside her custom ears and colors!) */}
            <div className="relative my-6 select-none">
              
              {/* Outer ears drawn on front phone border too! */}
              {caseToPlay.ears !== 'none' && (
                <div className="absolute top-[-36px] inset-x-0 h-16 flex justify-center pointer-events-none select-none z-0">
                  {caseToPlay.ears === 'cat' && (
                    <div className="flex justify-between w-52 px-6">
                      <div className="w-12 h-12 rotate-45 rounded-tl-[16px] rounded-br-[16px] border-4 border-slate-900 bg-slate-200" style={{ backgroundColor: caseToPlay.earsColor }} />
                      <div className="w-12 h-12 rotate-45 rounded-tl-[16px] rounded-br-[16px] border-4 border-slate-900 bg-slate-200" style={{ backgroundColor: caseToPlay.earsColor }} />
                    </div>
                  )}
                  {caseToPlay.ears === 'bunny' && (
                    <div className="flex justify-between w-40 px-4">
                      <div className="w-8 h-24 rounded-t-full rotate-[-15deg] border-4 border-slate-900 flex justify-center pt-2" style={{ backgroundColor: caseToPlay.earsColor }}>
                        <div className="w-3.5 h-16 bg-pink-200 rounded-t-full" />
                      </div>
                      <div className="w-8 h-24 rounded-t-full rotate-[15deg] border-4 border-slate-900 flex justify-center pt-2" style={{ backgroundColor: caseToPlay.earsColor }}>
                        <div className="w-3.5 h-16 bg-pink-200 rounded-t-full" />
                      </div>
                    </div>
                  )}
                  {caseToPlay.ears === 'bear' && (
                    <div className="flex justify-between w-48 px-4">
                      <div className="w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center" style={{ backgroundColor: caseToPlay.earsColor }}>
                        <div className="w-6 h-6 rounded-full bg-pink-200" />
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center" style={{ backgroundColor: caseToPlay.earsColor }}>
                        <div className="w-6 h-6 rounded-full bg-pink-200" />
                      </div>
                    </div>
                  )}
                  {caseToPlay.ears === 'unicorn' && (
                    <div className="relative flex flex-col items-center">
                      <div className="w-7 h-20 bg-gradient-to-t from-amber-300 via-yellow-200 to-yellow-400 border-4 border-slate-900 rounded-t-full shadow-md animate-pulse rotate-[5deg] origin-bottom" />
                      <div className="w-10 h-3 bg-pink-200 rounded-full -mt-1 border-2 border-slate-900" />
                    </div>
                  )}
                </div>
              )}

              {/* LIVE PHONE SHELL CONTAINER */}
              <div
                className="w-64 h-[510px] rounded-[48px] border-[6px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col z-10"
                style={{ 
                  backgroundColor: caseToPlay.caseColor,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                }}
              >
                {/* The core interactive screen OS layer */}
                <div className="absolute inset-2 rounded-[40px] overflow-hidden bg-slate-950 flex flex-col">
                  <InteractivePlayMode
                    caseColor={caseToPlay.caseColor}
                    ears={caseToPlay.ears}
                    earsColor={caseToPlay.earsColor}
                  />
                </div>

              </div>

            </div>

            {/* Hint message */}
            <p className="text-[11px] text-slate-500 font-bold text-center mt-4">
              Toque no botão de início na parte inferior da tela para voltar à lista de aplicativos!
            </p>
          </div>
        )}

      </main>

      {/* 3. TOY DECORATIVE FOOTER */}
      <footer className="bg-white/50 border-t border-white/20 py-4 text-center text-xs font-semibold text-slate-500 select-none flex items-center justify-center gap-1 shrink-0 z-10">
        Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> para sua filha jogar e colorir!
      </footer>

    </div>
  );
}
