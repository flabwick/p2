// Start minimalist - you'll expand as you go
export type BlockType = 'text' | 'heading' | 'list' | 'image'

export interface Block {
  id: string
  type: BlockType
  content: any
}

export interface Card {
  id: string
  blocks: Block[]
  children?: Card[] // for nesting
}