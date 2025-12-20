
export enum QRType {
  TEXT = 'text',
  URL = 'url',
  WIFI = 'wifi',
  VCARD = 'vcard',
  FILE = 'file'
}

export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  imageSettings?: {
    src: string;
    x?: number;
    y?: number;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export interface HistoryItem {
  id: string;
  type: QRType;
  value: string;
  timestamp: number;
  label?: string;
}
