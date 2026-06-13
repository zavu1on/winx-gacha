import type { GameItem } from '@/types'

const WINX_CHARS = ['bloom', 'stella', 'flora', 'musa', 'tecna', 'aisha'] as const
const FORMS = ['winx', 'charmix', 'enchantix', 'believix', 'harmonix', 'sirenix'] as const
const FORM_NAMES: Record<string, string> = {
  winx: 'Winx',
  charmix: 'Charmix',
  enchantix: 'Enchantix',
  believix: 'Believix',
  harmonix: 'Harmonix',
  sirenix: 'Sirenix',
}
const CHAR_NAMES_RU: Record<string, string> = {
  bloom: 'Блум', stella: 'Стелла', flora: 'Флора',
  musa: 'Муза', tecna: 'Текна', aisha: 'Айша',
}
const CHAR_COLORS: Record<string, string> = {
  bloom: '#ff4500', stella: '#ffd700', flora: '#6dbf67',
  musa: '#e63946', tecna: '#9b5de5', aisha: '#00b4d8',
}

// Extensions differ per image (most are jpg, some are png)
const OUTFIT_EXT: Record<string, string> = {
  outfit_bloom_winx: 'jpg',
  outfit_bloom_charmix: 'png',
  outfit_bloom_enchantix: 'jpg',
  outfit_bloom_believix: 'jpg',
  outfit_bloom_harmonix: 'jpg',
  outfit_bloom_sirenix: 'jpg',
  outfit_stella_winx: 'jpg',
  outfit_stella_charmix: 'jpg',
  outfit_stella_enchantix: 'png',
  outfit_stella_believix: 'jpg',
  outfit_stella_harmonix: 'jpg',
  outfit_stella_sirenix: 'jpg',
  outfit_flora_winx: 'jpg',
  outfit_flora_charmix: 'jpg',
  outfit_flora_enchantix: 'png',
  outfit_flora_believix: 'jpg',
  outfit_flora_harmonix: 'jpg',
  outfit_flora_sirenix: 'jpg',
  outfit_musa_winx: 'jpg',
  outfit_musa_charmix: 'jpg',
  outfit_musa_enchantix: 'jpg',
  outfit_musa_believix: 'jpg',
  outfit_musa_harmonix: 'jpg',
  outfit_musa_sirenix: 'jpg',
  outfit_tecna_winx: 'jpg',
  outfit_tecna_charmix: 'jpg',
  outfit_tecna_enchantix: 'jpg',
  outfit_tecna_believix: 'jpg',
  outfit_tecna_harmonix: 'jpg',
  outfit_tecna_sirenix: 'jpg',
  outfit_aisha_winx: 'jpg',
  outfit_aisha_charmix: 'png',
  outfit_aisha_enchantix: 'png',
  outfit_aisha_believix: 'jpg',
  outfit_aisha_harmonix: 'jpg',
  outfit_aisha_sirenix: 'jpg',
}

export const OUTFITS: GameItem[] = WINX_CHARS.flatMap((charId) =>
  FORMS.map((form) => {
    const key = `outfit_${charId}_${form}`
    const ext = OUTFIT_EXT[key] ?? 'jpg'
    return {
      id: key,
      name: `${charId.charAt(0).toUpperCase() + charId.slice(1)} ${FORM_NAMES[form]}`,
      nameRu: `${CHAR_NAMES_RU[charId]} ${FORM_NAMES[form]}`,
      rarity: 'rare' as const,
      type: 'outfit' as const,
      characterId: charId,
      svgPath: `/assets/items/${key}.${ext}`,
      description: `Наряд ${FORM_NAMES[form]} для ${CHAR_NAMES_RU[charId]}`,
      color: CHAR_COLORS[charId],
    }
  })
)

export const ACCESSORIES: GameItem[] = [
  { id: 'acc_bloom_wand', name: 'Dragon Flame Wand', nameRu: 'Жезл Пламени Дракона', rarity: 'rare', type: 'accessory', characterId: 'bloom', svgPath: '/assets/items/outfit_bloom_winx.jpg', description: 'Жезл Пламени Дракона', color: '#ff4500' },
  { id: 'acc_stella_wand', name: 'Sun Staff', nameRu: 'Солнечный посох', rarity: 'rare', type: 'accessory', characterId: 'stella', svgPath: '/assets/items/outfit_stella_winx.jpg', description: 'Солнечный посох Стеллы', color: '#ffd700' },
  { id: 'acc_flora_wand', name: "Flora's Wand", nameRu: 'Волшебный жезл Флоры', rarity: 'rare', type: 'accessory', characterId: 'flora', svgPath: '/assets/items/outfit_flora_winx.jpg', description: 'Волшебный жезл Флоры', color: '#6dbf67' },
  { id: 'acc_musa_wand', name: 'Music Wand', nameRu: 'Музыкальный жезл', rarity: 'rare', type: 'accessory', characterId: 'musa', svgPath: '/assets/items/outfit_musa_winx.jpg', description: 'Музыкальный жезл Мусы', color: '#e63946' },
  { id: 'acc_tecna_wand', name: 'Digital Wand', nameRu: 'Цифровой жезл', rarity: 'rare', type: 'accessory', characterId: 'tecna', svgPath: '/assets/items/outfit_tecna_winx.jpg', description: 'Цифровой жезл Текны', color: '#9b5de5' },
  { id: 'acc_aisha_wand', name: 'Morphix Wand', nameRu: 'Жезл Морфикса', rarity: 'rare', type: 'accessory', characterId: 'aisha', svgPath: '/assets/items/outfit_aisha_winx.jpg', description: 'Жезл Морфикса Айши', color: '#00b4d8' },
  { id: 'acc_bloom_tiara', name: 'Bloom Enchantix Tiara', nameRu: 'Тиара Enchantix Блум', rarity: 'rare', type: 'accessory', characterId: 'bloom', svgPath: '/assets/items/outfit_bloom_enchantix.jpg', description: 'Тиара Enchantix Блум', color: '#ff4500' },
  { id: 'acc_stella_tiara', name: 'Stella Enchantix Tiara', nameRu: 'Тиара Enchantix Стеллы', rarity: 'rare', type: 'accessory', characterId: 'stella', svgPath: '/assets/items/outfit_stella_enchantix.png', description: 'Тиара Enchantix Стеллы', color: '#ffd700' },
  { id: 'acc_flora_tiara', name: 'Flora Enchantix Tiara', nameRu: 'Тиара Enchantix Флоры', rarity: 'rare', type: 'accessory', characterId: 'flora', svgPath: '/assets/items/outfit_flora_enchantix.png', description: 'Тиара Enchantix Флоры', color: '#6dbf67' },
  { id: 'acc_bloom_wings', name: 'Bloom Believix Wings', nameRu: 'Крылья Believix Блум', rarity: 'rare', type: 'accessory', characterId: 'bloom', svgPath: '/assets/items/outfit_bloom_believix.jpg', description: 'Крылья Believix Блум', color: '#ff4500' },
  { id: 'acc_stella_wings', name: 'Stella Believix Wings', nameRu: 'Крылья Believix Стеллы', rarity: 'rare', type: 'accessory', characterId: 'stella', svgPath: '/assets/items/outfit_stella_believix.jpg', description: 'Крылья Believix Стеллы', color: '#ffd700' },
  { id: 'acc_bloom_bottle', name: "Bloom's Fairy Dust Bottle", nameRu: 'Флакон волшебной пыли Блум', rarity: 'rare', type: 'accessory', characterId: 'bloom', svgPath: '/assets/items/outfit_bloom_enchantix.jpg', description: 'Флакон волшебной пыли Блум', color: '#ff4500' },
  { id: 'acc_flora_bottle', name: "Flora's Fairy Dust Bottle", nameRu: 'Флакон волшебной пыли Флоры', rarity: 'rare', type: 'accessory', characterId: 'flora', svgPath: '/assets/items/outfit_flora_enchantix.png', description: 'Флакон волшебной пыли Флоры', color: '#6dbf67' },
  { id: 'acc_bloom_bracelet', name: 'Bloom Sirenix Bracelet', nameRu: 'Браслет Sirenix Блум', rarity: 'rare', type: 'accessory', characterId: 'bloom', svgPath: '/assets/items/outfit_bloom_sirenix.jpg', description: 'Браслет Sirenix Блум', color: '#ff4500' },
  { id: 'acc_aisha_bracelet', name: 'Aisha Sirenix Bracelet', nameRu: 'Браслет Sirenix Айши', rarity: 'rare', type: 'accessory', characterId: 'aisha', svgPath: '/assets/items/outfit_aisha_sirenix.jpg', description: 'Браслет Sirenix Айши', color: '#00b4d8' },
  { id: 'acc_stella_ring', name: 'Solaria Ring', nameRu: 'Кольцо Солярии', rarity: 'rare', type: 'accessory', characterId: 'stella', svgPath: '/assets/items/acc_stella_ring.jpg', description: 'Кольцо королевства Солярия', color: '#ffd700' },
]

export const COMMONS: GameItem[] = [
  { id: 'dust_bloom', name: 'Bloom Fairy Dust', nameRu: 'Волшебная пыль Блум', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_bloom_winx.jpg', description: 'Красные огненные искры', color: '#ff4500' },
  { id: 'dust_stella', name: 'Stella Fairy Dust', nameRu: 'Волшебная пыль Стеллы', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_stella_winx.jpg', description: 'Золотые звёздочки', color: '#ffd700' },
  { id: 'dust_flora', name: 'Flora Fairy Dust', nameRu: 'Волшебная пыль Флоры', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_flora_winx.jpg', description: 'Зелёные лепестки', color: '#6dbf67' },
  { id: 'dust_musa', name: 'Musa Fairy Dust', nameRu: 'Волшебная пыль Мусы', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_musa_winx.jpg', description: 'Синие музыкальные ноты', color: '#e63946' },
  { id: 'dust_tecna', name: 'Tecna Fairy Dust', nameRu: 'Волшебная пыль Текны', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_tecna_winx.jpg', description: 'Фиолетовые пиксели', color: '#9b5de5' },
  { id: 'dust_aisha', name: 'Aisha Fairy Dust', nameRu: 'Волшебная пыль Айши', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_aisha_winx.jpg', description: 'Бирюзовые капли воды', color: '#00b4d8' },
  { id: 'sparkle_gold', name: 'Golden Sparkles', nameRu: 'Золотые искры', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_stella_believix.jpg', description: 'Мерцающие золотые частицы', color: '#ffd700' },
  { id: 'sparkle_silver', name: 'Silver Sparkles', nameRu: 'Серебряные искры', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_tecna_sirenix.jpg', description: 'Мерцающие серебряные частицы', color: '#c0c0c0' },
  { id: 'gem_ruby', name: 'Domino Ruby', nameRu: 'Рубин Домино', rarity: 'common', type: 'common', svgPath: '/assets/items/gem_ruby.png', description: 'Красный кристалл с планеты Домино', color: '#9b2335' },
  { id: 'gem_sapphire', name: 'Melody Sapphire', nameRu: 'Сапфир Мелоди', rarity: 'common', type: 'common', svgPath: '/assets/items/gem_sapphire.png', description: 'Синий кристалл с планеты Мелоди', color: '#1a6faf' },
  { id: 'gem_emerald', name: 'Linphea Emerald', nameRu: 'Изумруд Линфеи', rarity: 'common', type: 'common', svgPath: '/assets/items/gem_emerald.png', description: 'Зелёный кристалл с планеты Линфея', color: '#2e8b57' },
  { id: 'codex_fragment', name: 'Codex Fragment', nameRu: 'Фрагмент Кодекса', rarity: 'common', type: 'common', svgPath: '/assets/items/codex_fragment.png', description: 'Осколок магического кодекса', color: '#8b7355' },
  { id: 'magicpop', name: 'MagicPop', nameRu: 'MagicPop', rarity: 'common', type: 'common', svgPath: '/assets/items/magicpop.png', description: 'Радужный магический пузырь', color: '#ff69b4' },
  { id: 'legendarium_key', name: 'Legendarium Key', nameRu: 'Ключ от Легендариума', rarity: 'common', type: 'common', svgPath: '/assets/items/legendarium_key.jpg', description: 'Бронзовый ключ к книге легенд', color: '#cd7f32' },
  { id: 'ring_solaria', name: 'Ring of Solaria', nameRu: 'Кольцо Солярии', rarity: 'common', type: 'common', svgPath: '/assets/items/acc_stella_ring.jpg', description: 'Золотое кольцо королевства Солярия', color: '#ffd700' },
  { id: 'snowflake_icy', name: "Icy's Snowflake", nameRu: 'Снежинка Айси', rarity: 'common', type: 'common', svgPath: '/assets/items/snowflake_icy.jpg', description: 'Ледяная снежинка ведьмы Айси', color: '#a8dadc' },
  { id: 'lightning_stormy', name: "Stormy's Lightning", nameRu: 'Молния Шторми', rarity: 'common', type: 'common', svgPath: '/assets/items/lightning_stormy.jpg', description: 'Электрический разряд ведьмы Шторми', color: '#560bad' },
  { id: 'shadow_darcy', name: "Darcy's Shadow", nameRu: 'Тень Дарси', rarity: 'common', type: 'common', svgPath: '/assets/items/shadow_darcy.jpg', description: 'Тёмная аура ведьмы Дарси', color: '#6a0572' },
  { id: 'petal_rainbow', name: 'Rainbow Petal', nameRu: 'Радужный лепесток', rarity: 'common', type: 'common', svgPath: '/assets/items/outfit_flora_believix.jpg', description: 'Переливчатый магический лепесток', color: '#ff69b4' },
  { id: 'star_cosmix', name: 'Cosmix Star', nameRu: 'Звезда Космикс', rarity: 'common', type: 'common', svgPath: '/assets/items/star_cosmix.jpg', description: 'Галактическая звезда (сезон 8)', color: '#191970' },
]

export const STAR_POWER_ITEM: GameItem = {
  id: 'star_power',
  name: 'Star Power',
  nameRu: 'Звёздочка силы',
  rarity: 'rare',
  type: 'common',
  svgPath: '/assets/items/star_power.png',
  description: 'Получается при выпадении персонажа, которого уже открыли',
  color: '#ffd700',
}

export const ALL_RARE_ITEMS = [...OUTFITS, ...ACCESSORIES]
export const ALL_ITEMS = [...OUTFITS, ...ACCESSORIES, ...COMMONS]
