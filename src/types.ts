export type ToolType = 'brush' | 'spray' | 'glitter' | 'bucket' | 'eraser' | 'none';

export interface ColorOption {
  hex: string;
  name: string;
  type: 'solid' | 'glitter' | 'gradient';
  colors?: string[]; // for gradients
}

export type BasePatternType = 'solid' | 'marble' | 'stripes' | 'polka' | 'stars' | 'gradient' | 'waves';

export interface BasePatternOption {
  id: BasePatternType;
  name: string;
  description: string;
}

export interface Sticker {
  id: string;
  type: 'emoji' | 'vector';
  value: string; // emoji char or vector ID
  x: number; // percentage (0-100) of case width
  y: number; // percentage (0-100) of case height
  scale: number;
  rotation: number;
}

export interface PopSocketOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  style: 'circle' | 'heart' | 'cat' | 'star';
}

export interface PopSocketState {
  id: string; // matches pop socket option ID
  x: number; // percentage
  y: number; // percentage
  scale: number;
}

export interface PhoneCharmOption {
  id: string;
  name: string;
  color: string;
  style: 'beads' | 'stars' | 'hearts' | 'rainbow' | 'gamer';
}

export interface CaseEarsOption {
  id: 'none' | 'cat' | 'bunny' | 'bear' | 'unicorn';
  name: string;
  color: string;
}

export interface CameraLensOption {
  id: 'none' | 'glitter-pink' | 'metallic-gold' | 'neon-green' | 'cat-ears';
  name: string;
}

export interface CasePocketOption {
  id: 'none' | 'glitter-pink' | 'denim' | 'sticker-pocket' | 'holographic';
  name: string;
}

export interface SavedCase {
  id: string;
  name: string;
  thumbnail: string; // base64 image data or drawing data URL
  caseColor: string; // base case hex color
  pattern: BasePatternType;
  patternColor: string; // secondary pattern color
  stickers: Sticker[];
  popSocket: PopSocketState | null;
  charm: string | null; // charm option id
  ears: 'none' | 'cat' | 'bunny' | 'bear' | 'unicorn';
  earsColor: string;
  cameraLens: string; // lens id
  pocket: string; // pocket id
  date: string;
}
