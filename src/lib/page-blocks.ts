/**
 * Структура визуальных блоков страницы.
 * Хранится в колонке pages.blocks (jsonb) и редактируется в админке.
 */

export type BlockType =
  | "hero"
  | "text"
  | "timeline"
  | "stats"
  | "cards"
  | "faq"
  | "branches"
  | "mission"
  | "offer";

export type BlockButton = {
  label: string;
  url: string;
};

export type BlockItem = {
  id: string;
  /** Вопрос / название карточки / год / цифра-подпись */
  title: string;
  /** Ответ / описание */
  text?: string;
  /** Крупное значение для блока «Достижения в цифрах» */
  value?: string;
  /** Название иконки Lucide, например Stethoscope */
  icon?: string;
  /** Ссылка на изображение */
  image?: string;
  /** Ссылка перехода */
  url?: string;
};

export type PageBlock = {
  id: string;
  type: BlockType;
  hidden?: boolean;
  title?: string;
  subtitle?: string;
  text?: string;
  image?: string;
  buttons?: BlockButton[];
  items?: BlockItem[];
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero (фото + заголовок)",
  text: "Текст (короткие абзацы)",
  timeline: "История — таймлайн",
  stats: "Достижения в цифрах",
  cards: "Карточки с иконками",
  faq: "Вопросы и ответы",
  branches: "Филиалы",
  mission: "Миссия (фото + текст)",
  offer: "Зелёный оффер",
};

export const BLOCK_TYPES = Object.keys(BLOCK_LABELS) as BlockType[];

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Какие поля элемента имеют смысл для конкретного типа блока. */
export const ITEM_FIELDS: Record<
  BlockType,
  Array<"title" | "text" | "value" | "icon" | "image" | "url">
> = {
  hero: [],
  text: ["title", "text"],
  timeline: ["title", "text"],
  stats: ["value", "title", "text", "icon"],
  cards: ["title", "text", "icon", "image", "url"],
  faq: ["title", "text"],
  branches: ["title", "text", "url"],
  mission: [],
  offer: [],
};

export const ITEM_FIELD_LABELS: Record<string, string> = {
  title: "Заголовок / вопрос",
  text: "Текст / ответ",
  value: "Цифра",
  icon: "Иконка",
  image: "Фото",
  url: "Ссылка",
};

export function parseBlocks(value: unknown): PageBlock[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((b): b is PageBlock => Boolean(b) && typeof b === "object" && "type" in (b as object))
    .map((b) => ({
      ...b,
      id: b.id || newId(),
      items: Array.isArray(b.items) ? b.items.map((i) => ({ ...i, id: i.id || newId() })) : [],
      buttons: Array.isArray(b.buttons) ? b.buttons : [],
    }));
}

export function emptyBlock(type: BlockType): PageBlock {
  const base: PageBlock = { id: newId(), type, items: [], buttons: [] };
  switch (type) {
    case "hero":
      return { ...base, title: "Заголовок страницы", subtitle: "Короткое описание", buttons: [] };
    case "offer":
      return {
        ...base,
        title: "Запишитесь на приём",
        subtitle: "Мы подберём врача и удобное время",
        buttons: [{ label: "Записаться онлайн", url: "https://n1272322.alteg.io/" }],
      };
    case "mission":
      return { ...base, title: "Наша миссия", text: "" };
    default:
      return { ...base, title: BLOCK_LABELS[type] };
  }
}
