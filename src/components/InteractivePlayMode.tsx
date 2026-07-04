import React, { useState, useEffect } from 'react';
import { sounds } from './SoundEffects';
import { Play, Volume2, VolumeX, Home, Music, Smile, Image as ImageIcon, Sparkles, Award } from 'lucide-react';

interface InteractivePlayModeProps {
  caseColor: string;
  ears: 'none' | 'cat' | 'bunny' | 'bear' | 'unicorn';
  earsColor: string;
}

type ActiveApp = 'home' | 'piano' | 'pet' | 'sounds' | 'wallpapers';

interface FloatingElement {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
}

export const InteractivePlayMode: React.FC<InteractivePlayModeProps> = ({
  caseColor,
  ears,
  earsColor,
}) => {
  const [activeApp, setActiveApp] = useState<ActiveApp>('home');
  const [currentTime, setCurrentTime] = useState('');
  const [isMuted, setIsMuted] = useState(sounds.getMute());
  const [wallpaper, setWallpaper] = useState('bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300');
  const [wallpaperName, setWallpaperName] = useState('Céu de Unicórnio');
  const [floaters, setFloaters] = useState<FloatingElement[]>([]);
  
  // Pet App State
  const [petAction, setPetAction] = useState<'idle' | 'happy' | 'eating'>('idle');
  const [petHappyCount, setPetHappyCount] = useState(0);
  const [foodItem, setFoodItem] = useState('');

  // Audio mute toggle helper
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Keep phone clock updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 instead of 0
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Float visual effects (hearts/notes) upward
  const addFloater = (content: string, color: string, clientX?: number, clientY?: number) => {
    const id = Math.random().toString();
    const x = clientX !== undefined ? clientX : Math.random() * 60 + 20; // 20% to 80% range
    const y = clientY !== undefined ? clientY : 80; // starts low

    const newFloater: FloatingElement = { id, x, y, content, color };
    setFloaters((prev) => [...prev, newFloater]);

    // Animate upward
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1500);
  };

  // PIANO NOTES DEF
  const pianoKeys = [
    { note: 'Dó', freq: 261.63, color: 'bg-red-400 border-red-500 text-red-900' },
    { note: 'Ré', freq: 293.66, color: 'bg-orange-400 border-orange-500 text-orange-900' },
    { note: 'Mi', freq: 329.63, color: 'bg-yellow-400 border-yellow-500 text-yellow-900' },
    { note: 'Fá', freq: 349.23, color: 'bg-emerald-400 border-emerald-500 text-emerald-900' },
    { note: 'Sol', freq: 392.00, color: 'bg-sky-400 border-sky-500 text-sky-900' },
    { note: 'Lá', freq: 440.00, color: 'bg-indigo-400 border-indigo-500 text-indigo-900' },
    { note: 'Si', freq: 493.88, color: 'bg-purple-400 border-purple-500 text-purple-900' },
    { note: 'Dó2', freq: 523.25, color: 'bg-pink-400 border-pink-500 text-pink-900' },
  ];

  const handlePlayPianoKey = (freq: number, note: string) => {
    sounds.playPianoNote(freq);
    addFloater('🎵', 'text-pink-500');
  };

  // SOUNDBOARD ITEMS
  const soundboardItems = [
    { emoji: '🐱', name: 'Miau', action: () => { sounds.playPianoNote(659.25); addFloater('😺', 'text-amber-500'); } },
    { emoji: '✨', name: 'Mágica', action: () => { sounds.playSparkle(); addFloater('✨', 'text-yellow-400'); } },
    { emoji: '🎮', name: 'Gamer', action: () => { sounds.playPianoNote(392); sounds.playPop(); addFloater('🎮', 'text-blue-500'); } },
    { emoji: '🫧', name: 'Bolha', action: () => { sounds.playPop(); addFloater('🫧', 'text-teal-400'); } },
    { emoji: '🎀', name: 'Pop', action: () => { sounds.playPop(); addFloater('💖', 'text-pink-400'); } },
    { emoji: '🔔', name: 'Sininho', action: () => { sounds.playSparkle(); addFloater('🔔', 'text-yellow-500'); } },
  ];

  // PET ACTIONS
  const handlePetCat = () => {
    setPetAction('happy');
    setPetHappyCount((prev) => prev + 1);
    sounds.playPianoNote(783.99); // high cute chime
    addFloater('💖', 'text-rose-500');
    setTimeout(() => {
      setPetAction('idle');
    }, 1200);
  };

  const handleFeedPet = (item: 'fish' | 'strawberry' | 'donut') => {
    setPetAction('eating');
    setFoodItem(item === 'fish' ? '🐟' : item === 'strawberry' ? '🍓' : '🍩');
    sounds.playPop();
    
    setTimeout(() => {
      sounds.playSplash(); // eating wet squish
      addFloater('😋', 'text-emerald-500');
    }, 500);

    setTimeout(() => {
      setPetAction('happy');
      addFloater('❤️', 'text-rose-600');
    }, 1200);

    setTimeout(() => {
      setPetAction('idle');
      setFoodItem('');
    }, 2400);
  };

  // WALLPAPERS LIST
  const wallpapersList = [
    { name: 'Céu de Unicórnio', style: 'bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300' },
    { name: 'Prado Ensolarado', style: 'bg-gradient-to-b from-sky-300 via-emerald-200 to-amber-100' },
    { name: 'Mundo dos Doces', style: 'bg-gradient-to-tr from-rose-300 to-orange-200' },
    { name: 'Lagoa da Sereia', style: 'bg-gradient-to-r from-teal-200 via-cyan-300 to-blue-300' },
    { name: 'Espaço Neon', style: 'bg-gradient-to-tr from-slate-900 via-purple-900 to-pink-900' },
    { name: 'Brilho Dourado', style: 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300' },
  ];

  const handleSetWallpaper = (wp: typeof wallpapersList[0]) => {
    setWallpaper(wp.style);
    setWallpaperName(wp.name);
    sounds.playPop();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950/20 rounded-[32px] overflow-hidden select-none">
      
      {/* Dynamic Floating animations overlay inside screen */}
      {floaters.map((f) => (
        <span
          key={f.id}
          className={`absolute pointer-events-none text-3xl font-bold animate-[bounce_1.5s_infinite_ease-in-out] ${f.color} transition-all duration-1000`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            transform: 'translate(-50%, -50%)',
            opacity: 1 - (100 - f.y) / 100, // fade out as it goes up
          }}
          ref={(el) => {
            if (el) {
              // Smooth physics pull upward
              setTimeout(() => {
                el.style.top = `${f.y - 65}%`;
                el.style.opacity = '0';
              }, 50);
            }
          }}
        >
          {f.content}
        </span>
      ))}

      {/* Live Phone Header Screen Status Bar */}
      <div className="h-8 bg-slate-900/40 backdrop-blur-sm px-6 flex justify-between items-center text-xs font-semibold text-white/95 tracking-wide select-none z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span>📶</span>
          <span className="text-[11px] font-mono">BrinquedoOS</span>
        </div>
        <div className="text-center font-bold">{currentTime}</div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleToggleMute} 
            className="hover:scale-115 active:scale-95 transition-transform mr-1 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          <span>🔋 100%</span>
        </div>
      </div>

      {/* Screen Body Content area */}
      <div className={`flex-1 relative overflow-hidden transition-all duration-300 ${wallpaper} flex flex-col p-4`}>
        
        {/* APP 1: HOME SCREEN */}
        {activeApp === 'home' && (
          <div className="flex-1 flex flex-col justify-between select-none">
            {/* Widget Area */}
            <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 text-center border border-white/40 shadow-sm flex flex-col items-center gap-1 animate-[fadeIn_0.5s_ease_out]">
              <span className="text-3xl">🎨</span>
              <h2 className="font-sans font-bold text-slate-800 text-base tracking-tight">Tela de Brincadeiras</h2>
              <p className="text-[11px] text-slate-700/90 font-medium">Toque nos aplicativos abaixo para se divertir com o celular!</p>
              <div className="mt-1 px-2.5 py-0.5 bg-pink-500/85 rounded-full text-[9px] text-white font-semibold flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Modo de Jogo Ativo
              </div>
            </div>

            {/* App Icons Grid */}
            <div className="grid grid-cols-3 gap-y-6 gap-x-3 p-2 select-none">
              {/* Pet app */}
              <button
                onClick={() => { sounds.playSlide(); setActiveApp('pet'); }}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
              >
                <div className="w-14 h-14 bg-amber-100 hover:bg-amber-50 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-amber-300 group-hover:scale-110 active:scale-95 transition-all">
                  🐱
                </div>
                <span className="text-[11px] font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">Pet Fofo</span>
              </button>

              {/* Piano app */}
              <button
                onClick={() => { sounds.playSlide(); setActiveApp('piano'); }}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
              >
                <div className="w-14 h-14 bg-pink-100 hover:bg-pink-50 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-pink-300 group-hover:scale-110 active:scale-95 transition-all">
                  🎹
                </div>
                <span className="text-[11px] font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">Teclas</span>
              </button>

              {/* Soundboard app */}
              <button
                onClick={() => { sounds.playSlide(); setActiveApp('sounds'); }}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
              >
                <div className="w-14 h-14 bg-indigo-100 hover:bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-indigo-300 group-hover:scale-110 active:scale-95 transition-all">
                  📣
                </div>
                <span className="text-[11px] font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">Sons</span>
              </button>

              {/* Wallpapers app */}
              <button
                onClick={() => { sounds.playSlide(); setActiveApp('wallpapers'); }}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
              >
                <div className="w-14 h-14 bg-teal-100 hover:bg-teal-50 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-teal-300 group-hover:scale-110 active:scale-95 transition-all">
                  🌅
                </div>
                <span className="text-[11px] font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">Fundo</span>
              </button>

              {/* Magic Case display app */}
              <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-default">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-purple-300">
                  📱
                </div>
                <span className="text-[11px] font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">Capinha DIY</span>
              </div>

              {/* Baby badges */}
              <div className="flex flex-col items-center gap-1.5 opacity-80 cursor-default">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-emerald-300">
                  💖
                </div>
                <span className="text-[11px] font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">Amor</span>
              </div>
            </div>

            {/* Empty Spacer */}
            <div />
          </div>
        )}

        {/* APP 2: MAGIC PIANO */}
        {activeApp === 'piano' && (
          <div className="flex-1 flex flex-col justify-between bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 shadow-inner select-none animate-[fadeIn_0.3s_ease_out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/30 pb-2 mb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-pink-500 animate-bounce" /> Piano Mágico
              </span>
              <button
                onClick={() => { sounds.playPop(); setActiveApp('home'); }}
                className="text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded-full font-bold cursor-pointer hover:bg-slate-900"
              >
                Fechar
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-800 font-semibold mb-2">Toque nas teclas para fazer música!</p>

            {/* Keyboard Layout */}
            <div className="flex-1 flex gap-1 items-stretch py-2 h-[180px] bg-slate-950/10 p-2 rounded-xl">
              {pianoKeys.map((key) => (
                <button
                  id={`piano-key-${key.note}`}
                  key={key.note}
                  onClick={() => handlePlayPianoKey(key.freq, key.note)}
                  className={`flex-1 ${key.color} rounded-lg border-b-[6px] active:border-b-[2px] active:translate-y-1 transition-all flex flex-col justify-end pb-3 items-center font-bold text-[11px] cursor-pointer focus:outline-none`}
                >
                  <span className="font-mono">{key.note}</span>
                </button>
              ))}
            </div>

            {/* Note sparkles list */}
            <div className="text-center text-[10px] text-slate-700/80 mt-1.5 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" /> Lindas notas musicais!
            </div>
          </div>
        )}

        {/* APP 3: MY CUTE PET */}
        {activeApp === 'pet' && (
          <div className="flex-1 flex flex-col justify-between bg-white/30 backdrop-blur-md rounded-2xl p-3 border border-white/40 shadow-lg select-none animate-[fadeIn_0.3s_ease_out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-1">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-500" /> Meu Gatinho Fofo
              </span>
              <button
                onClick={() => { sounds.playPop(); setActiveApp('home'); }}
                className="text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded-full font-bold cursor-pointer hover:bg-slate-900"
              >
                Fechar
              </button>
            </div>

            {/* Main Interactive Kitten Canvas Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative py-1">
              {/* Pet food floating visual */}
              {petAction === 'eating' && (
                <span className="absolute text-3xl animate-[bounce_0.6s_infinite_ease-in-out] top-8 z-30">
                  {foodItem}
                </span>
              )}

              {/* Kitten Visual Body container */}
              <div
                onClick={handlePetCat}
                className={`text-7xl cursor-pointer select-none relative transition-all duration-300 ${
                  petAction === 'happy'
                    ? 'scale-115 -translate-y-2 rotate-2'
                    : petAction === 'eating'
                    ? 'scale-105 translate-y-1 animate-pulse'
                    : 'hover:scale-105 active:scale-95'
                }`}
              >
                🐱
                {petAction === 'happy' && (
                  <span className="absolute -top-3 -right-3 text-2xl animate-ping">💖</span>
                )}
                {petAction === 'eating' && (
                  <span className="absolute -bottom-1 -left-1 text-xl animate-bounce">🍪</span>
                )}
              </div>

              {/* Kitten status badge */}
              <div className="mt-4 text-center">
                <p className="text-[11px] font-bold text-slate-800">
                  {petAction === 'happy'
                    ? 'Miau! Que gostoso! Ronronando... 🥰'
                    : petAction === 'eating'
                    ? 'Nham nham! Que delícia! 😋'
                    : 'Toque no gatinho para fazer carinho!'}
                </p>
                <p className="text-[9px] text-slate-600 font-semibold mt-0.5">
                  Felicidade: <span className="text-pink-500 font-bold">{petHappyCount}</span> ⭐
                </p>
              </div>
            </div>

            {/* Feeding Tray Toolbar */}
            <div className="bg-white/50 p-2 rounded-xl border border-white/40 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-center text-slate-800">Dê comida para o seu gatinho:</span>
              <div className="flex justify-around gap-1.5">
                <button
                  id="feed-fish"
                  onClick={() => handleFeedPet('fish')}
                  disabled={petAction === 'eating'}
                  className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all rounded-lg text-xs font-bold flex flex-col items-center cursor-pointer"
                >
                  <span className="text-lg">🐟</span>
                  <span className="text-[9px] text-amber-900 mt-0.5">Peixinho</span>
                </button>
                <button
                  id="feed-strawberry"
                  onClick={() => handleFeedPet('strawberry')}
                  disabled={petAction === 'eating'}
                  className="flex-1 py-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-300 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all rounded-lg text-xs font-bold flex flex-col items-center cursor-pointer"
                >
                  <span className="text-lg">🍓</span>
                  <span className="text-[9px] text-rose-900 mt-0.5">Morango</span>
                </button>
                <button
                  id="feed-donut"
                  onClick={() => handleFeedPet('donut')}
                  disabled={petAction === 'eating'}
                  className="flex-1 py-1.5 bg-pink-100 hover:bg-pink-200 border border-pink-300 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all rounded-lg text-xs font-bold flex flex-col items-center cursor-pointer"
                >
                  <span className="text-lg">🍩</span>
                  <span className="text-[9px] text-pink-900 mt-0.5">Rosquinha</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APP 4: FUN SOUNDBOARD */}
        {activeApp === 'sounds' && (
          <div className="flex-1 flex flex-col justify-between bg-white/30 backdrop-blur-md rounded-2xl p-3 border border-white/40 shadow-lg select-none animate-[fadeIn_0.3s_ease_out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-indigo-500 animate-spin" /> Sons Divertidos
              </span>
              <button
                onClick={() => { sounds.playPop(); setActiveApp('home'); }}
                className="text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded-full font-bold cursor-pointer hover:bg-slate-900"
              >
                Fechar
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-800 font-semibold mb-2">Toque nos botões para soltar sons engraçados!</p>

            {/* Soundboard Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2 p-1">
              {soundboardItems.map((item, index) => (
                <button
                  id={`soundboard-item-${index}`}
                  key={index}
                  onClick={item.action}
                  className="bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 active:scale-95 transition-all rounded-xl p-2 flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none shadow-sm"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-bold text-indigo-950">{item.name}</span>
                </button>
              ))}
            </div>

            <div className="text-center text-[9px] text-slate-700 mt-2 font-semibold">
              Áudio de alta fidelidade e efeitos mágicos!
            </div>
          </div>
        )}

        {/* APP 5: WALLPAPER */}
        {activeApp === 'wallpapers' && (
          <div className="flex-1 flex flex-col justify-between bg-white/30 backdrop-blur-md rounded-2xl p-3 border border-white/40 shadow-lg select-none animate-[fadeIn_0.3s_ease_out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-600" /> Fundos de Tela
              </span>
              <button
                onClick={() => { sounds.playPop(); setActiveApp('home'); }}
                className="text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded-full font-bold cursor-pointer hover:bg-slate-900"
              >
                Fechar
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-800 font-semibold mb-2">
              Atual: <span className="text-teal-900 font-bold">{wallpaperName}</span>
            </p>

            {/* Wallpapers grid selector */}
            <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto max-h-[190px] p-1">
              {wallpapersList.map((wp, index) => (
                <button
                  id={`wallpaper-select-${index}`}
                  key={index}
                  onClick={() => handleSetWallpaper(wp)}
                  className={`h-14 ${wp.style} rounded-lg border-2 active:scale-95 transition-all flex items-end p-1 justify-center cursor-pointer shadow-sm ${
                    wallpaperName === wp.name ? 'border-pink-500 scale-102 ring-2 ring-pink-300' : 'border-white'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-800 bg-white/80 px-1.5 py-0.5 rounded-full drop-shadow-sm filter">
                    {wp.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-center text-[9px] text-slate-700/80 mt-2 font-semibold">
              Toque no fundo de tela para trocar!
            </div>
          </div>
        )}

      </div>

      {/* Screen Bottom Navigation (Home Bar) */}
      <div className="h-11 bg-slate-900/60 backdrop-blur-md border-t border-white/10 flex justify-center items-center gap-8 shrink-0 z-10 select-none">
        {/* Simple tactile home button */}
        <button
          id="phone-home-button"
          onClick={() => {
            sounds.playSlide();
            setActiveApp('home');
          }}
          className="w-10 h-10 rounded-full bg-white/15 active:bg-white/30 hover:scale-105 active:scale-90 transition-all flex items-center justify-center border border-white/25 cursor-pointer text-white shadow-md"
          title="Ir para a Tela Inicial"
        >
          <Home className="w-5 h-5 text-white" />
        </button>
      </div>

    </div>
  );
};
