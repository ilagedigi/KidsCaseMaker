import React, { useState, useRef, useEffect } from 'react';
import { 
  ToolType, 
  ColorOption, 
  BasePatternType, 
  Sticker, 
  PopSocketOption, 
  PopSocketState, 
  PhoneCharmOption, 
  CaseEarsOption, 
  CameraLensOption, 
  CasePocketOption, 
  SavedCase 
} from '../types';
import { DrawingCanvas } from './DrawingCanvas';
import { StickerItem } from './StickerItem';
import { CharmPhysics } from './CharmPhysics';
import { sounds } from './SoundEffects';
import { 
  Palette, 
  Brush, 
  Smile, 
  Grid, 
  Cpu, 
  Sparkles, 
  Undo2, 
  Trash2, 
  Save, 
  FolderHeart, 
  Play, 
  SmilePlus, 
  Flame, 
  Moon, 
  RotateCcw 
} from 'lucide-react';

interface CaseCustomizerProps {
  onSavedSuccessfully: () => void;
  caseToEdit: SavedCase | null;
  onClearEdit: () => void;
}

// Child-friendly vibrant preset colors
const CASE_PRESET_COLORS: ColorOption[] = [
  { hex: '#ffccd5', name: 'Rosa Pastel', type: 'solid' },
  { hex: '#cbf3f0', name: 'Verde Água Pastel', type: 'solid' },
  { hex: '#e8dbfc', name: 'Sonho Lilás', type: 'solid' },
  { hex: '#ffecd2', name: 'Creme de Pêssego', type: 'solid' },
  { hex: '#d8f3dc', name: 'Campo de Menta', type: 'solid' },
  { hex: '#ff007f', name: 'Rosa Barbie', type: 'solid' },
  { hex: '#70d6ff', name: 'Azul Celeste', type: 'solid' },
  { hex: '#ffca3a', name: 'Amarelo Sol', type: 'solid' },
  { hex: '#8ac926', name: 'Limão Fresco', type: 'solid' },
  { hex: '#1e293b', name: 'Grafite da Meia-noite', type: 'solid' },
];

const BRUSH_PRESET_COLORS = [
  '#ffffff', '#000000', '#f43f5e', '#ec4899', '#d946ef', '#a855f7', 
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', 
  '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'
];

// Fun categories of emojis for stickers
const EMOJI_CATEGORIES = {
  animals: ['🦄', '🐱', '🦖', '🐼', '🐰', '🐶', '🦊', '🦁', '🐻', '🐨', '🐬', '🐙'],
  sweets: ['🍦', '🍩', '🍓', '🧁', '🍪', '🍬', '🍒', '🍉', '🍕', '🍟', '🍿', '🥤'],
  sparkles: ['💖', '⭐', '🌈', '🌸', '🎈', '🧸', '👑', '💫', '👻', '👽', '👾', '🎮', '🔔', '🚀']
};

const VECTOR_STICKERS = [
  { id: 'rainbow', name: 'Arco-íris', preview: '🌈' },
  { id: 'cute-dino', name: 'Dino Fofo', preview: '🦖' },
  { id: 'boba', name: 'Chá Boba', preview: '🧋' },
  { id: 'donut', name: 'Rosquinha', preview: '🍩' },
  { id: 'sparkle-star', name: 'Brilhantes', preview: '✨' },
];

const POP_SOCKETS: PopSocketOption[] = [
  { id: 'heart', name: 'Coração de Princesa', emoji: '💖', color: '#ff4d6d', style: 'heart' },
  { id: 'cat', name: 'Amigo Gatinho', emoji: '🐱', color: '#fed7aa', style: 'cat' },
  { id: 'star', name: 'Estrela de Glitter', emoji: '⭐', color: '#fbbf24', style: 'star' },
  { id: 'donut', name: 'Rosquinha Doce', emoji: '🍩', color: '#f472b6', style: 'circle' },
  { id: 'gamepad', name: 'Controle Arcade', emoji: '🎮', color: '#3b82f6', style: 'circle' },
];

const CHARMS: PhoneCharmOption[] = [
  { id: 'beads', name: 'Miçangas Ursinho', color: '#ffb3c1', style: 'beads' },
  { id: 'stars', name: 'Estrelas Cósmicas', color: '#fbc531', style: 'stars' },
  { id: 'hearts', name: 'Corações Cor-de-rosa', color: '#ec4899', style: 'hearts' },
  { id: 'rainbow', name: 'Laço Arco-íris', color: '#4bc0c0', style: 'rainbow' },
  { id: 'gamer', name: 'Pingente Retro Gamer', color: '#3b82f6', style: 'gamer' },
];

const EARS_OPTIONS: CaseEarsOption[] = [
  { id: 'cat', name: 'Orelhas de Gato 🐱', color: '#ffccd5' },
  { id: 'bunny', name: 'Orelhas de Coelho 🐰', color: '#fff0f3' },
  { id: 'bear', name: 'Orelhas de Urso 🐻', color: '#ffecd2' },
  { id: 'unicorn', name: 'Chifre de Unicórnio 🦄', color: '#fdf2e9' },
];

const LENS_OPTIONS: CameraLensOption[] = [
  { id: 'glitter-pink', name: 'Glitter Rosa 💖' },
  { id: 'metallic-gold', name: 'Ouro Metálico ✨' },
  { id: 'neon-green', name: 'Verde Neon 🟢' },
  { id: 'cat-ears', name: 'Molde Gatinho 🐱' },
];

const POCKET_OPTIONS: CasePocketOption[] = [
  { id: 'glitter-pink', name: 'Bolso Glitter Rosa 💖' },
  { id: 'denim', name: 'Jeans Azul Fofinho 👖' },
  { id: 'sticker-pocket', name: 'Porta-cartão 🎴' },
  { id: 'holographic', name: 'Prisma Holográfico 🦄' },
];

type CustomizerTab = 'paint' | 'stickers' | 'gadgets' | 'base';

export const CaseCustomizer: React.FC<CaseCustomizerProps> = ({
  onSavedSuccessfully,
  caseToEdit,
  onClearEdit,
}) => {
  // --- BASE CASE STATE ---
  const [caseColor, setCaseColor] = useState('#ffccd5');
  const [pattern, setPattern] = useState<BasePatternType>('solid');
  const [patternColor, setPatternColor] = useState('#ffffff');
  
  // --- DRAWING TOOL STATE ---
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [brushColor, setBrushColor] = useState('#f43f5e');
  const [brushSize, setBrushSize] = useState(12);
  const [canvasThumbnail, setCanvasThumbnail] = useState('');
  const [clearTrigger, setClearTrigger] = useState(0);
  const [undoTrigger, setUndoTrigger] = useState(0);

  // --- STICKERS STATE ---
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // --- GADGETS STATE ---
  const [popSocket, setPopSocket] = useState<PopSocketState | null>(null);
  const [selectedCharmId, setSelectedCharmId] = useState<string | null>(null);
  const [selectedEarsId, setSelectedEarsId] = useState<'none' | 'cat' | 'bunny' | 'bear' | 'unicorn'>('none');
  const [earsColor, setEarsColor] = useState('#ffccd5');
  const [selectedLensId, setSelectedLensId] = useState<string>('none');
  const [selectedPocketId, setSelectedPocketId] = useState<string>('none');

  // --- WORKSPACE LAYOUT & NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<CustomizerTab>('base');
  const [caseName, setCaseName] = useState('Minha Capinha Doce');
  const [emojiCategory, setEmojiCategory] = useState<'animals' | 'sweets' | 'sparkles'>('animals');
  
  // HTML references for touch mapping
  const phoneBodyRef = useRef<HTMLDivElement | null>(null);
  const [phoneRect, setPhoneRect] = useState<DOMRect | null>(null);

  // Load editing state if editing a case
  useEffect(() => {
    if (caseToEdit) {
      setCaseColor(caseToEdit.caseColor);
      setPattern(caseToEdit.pattern);
      setPatternColor(caseToEdit.patternColor || '#ffffff');
      setStickers(caseToEdit.stickers || []);
      setPopSocket(caseToEdit.popSocket);
      setSelectedCharmId(caseToEdit.charm);
      setSelectedEarsId(caseToEdit.ears);
      setEarsColor(caseToEdit.earsColor || caseToEdit.caseColor);
      setSelectedLensId(caseToEdit.cameraLens || 'none');
      setSelectedPocketId(caseToEdit.pocket || 'none');
      setCaseName(caseToEdit.name || 'Capinha Linda');
      // Set paint tool to none initially to allow stickers dragging
      setActiveTool('none');
    }
  }, [caseToEdit]);

  // Handle resizing to keep sticker touch coordinate maps accurate
  useEffect(() => {
    const updateRect = () => {
      if (phoneBodyRef.current) {
        setPhoneRect(phoneBodyRef.current.getBoundingClientRect());
      }
    };
    
    // Initial rect
    updateRect();
    
    const observer = new ResizeObserver(() => updateRect());
    if (phoneBodyRef.current) observer.observe(phoneBodyRef.current);

    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
    };
  }, []);

  // --- DRAWING CANVAS MUTATORS ---
  const handleCanvasChange = (dataUrl: string) => {
    setCanvasThumbnail(dataUrl);
  };

  const handleClearCanvas = () => {
    setClearTrigger((prev) => prev + 1);
  };

  const handleUndoCanvas = () => {
    setUndoTrigger((prev) => prev + 1);
  };

  // --- STICKER ACTION MUTATORS ---
  const handleAddSticker = (type: 'emoji' | 'vector', value: string) => {
    sounds.playPop();
    const newSticker: Sticker = {
      id: Math.random().toString(),
      type,
      value,
      x: 50, // center
      y: 50, // center
      scale: 1.0,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    setActiveTool('none'); // deactivate paint tool so she can place/drag sticker immediately!
  };

  const handleUpdateSticker = (updated: Sticker) => {
    setStickers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleDuplicateSticker = (original: Sticker) => {
    const duplicated: Sticker = {
      ...original,
      id: Math.random().toString(),
      x: Math.min(90, original.x + 8), // slightly offset
      y: Math.min(90, original.y + 8),
    };
    setStickers((prev) => [...prev, duplicated]);
    setSelectedStickerId(duplicated.id);
  };

  // --- GADGET ACCESSORIES MUTATORS ---
  const handleTogglePopSocket = (opt: PopSocketOption) => {
    sounds.playPop();
    if (popSocket && popSocket.id === opt.id) {
      // Remove if tapped same
      setPopSocket(null);
    } else {
      setPopSocket({
        id: opt.id,
        x: 50, // center
        y: 60, // center
        scale: 1.1,
      });
    }
  };

  const handleToggleCharm = (charmId: string) => {
    sounds.playPop();
    if (selectedCharmId === charmId) {
      setSelectedCharmId(null);
    } else {
      setSelectedCharmId(charmId);
    }
  };

  const handleToggleEars = (earsId: 'none' | 'cat' | 'bunny' | 'bear' | 'unicorn') => {
    sounds.playPop();
    if (selectedEarsId === earsId) {
      setSelectedEarsId('none');
    } else {
      setSelectedEarsId(earsId);
      // Auto-set matching ear color
      const option = EARS_OPTIONS.find((o) => o.id === earsId);
      if (option) {
        setEarsColor(option.color);
      }
    }
  };

  // --- SAVE DESIGN ---
  const handleSaveDesign = () => {
    sounds.playCameraShutter();
    
    const newSavedCase: SavedCase = {
      id: caseToEdit ? caseToEdit.id : Math.random().toString(),
      name: caseName.trim() || 'Minha Capinha Doce',
      thumbnail: canvasThumbnail,
      caseColor,
      pattern,
      patternColor,
      stickers,
      popSocket,
      charm: selectedCharmId,
      ears: selectedEarsId,
      earsColor,
      cameraLens: selectedLensId,
      pocket: selectedPocketId,
      date: new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const stored = localStorage.getItem('smartphone_cases_gallery');
      let galleryList: SavedCase[] = stored ? JSON.parse(stored) : [];
      
      if (caseToEdit) {
        // Edit existing
        galleryList = galleryList.map((c) => (c.id === caseToEdit.id ? newSavedCase : c));
        onClearEdit();
      } else {
        // Add new
        galleryList = [newSavedCase, ...galleryList];
      }

      localStorage.setItem('smartphone_cases_gallery', JSON.stringify(galleryList));
      onSavedSuccessfully();
    } catch (e) {
      console.error('Error saving custom case:', e);
    }
  };

  const activeCharmOption = CHARMS.find((c) => c.id === selectedCharmId) || null;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-stretch p-4 select-none">
      
      {/* 1. SMARTPHONE CASE PREVIEW STAGE (CENTER/LEFT) */}
      <div 
        onClick={() => setSelectedStickerId(null)} // deselect active sticker
        className="flex-1 bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30 shadow-xl flex flex-col items-center justify-center relative min-h-[480px]"
      >
        
        {/* Undo, Clear, Quick Action toolbar in the visual space */}
        <div className="absolute top-4 left-4 flex gap-2">
          {activeTool !== 'none' && (
            <>
              <button
                id="workspace-undo-btn"
                onClick={(e) => { e.stopPropagation(); handleUndoCanvas(); }}
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-md text-slate-700 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                title="Desfazer traço do pincel"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                id="workspace-clear-btn"
                onClick={(e) => { e.stopPropagation(); handleClearCanvas(); }}
                className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 shadow-md text-red-600 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                title="Limpar desenho"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Edit label banner */}
        {caseToEdit && (
          <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md tracking-wider uppercase animate-pulse">
            Modo de Edição
          </div>
        )}

        {/* SMARTPHONE 3D CANVAS WRAPPER CONTAINER */}
        <div className="relative select-none my-6">
          
          {/* Dynamic Dangling Charm Strap Attachment (sways dynamically behind & to the right of case) */}
          <CharmPhysics charmOption={activeCharmOption} />

          {/* DYNAMIC CASE EARS (drawn sticking out behind/top of case) */}
          {selectedEarsId !== 'none' && (
            <div className="absolute top-[-36px] inset-x-0 h-16 flex justify-center pointer-events-none select-none z-0">
              
              {selectedEarsId === 'cat' && (
                <div className="flex justify-between w-52 px-6">
                  {/* Left Ear */}
                  <div 
                    className="w-12 h-12 rotate-45 rounded-tl-[16px] rounded-br-[16px] border-4 border-slate-900 shadow-md"
                    style={{ backgroundColor: earsColor }}
                  >
                    <div className="w-6 h-6 rotate-12 mt-1 ml-1 bg-pink-300 rounded-tl-lg" />
                  </div>
                  {/* Right Ear */}
                  <div 
                    className="w-12 h-12 rotate-45 rounded-tl-[16px] rounded-br-[16px] border-4 border-slate-900 shadow-md"
                    style={{ backgroundColor: earsColor }}
                  >
                    <div className="w-6 h-6 rotate-12 mt-1 ml-1 bg-pink-300 rounded-tl-lg" />
                  </div>
                </div>
              )}

              {selectedEarsId === 'bunny' && (
                <div className="flex justify-between w-40 px-4">
                  {/* Left Ear */}
                  <div 
                    className="w-8 h-24 rounded-t-full rotate-[-15deg] border-4 border-slate-900 shadow-lg flex justify-center pt-2"
                    style={{ backgroundColor: earsColor }}
                  >
                    <div className="w-3.5 h-16 bg-pink-200 rounded-t-full" />
                  </div>
                  {/* Right Ear */}
                  <div 
                    className="w-8 h-24 rounded-t-full rotate-[15deg] border-4 border-slate-900 shadow-lg flex justify-center pt-2"
                    style={{ backgroundColor: earsColor }}
                  >
                    <div className="w-3.5 h-16 bg-pink-200 rounded-t-full" />
                  </div>
                </div>
              )}

              {selectedEarsId === 'bear' && (
                <div className="flex justify-between w-48 px-4">
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-slate-900 shadow-md flex items-center justify-center"
                    style={{ backgroundColor: earsColor }}
                  >
                    <div className="w-6 h-6 rounded-full bg-pink-200" />
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full border-4 border-slate-900 shadow-md flex items-center justify-center"
                    style={{ backgroundColor: earsColor }}
                  >
                    <div className="w-6 h-6 rounded-full bg-pink-200" />
                  </div>
                </div>
              )}

              {selectedEarsId === 'unicorn' && (
                <div className="relative flex flex-col items-center">
                  {/* Golden unicorn horn */}
                  <div className="w-7 h-20 bg-gradient-to-t from-amber-300 via-yellow-200 to-yellow-400 border-4 border-slate-900 rounded-t-full shadow-md animate-pulse rotate-[5deg] origin-bottom" />
                  <div className="w-10 h-3 bg-pink-200 rounded-full -mt-1 border-2 border-slate-900" />
                </div>
              )}

            </div>
          )}

          {/* THE SMARTPHONE CASE CONTAINER */}
          <div
            id="smartphone-case-container"
            ref={phoneBodyRef}
            className="w-64 h-[510px] rounded-[48px] border-[6px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col z-10 transition-all duration-300"
            style={{ 
              backgroundColor: caseColor,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
            }}
          >
            {/* Glossy sheen reflect layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none select-none z-30" />

            {/* Custom Camera Cutout / Lens Accessory */}
            <div 
              className={`absolute top-5 left-5 w-16 h-16 rounded-3xl border-4 border-slate-900 p-1 flex flex-col items-center justify-center gap-1 shadow-md z-40 transition-all ${
                selectedLensId === 'glitter-pink'
                  ? 'bg-gradient-to-tr from-pink-400 to-rose-300 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  : selectedLensId === 'metallic-gold'
                  ? 'bg-gradient-to-tr from-yellow-300 to-amber-500 border-amber-600'
                  : selectedLensId === 'neon-green'
                  ? 'bg-gradient-to-tr from-green-300 to-emerald-400 border-green-500'
                  : selectedLensId === 'cat-ears'
                  ? 'bg-slate-950/90 rounded-t-3xl rounded-b-xl border-indigo-400'
                  : 'bg-slate-950/90'
              }`}
            >
              {/* Dual lenses represent a cute camera island */}
              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center relative shadow-inner">
                <div className="w-2 h-2 rounded-full bg-sky-900 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-white absolute top-1 left-1" />
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center relative shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-900" />
              </div>

              {/* Glitter sparkles on lens cover if glitter is chosen */}
              {selectedLensId === 'glitter-pink' && (
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:6px_6px] pointer-events-none opacity-40 rounded-3xl" />
              )}
            </div>

            {/* THE RESPONSIVE ACTIVE PAINT LAYER (DRAWING CANVAS) */}
            <div className="absolute inset-0 w-full h-full rounded-[42px] overflow-hidden z-10">
              <DrawingCanvas
                baseColor={caseColor}
                pattern={pattern}
                patternColor={patternColor}
                activeTool={activeTool}
                brushColor={brushColor}
                brushSize={brushSize}
                onCanvasChange={handleCanvasChange}
                clearTrigger={clearTrigger}
                undoTrigger={undoTrigger}
              />
            </div>

            {/* STICKER OVERLAYS LAYER */}
            <div className="absolute inset-0 w-full h-full rounded-[42px] overflow-hidden pointer-events-none z-20">
              {stickers.map((st) => (
                <div key={st.id} className="pointer-events-auto">
                  <StickerItem
                    sticker={st}
                    isSelected={selectedStickerId === st.id}
                    onSelect={() => setSelectedStickerId(st.id)}
                    onUpdate={handleUpdateSticker}
                    onDelete={() => handleDeleteSticker(st.id)}
                    onDuplicate={() => handleDuplicateSticker(st)}
                    containerRect={phoneRect}
                  />
                </div>
              ))}
            </div>

            {/* PopSocket overlay grip */}
            {popSocket && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  sounds.playPop();
                }}
                className={`absolute w-20 h-20 rounded-full border-4 border-slate-900 flex items-center justify-center z-40 shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all select-none`}
                style={{
                  left: `${popSocket.x}%`,
                  top: `${popSocket.y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: caseColor,
                }}
              >
                {/* PopSocket details */}
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-dashed border-white/60 flex items-center justify-center relative">
                  <span className="text-3xl select-none filter drop-shadow-sm">
                    {POP_SOCKETS.find((p) => p.id === popSocket.id)?.emoji || '💖'}
                  </span>
                  
                  {/* Sparkle badge */}
                  <span className="absolute -top-1 -right-1 text-xs animate-pulse">✨</span>
                </div>
              </div>
            )}

            {/* Case Pocket Attachment Layer on bottom-back */}
            {selectedPocketId !== 'none' && (
              <div 
                className={`absolute bottom-6 inset-x-6 h-36 rounded-2xl border-4 border-slate-900 z-35 flex flex-col justify-end p-2 shadow-md ${
                  selectedPocketId === 'glitter-pink'
                    ? 'bg-gradient-to-tr from-pink-400/90 to-rose-400/90 shadow-[0_-4px_10px_rgba(244,63,94,0.4)]'
                    : selectedPocketId === 'denim'
                    ? 'bg-sky-700/90 border-dashed border-slate-950'
                    : selectedPocketId === 'sticker-pocket'
                    ? 'bg-slate-100/90 border-double border-slate-800'
                    : 'bg-gradient-to-br from-indigo-300/80 via-pink-300/80 to-cyan-300/80 shadow-lg'
                }`}
              >
                {/* Custom pocket slot card peek */}
                {selectedPocketId === 'sticker-pocket' && (
                  <div className="absolute top-[-16px] left-6 w-14 h-20 rounded-lg bg-pink-500 border-2 border-slate-900 shadow-md transform -rotate-12 flex flex-col items-center justify-center text-white text-[10px] font-black font-sans">
                    <span>VIP</span>
                    <span>⭐</span>
                  </div>
                )}

                {/* Pocket bottom lining */}
                <div className="w-full h-1 bg-slate-900/40 rounded" />
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 2. TABBED CONTROLLER DRAWER & SHELF (RIGHT) */}
      <div className="w-full md:w-[380px] bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col justify-between">
        
        {/* Case naming field header */}
        <div className="pb-4 mb-4 border-b border-slate-100">
          <label className="text-[10px] uppercase tracking-wider font-black text-slate-400">Título do Design</label>
          <div className="flex gap-2 mt-1">
            <input
              id="phone-case-name-input"
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-sans font-extrabold focus:outline-none focus:border-pink-300 text-sm shadow-inner"
              maxLength={22}
              placeholder="Dê um nome à sua capinha..."
            />
            
            {/* Save trigger button */}
            <button
              id="workspace-save-design-btn"
              onClick={handleSaveDesign}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-sans font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
              title="Salvar na Coleção"
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>

        {/* Categories Tab Navigation Buttons */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold shrink-0">
          <button
            onClick={() => { sounds.playSlide(); setActiveTab('base'); }}
            className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'base' ? 'bg-white shadow-sm text-pink-500 scale-102' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span className="text-[9px]">Capinha</span>
          </button>
          <button
            onClick={() => { sounds.playSlide(); setActiveTab('paint'); }}
            className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'paint' ? 'bg-white shadow-sm text-pink-500 scale-102' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brush className="w-4 h-4" />
            <span className="text-[9px]">Pintar</span>
          </button>
          <button
            onClick={() => { sounds.playSlide(); setActiveTab('stickers'); }}
            className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'stickers' ? 'bg-white shadow-sm text-pink-500 scale-102' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <SmilePlus className="w-4 h-4" />
            <span className="text-[9px]">Adesivos</span>
          </button>
          <button
            onClick={() => { sounds.playSlide(); setActiveTab('gadgets'); }}
            className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'gadgets' ? 'bg-white shadow-sm text-pink-500 scale-102' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="text-[9px]">Acessórios</span>
          </button>
        </div>

        {/* TAB 1: BASE COVERS & PATTERNS */}
        {activeTab === 'base' && (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1 animate-[fadeIn_0.2s_ease_out]">
            {/* Choose Base Case Color */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">1. Cor de Base da Capinha</span>
              <div className="grid grid-cols-5 gap-2 mt-1.5">
                {CASE_PRESET_COLORS.map((col) => (
                  <button
                    id={`base-color-btn-${col.hex}`}
                    key={col.hex}
                    onClick={() => { sounds.playPop(); setCaseColor(col.hex); }}
                    className={`w-10 h-10 rounded-full border-2 active:scale-90 transition-transform cursor-pointer relative flex items-center justify-center ${
                      caseColor === col.hex ? 'border-pink-500 scale-110 ring-2 ring-pink-200' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {caseColor === col.hex && <span className="text-white text-xs shadow-sm font-bold">✔️</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Custom Case Pattern */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">2. Estampa de Fundo</span>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {(['solid', 'marble', 'stripes', 'polka', 'stars', 'gradient', 'waves'] as BasePatternType[]).map((pat) => (
                  <button
                    id={`pattern-select-btn-${pat}`}
                    key={pat}
                    onClick={() => { sounds.playPop(); setPattern(pat); }}
                    className={`py-2 px-1 text-center rounded-xl border font-sans font-bold text-[10px] capitalize active:scale-95 transition-all cursor-pointer ${
                      pattern === pat ? 'bg-pink-100 border-pink-400 text-pink-700 font-extrabold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {pat === 'solid' ? 'Cor Lisa' : pat === 'marble' ? 'Mármore' : pat === 'stripes' ? 'Listras' : pat === 'polka' ? 'Bolinhas' : pat === 'stars' ? 'Estrelas' : pat === 'gradient' ? 'Degradê' : 'Ondas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Color modifier */}
            {pattern !== 'solid' && (
              <div className="mt-1">
                <span className="text-[11px] uppercase font-black text-slate-400">3. Cor dos Detalhes da Estampa</span>
                <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                  {BRUSH_PRESET_COLORS.slice(0, 10).map((col) => (
                    <button
                      id={`pattern-detail-color-${col}`}
                      key={col}
                      onClick={() => { sounds.playPop(); setPatternColor(col); }}
                      className={`w-8 h-8 rounded-full border active:scale-90 transition-all cursor-pointer relative flex items-center justify-center ${
                        patternColor === col ? 'border-pink-500 scale-105 ring-1 ring-pink-300' : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {patternColor === col && <span className="text-white text-[10px] font-bold">✔️</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAINT TOOLS */}
        {activeTab === 'paint' && (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1 animate-[fadeIn_0.2s_ease_out]">
            
            {/* Draw Brush options */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">1. Escolha o Pincel Mágico</span>
              <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs font-bold">
                {/* Standard felt tip brush */}
                <button
                  id="tool-brush-btn"
                  onClick={() => { sounds.playPop(); setActiveTool('brush'); }}
                  className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'brush' ? 'bg-pink-100 border-pink-400 text-pink-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🖌️ Canetinha Feltro
                </button>
                {/* Spray airbrush */}
                <button
                  id="tool-spray-btn"
                  onClick={() => { sounds.playPop(); setActiveTool('spray'); }}
                  className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'spray' ? 'bg-pink-100 border-pink-400 text-pink-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  💨 Spray de Cores
                </button>
                {/* Glitter pen */}
                <button
                  id="tool-glitter-btn"
                  onClick={() => { sounds.playPop(); setActiveTool('glitter'); }}
                  className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'glitter' ? 'bg-pink-100 border-pink-400 text-pink-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  ✨ Caneta de Glitter
                </button>
                {/* Bucket fill */}
                <button
                  id="tool-bucket-btn"
                  onClick={() => { sounds.playPop(); setActiveTool('bucket'); }}
                  className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeTool === 'bucket' ? 'bg-pink-100 border-pink-400 text-pink-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🪣 Balde de Tinta
                </button>
                {/* Eraser */}
                <button
                  id="tool-eraser-btn"
                  onClick={() => { sounds.playPop(); setActiveTool('eraser'); }}
                  className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all col-span-2 ${
                    activeTool === 'eraser' ? 'bg-red-50 border-red-400 text-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🧽 Borracha Mágica
                </button>
              </div>
            </div>

            {/* Brush size slider */}
            {activeTool !== 'none' && activeTool !== 'bucket' && (
              <div>
                <div className="flex justify-between text-[11px] uppercase font-black text-slate-400 mb-1">
                  <span>2. Tamanho do Pincel</span>
                  <span className="text-pink-500 font-extrabold">{brushSize}px</span>
                </div>
                <input
                  id="brush-size-slider"
                  type="range"
                  min="4"
                  max="32"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
              </div>
            )}

            {/* Brush Paint Palette Colors */}
            {activeTool !== 'none' && activeTool !== 'eraser' && (
              <div>
                <span className="text-[11px] uppercase font-black text-slate-400">3. Gaveta de Cores de Tinta</span>
                <div className="grid grid-cols-6 gap-1.5 mt-1.5">
                  {BRUSH_PRESET_COLORS.map((col) => (
                    <button
                      id={`paint-color-${col}`}
                      key={col}
                      onClick={() => { sounds.playPop(); setBrushColor(col); }}
                      className={`w-8 h-8 rounded-full border active:scale-90 transition-all cursor-pointer relative flex items-center justify-center ${
                        brushColor === col ? 'border-pink-500 scale-110 ring-2 ring-pink-200' : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {brushColor === col && (
                        <span className="text-white text-[10px] font-bold drop-shadow-sm">✔️</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STICKERS DRAWER */}
        {activeTab === 'stickers' && (
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1 animate-[fadeIn_0.2s_ease_out]">
            
            {/* Vector Premium Stickers Row */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">1. Adesivos Especiais</span>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {VECTOR_STICKERS.map((st) => (
                  <button
                    id={`vector-sticker-${st.id}`}
                    key={st.id}
                    onClick={() => handleAddSticker('vector', st.id)}
                    className="aspect-square bg-pink-50/50 hover:bg-pink-100 border border-pink-100 hover:border-pink-300 rounded-xl flex items-center justify-center text-2xl active:scale-90 transition-all shadow-sm cursor-pointer"
                    title={st.name}
                  >
                    {st.preview}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji category selection tab */}
            <div className="mt-1">
              <span className="text-[11px] uppercase font-black text-slate-400">2. Categoria de Emojis</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5 text-[10px] font-bold mt-1.5">
                <button
                  onClick={() => { sounds.playPop(); setEmojiCategory('animals'); }}
                  className={`py-1 rounded-md cursor-pointer transition-all ${
                    emojiCategory === 'animals' ? 'bg-white shadow-sm text-pink-500 font-black' : 'text-slate-500'
                  }`}
                >
                  🦄 Animais
                </button>
                <button
                  onClick={() => { sounds.playPop(); setEmojiCategory('sweets'); }}
                  className={`py-1 rounded-md cursor-pointer transition-all ${
                    emojiCategory === 'sweets' ? 'bg-white shadow-sm text-pink-500 font-black' : 'text-slate-500'
                  }`}
                >
                  🍩 Doces
                </button>
                <button
                  onClick={() => { sounds.playPop(); setEmojiCategory('sparkles'); }}
                  className={`py-1 rounded-md cursor-pointer transition-all ${
                    emojiCategory === 'sparkles' ? 'bg-white shadow-sm text-pink-500 font-black' : 'text-slate-500'
                  }`}
                >
                  ⭐ Estrelas
                </button>
              </div>

              {/* Emoji list shelf */}
              <div className="grid grid-cols-6 gap-2 mt-3 p-1 bg-slate-50/50 border border-slate-100 rounded-xl max-h-[140px] overflow-y-auto">
                {EMOJI_CATEGORIES[emojiCategory].map((emoji) => (
                  <button
                    id={`emoji-sticker-${emoji}`}
                    key={emoji}
                    onClick={() => handleAddSticker('emoji', emoji)}
                    className="w-10 h-10 hover:bg-white hover:scale-115 active:scale-90 rounded-lg flex items-center justify-center text-2xl transition-all cursor-pointer shadow-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 italic">
              Toque nos adesivos na capinha para redimensionar, girar ou duplicar!
            </p>
          </div>
        )}

        {/* TAB 4: GADGETS & ATTACHMENTS */}
        {activeTab === 'gadgets' && (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1 animate-[fadeIn_0.2s_ease_out]">
            
            {/* Case cute ears */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">1. Orelhinhas de Silicone</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {EARS_OPTIONS.map((earsOpt) => (
                  <button
                    id={`case-ears-${earsOpt.id}`}
                    key={earsOpt.id}
                    onClick={() => handleToggleEars(earsOpt.id)}
                    className={`py-2 px-1.5 rounded-xl border text-[11px] font-sans font-bold cursor-pointer transition-all ${
                      selectedEarsId === earsOpt.id ? 'bg-pink-100 border-pink-400 text-pink-700 font-black' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {earsOpt.name}
                  </button>
                ))}
              </div>

              {/* Ears color changer */}
              {selectedEarsId !== 'none' && (
                <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-pink-50/50 rounded-xl border border-pink-100/50">
                  <span className="text-[10px] font-bold text-pink-800">Cor das Orelhas:</span>
                  <div className="flex gap-1.5">
                    {CASE_PRESET_COLORS.slice(0, 5).map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => { sounds.playPop(); setEarsColor(col.hex); }}
                        className={`w-6 h-6 rounded-full border-2 ${
                          earsColor === col.hex ? 'border-pink-500 scale-105' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hanging chain charm straps */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">2. Pingente de Miçangas</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {CHARMS.map((chOpt) => (
                  <button
                    id={`bead-charm-${chOpt.id}`}
                    key={chOpt.id}
                    onClick={() => handleToggleCharm(chOpt.id)}
                    className={`py-2 px-1 rounded-xl border text-[10px] font-sans font-bold cursor-pointer transition-all ${
                      selectedCharmId === chOpt.id ? 'bg-pink-100 border-pink-400 text-pink-700 font-black shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🎈 {chOpt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom PopSockets */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">3. Suporte PopSocket</span>
              <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                {POP_SOCKETS.map((popOpt) => (
                  <button
                    id={`popsocket-btn-${popOpt.id}`}
                    key={popOpt.id}
                    onClick={() => handleTogglePopSocket(popOpt)}
                    className={`aspect-square rounded-full border flex items-center justify-center text-xl transition-all cursor-pointer ${
                      popSocket?.id === popOpt.id ? 'bg-pink-100 border-pink-500 scale-110 shadow-sm' : 'bg-slate-50 border-slate-200'
                    }`}
                    title={popOpt.name}
                  >
                    {popOpt.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera lens protections */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">4. Proteção de Lente da Câmera</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {LENS_OPTIONS.map((lensOpt) => (
                  <button
                    id={`camera-lens-${lensOpt.id}`}
                    key={lensOpt.id}
                    onClick={() => { sounds.playPop(); setSelectedLensId(selectedLensId === lensOpt.id ? 'none' : lensOpt.id); }}
                    className={`py-1.5 px-1 rounded-xl border text-[10px] font-sans font-bold cursor-pointer transition-all ${
                      selectedLensId === lensOpt.id ? 'bg-pink-100 border-pink-400 text-pink-700 font-black shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {lensOpt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Silicone back pockets */}
            <div>
              <span className="text-[11px] uppercase font-black text-slate-400">5. Bolso de Cartão Traseiro</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {POCKET_OPTIONS.map((pOpt) => (
                  <button
                    id={`back-pocket-${pOpt.id}`}
                    key={pOpt.id}
                    onClick={() => { sounds.playPop(); setSelectedPocketId(selectedPocketId === pOpt.id ? 'none' : pOpt.id); }}
                    className={`py-1.5 px-1.5 rounded-xl border text-[10px] font-sans font-bold cursor-pointer transition-all ${
                      selectedPocketId === pOpt.id ? 'bg-pink-100 border-pink-400 text-pink-700 font-black shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {pOpt.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Info panel footer */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Estação Criativa DIY Completa
        </div>

      </div>

    </div>
  );
};
