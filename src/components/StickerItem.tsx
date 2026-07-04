import React, { useRef, useState, useEffect } from 'react';
import { Sticker } from '../types';
import { Trash2, Copy, RotateCw } from 'lucide-react';
import { sounds } from './SoundEffects';

interface StickerItemProps {
  sticker: Sticker;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updatedSticker: Sticker) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  containerRect: DOMRect | null;
}

export const StickerItem: React.FC<StickerItemProps> = ({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  containerRect,
}) => {
  const stickerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transformStart = useRef<{ angle: number; dist: number; scale: number; rotation: number }>({
    angle: 0,
    dist: 0,
    scale: 1,
    rotation: 0,
  });

  // Drag sticker
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStart.current = {
      x: clientX,
      y: clientY,
    };
  };

  // Resize and Rotate sticker
  const handleTransformStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsTransforming(true);

    if (!stickerRef.current || !containerRect) return;

    const rect = stickerRef.current.getBoundingClientRect();
    const stickerCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - stickerCenter.x;
    const dy = clientY - stickerCenter.y;

    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    transformStart.current = {
      angle,
      dist,
      scale: sticker.scale,
      rotation: sticker.rotation,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging && containerRect) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;

        // Convert pixels to percentage of the container size
        const pctDx = (dx / containerRect.width) * 100;
        const pctDy = (dy / containerRect.height) * 100;

        // Clamp inside the phone bounds
        let newX = Math.max(0, Math.min(100, sticker.x + pctDx));
        let newY = Math.max(0, Math.min(100, sticker.y + pctDy));

        onUpdate({
          ...sticker,
          x: newX,
          y: newY,
        });

        dragStart.current = {
          x: clientX,
          y: clientY,
        };
      }

      if (isTransforming && stickerRef.current && containerRect) {
        const rect = stickerRef.current.getBoundingClientRect();
        const stickerCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const dx = clientX - stickerCenter.x;
        const dy = clientY - stickerCenter.y;

        const currentAngle = Math.atan2(dy, dx);
        const currentDist = Math.sqrt(dx * dx + dy * dy);

        const dAngle = currentAngle - transformStart.current.angle;
        const dRotation = (dAngle * 180) / Math.PI;

        const scaleRatio = currentDist / transformStart.current.dist;
        let newScale = Math.max(0.4, Math.min(3.0, transformStart.current.scale * scaleRatio));

        onUpdate({
          ...sticker,
          rotation: (transformStart.current.rotation + dRotation) % 360,
          scale: newScale,
        });
      }
    };

    const handleEnd = () => {
      if (isDragging) setIsDragging(false);
      if (isTransforming) setIsTransforming(false);
    };

    if (isDragging || isTransforming) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isTransforming, sticker, containerRect]);

  const stickerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${sticker.x}%`,
    top: `${sticker.y}%`,
    transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    zIndex: isSelected ? 50 : 20,
  };

  // Helper to render customized premium vector stickers
  const renderVectorSticker = (id: string) => {
    switch (id) {
      case 'rainbow':
        return (
          <svg className="w-16 h-16 drop-shadow-md filter select-none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff5964" />
                <stop offset="25%" stopColor="#ffb85c" />
                <stop offset="50%" stopColor="#fcf340" />
                <stop offset="75%" stopColor="#35f29e" />
                <stop offset="100%" stopColor="#35bcff" />
              </linearGradient>
            </defs>
            <path
              d="M10 80 A 40 40 0 0 1 90 80"
              fill="none"
              stroke="url(#rainbowGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M25 80 A 25 25 0 0 1 75 80"
              fill="none"
              stroke="#ffffff80"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Soft Clouds at ends */}
            <circle cx="12" cy="78" r="10" fill="#ffffff" />
            <circle cx="22" cy="80" r="8" fill="#ffffff" />
            <circle cx="88" cy="78" r="10" fill="#ffffff" />
            <circle cx="78" cy="80" r="8" fill="#ffffff" />
          </svg>
        );

      case 'cute-dino':
        return (
          <svg className="w-16 h-16 drop-shadow-md select-none" viewBox="0 0 100 100">
            {/* Dino Body */}
            <path d="M20,60 C20,30 45,20 65,25 C75,27 85,35 85,45 C85,55 75,60 65,60 C55,60 50,75 55,85 C55,87 40,88 35,85 C25,80 20,75 20,60 Z" fill="#98db58" />
            {/* Belly */}
            <path d="M42,50 C42,40 50,35 58,37 C64,38 68,45 68,52 C68,59 62,65 54,63 C46,62 42,57 42,50 Z" fill="#e1f7a1" />
            {/* Eye */}
            <circle cx="72" cy="38" r="4.5" fill="#1e293b" />
            <circle cx="73.5" cy="36.5" r="1.5" fill="#ffffff" />
            {/* Rosy Cheek */}
            <circle cx="78" cy="45" r="3.5" fill="#f43f5e" opacity="0.6" />
            {/* Dino Back Spikes */}
            <polygon points="22,40 14,44 24,48" fill="#eab308" />
            <polygon points="26,29 18,33 28,37" fill="#eab308" />
            <polygon points="34,22 28,26 36,31" fill="#eab308" />
            {/* Small tail spike */}
            <polygon points="18,52 10,54 20,57" fill="#eab308" />
            {/* Happy mouth */}
            <path d="M78,41 Q74,44 71,41" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'boba':
        return (
          <svg className="w-16 h-16 drop-shadow-md select-none" viewBox="0 0 100 100">
            {/* Cup */}
            <path d="M30,20 L70,20 L62,80 L38,80 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="3" />
            {/* Tea Liquid */}
            <path d="M31.5,35 L68.5,35 L62.5,78 L37.5,78 Z" fill="#eab308" opacity="0.8" />
            {/* Pearls */}
            <circle cx="45" cy="72" r="5" fill="#1e293b" />
            <circle cx="55" cy="73" r="5" fill="#1e293b" />
            <circle cx="50" cy="65" r="5" fill="#1e293b" />
            <circle cx="40" cy="66" r="5" fill="#1e293b" />
            <circle cx="60" cy="68" r="5" fill="#1e293b" />
            <circle cx="48" cy="58" r="5" fill="#1e293b" />
            {/* Eyes & Smile on Cup */}
            <circle cx="45" cy="46" r="3" fill="#1e293b" />
            <circle cx="55" cy="46" r="3" fill="#1e293b" />
            <path d="M48,51 Q50,54 52,51" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            {/* Lid */}
            <ellipse cx="50" cy="20" rx="22" ry="5" fill="#f43f5e" />
            {/* Straw */}
            <rect x="47" y="5" width="6" height="30" rx="3" fill="#3b82f6" transform="rotate(10, 50, 20)" />
          </svg>
        );

      case 'donut':
        return (
          <svg className="w-16 h-16 drop-shadow-md select-none" viewBox="0 0 100 100">
            {/* Doughnut Body */}
            <circle cx="50" cy="50" r="35" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
            {/* Icing */}
            <path
              d="M50,18 C65,18 73,22 79,31 C85,40 82,60 76,68 C70,76 60,82 50,82 C40,82 25,76 21,65 C17,54 22,35 31,26 C40,17 45,18 50,18 Z"
              fill="#f472b6"
            />
            {/* Center Hole */}
            <circle cx="50" cy="50" r="12" fill="#ffffff" stroke="#c2410c" strokeWidth="2" />
            {/* Sprinkles */}
            <rect x="35" y="30" width="3" height="8" rx="1.5" fill="#3b82f6" transform="rotate(25, 35, 30)" />
            <rect x="62" y="32" width="3" height="8" rx="1.5" fill="#10b981" transform="rotate(-35, 62, 32)" />
            <rect x="32" y="55" width="3" height="8" rx="1.5" fill="#eab308" transform="rotate(45, 32, 55)" />
            <rect x="65" y="58" width="3" height="8" rx="1.5" fill="#f43f5e" transform="rotate(-15, 65, 58)" />
            <rect x="48" y="24" width="3" height="8" rx="1.5" fill="#ffffff" transform="rotate(90, 48, 24)" />
          </svg>
        );

      case 'sparkle-star':
        return (
          <svg className="w-16 h-16 drop-shadow-md select-none" viewBox="0 0 100 100">
            {/* Large glittering 4-point star */}
            <path
              d="M50 5 Q50 50 95 50 Q50 50 50 95 Q50 50 5 50 Q50 50 50 5"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="2"
            />
            {/* Tiny stars */}
            <path
              d="M80 20 Q80 30 90 30 Q80 30 80 40 Q80 30 70 30 Q80 30 80 20"
              fill="#fef08a"
            />
            <path
              d="M25 70 Q25 75 30 75 Q25 75 25 80 Q25 75 20 75 Q25 75 25 70"
              fill="#fef08a"
            />
          </svg>
        );

      default:
        return <span className="text-4xl select-none">✨</span>;
    }
  };

  return (
    <div
      id={`sticker-container-${sticker.id}`}
      ref={stickerRef}
      style={stickerStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
        sounds.playPop();
      }}
      className="group relative select-none"
    >
      {/* Target Sticker Content */}
      <div className="pointer-events-none select-none transition-transform active:scale-95 duration-100">
        {sticker.type === 'emoji' ? (
          <span className="text-5xl select-none filter drop-shadow-md block leading-none">
            {sticker.value}
          </span>
        ) : (
          renderVectorSticker(sticker.value)
        )}
      </div>

      {/* Decorative Interactive Frame (rendered when selected) */}
      {isSelected && (
        <div className="absolute inset-[-14px] border-2 border-dashed border-pink-400 rounded-lg pointer-events-none select-none animate-[pulse_2s_infinite_ease-in-out]">
          {/* Controls Panel Wrapper (pointer-events-auto so clicks work) */}
          <div className="absolute inset-0 pointer-events-auto">
            {/* Move handle in the center of sticker */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
              title="Arraste para mover"
            />

            {/* Top Left: Delete Sticker */}
            <button
              id={`delete-sticker-${sticker.id}`}
              onClick={(e) => {
                e.stopPropagation();
                sounds.playTrash();
                onDelete();
              }}
              className="absolute top-[-16px] left-[-16px] w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all border border-white cursor-pointer z-50"
              title="Remover"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Top Right: Duplicate Sticker */}
            <button
              id={`duplicate-sticker-${sticker.id}`}
              onClick={(e) => {
                e.stopPropagation();
                sounds.playPop();
                onDuplicate();
              }}
              className="absolute top-[-16px] right-[-16px] w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all border border-white cursor-pointer z-50"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Bottom Right: Rotate & Scale Handle */}
            <button
              id={`scale-rotate-sticker-${sticker.id}`}
              onMouseDown={handleTransformStart}
              onTouchStart={handleTransformStart}
              className="absolute bottom-[-16px] right-[-16px] w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg transition-all border border-white cursor-nwse-resize z-50"
              title="Segure e arraste para girar e redimensionar"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
