export interface FileCard {
  id: string; // Internal card UUID
  file_id: string; // Reference to 'files' table
  name: string;
  mime_type?: string;
  size?: number;
  type: 'file' | 'link'; // 'file' if uploaded via desk, 'link' if from vault
  content?: string; // Optional embedded content for desk-only files
  order: number;
  word_count?: number;
  token_count?: number;
  is_folded?: boolean;
  is_in_context?: boolean;
  is_liked?: boolean;
  is_hidden?: boolean;
}

export interface DeskState {
  items: FileCard[];
}

export interface Desk {
  id: string;
  pocket_id: string;
  name: string;
  canvas_state: DeskState;
  created_at: string;
  updated_at?: string;
}
