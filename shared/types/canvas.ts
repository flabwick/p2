export type BlockType = 'text' | 'heading' | 'list' | 'image' | 'file' | 'file_path' | 'long_text' | 'markdown'

export interface CanvasBlock {
  id: string;
  card_id: string;
  type: BlockType;
  content: any;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CanvasCard {
  id: string;
  canvas_id: string;
  name: string;
  order: number;
  is_collapsed: boolean;
  blocks: CanvasBlock[];
  created_at: string;
  updated_at: string;
}

export interface Canvas {
  id: string;
  pocket_id: string;
  name: string;
  role_id?: string;
  dsl_version: string;
  cards: CanvasCard[];
  created_at: string;
  updated_at: string;
}
