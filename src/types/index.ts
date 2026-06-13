export type Rarity = 'common' | 'rare' | 'legendary'
export type ItemType = 'character' | 'outfit' | 'accessory' | 'common'

export interface GameItem {
  id: string
  name: string
  nameRu: string
  rarity: Rarity
  type: ItemType
  characterId?: string
  svgPath: string
  lottiePath?: string
  description: string
  color: string
}

export interface Character extends GameItem {
  type: 'character'
  element: string
  planet: string
}

export interface PullResult {
  item: GameItem
  isDuplicate: boolean
}
