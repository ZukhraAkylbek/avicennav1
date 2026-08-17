import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { BLOCK_ICON_NAMES } from "@/components/page-blocks/PageBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  ITEM_FIELDS,
  ITEM_FIELD_LABELS,
  emptyBlock,
  newId,
  type BlockItem,
  type BlockType,
  type PageBlock,
} from "@/lib/page-blocks";
import { SITE_IMAGES_BUCKET } from "@/lib/site-content";

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `pages/${newId()}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 3650);
  if (signError || !data?.signedUrl) throw signError ?? new Error("Не удалось получить ссылку");
  return data.signedUrl;
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success("Фото загружено");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Label className="text-xs font-semibold">{label}</Label>
      <div className="mt-2 flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="size-16 rounded-lg object-cover" />
        ) : (
          <div className="bg-muted size-16 rounded-lg" />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void pick(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" aria-hidden="true" />
          {busy ? "Загрузка…" : value ? "Заменить" : "Загрузить"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

type Props = {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
};

/** Конструктор блоков страницы: добавление, удаление, порядок, текст, фото, иконки, ссылки. */
export function BlocksEditor({ blocks, onChange }: Props) {
  const [newType, setNewType] = useState<BlockType>("hero");

  const patch = (id: string, values: Partial<PageBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...values } : b)));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    onChange(next);
  };

  const patchItem = (blockId: string, itemId: string, values: Partial<BlockItem>) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    patch(blockId, {
      items: (block.items ?? []).map((i) => (i.id === itemId ? { ...i, ...values } : i)),
    });
  };

  const moveItem = (blockId: string, index: number, dir: -1 | 1) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const items = [...(block.items ?? [])];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index]!;
    const b = items[target]!;
    items[index] = b;
    items[target] = a;
    patch(blockId, { items });
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const fields = ITEM_FIELDS[block.type];
        return (
          <div key={block.id} className="border-border rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground text-sm font-extrabold">
                {index + 1}. {BLOCK_LABELS[block.type]}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)}>
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={block.hidden ? "Показать блок" : "Скрыть блок"}
                  onClick={() => patch(block.id, { hidden: !block.hidden })}
                >
                  {block.hidden ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-brand-terracotta"
                  onClick={() => onChange(blocks.filter((b) => b.id !== block.id))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                value={block.title ?? ""}
                placeholder="Заголовок блока"
                onChange={(e) => patch(block.id, { title: e.target.value })}
              />
              <Input
                value={block.subtitle ?? ""}
                placeholder="Подзаголовок"
                onChange={(e) => patch(block.id, { subtitle: e.target.value })}
              />
            </div>

            {(block.type === "text" || block.type === "mission") && (
              <Textarea
                rows={4}
                className="mt-3"
                value={block.text ?? ""}
                placeholder="Текст (каждая строка — отдельный абзац)"
                onChange={(e) => patch(block.id, { text: e.target.value })}
              />
            )}

            {(block.type === "hero" || block.type === "mission") && (
              <div className="mt-3">
                <ImageField
                  label="Фото блока"
                  value={block.image ?? ""}
                  onChange={(url) => patch(block.id, { image: url })}
                />
              </div>
            )}

            {(block.type === "hero" || block.type === "offer" || block.type === "mission") && (
              <div className="mt-4">
                <Label className="text-xs font-semibold">Кнопки</Label>
                <div className="mt-2 space-y-2">
                  {(block.buttons ?? []).map((btn, btnIndex) => (
                    <div key={btnIndex} className="flex gap-2">
                      <Input
                        value={btn.label}
                        placeholder="Текст кнопки"
                        onChange={(e) => {
                          const buttons = [...(block.buttons ?? [])];
                          buttons[btnIndex] = { ...btn, label: e.target.value };
                          patch(block.id, { buttons });
                        }}
                      />
                      <Input
                        value={btn.url}
                        placeholder="/about или https://…"
                        onChange={(e) => {
                          const buttons = [...(block.buttons ?? [])];
                          buttons[btnIndex] = { ...btn, url: e.target.value };
                          patch(block.id, { buttons });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-brand-terracotta"
                        onClick={() =>
                          patch(block.id, {
                            buttons: (block.buttons ?? []).filter((_, i) => i !== btnIndex),
                          })
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    patch(block.id, {
                      buttons: [...(block.buttons ?? []), { label: "Кнопка", url: "/" }],
                    })
                  }
                >
                  <Plus className="mr-2 size-4" aria-hidden="true" /> Добавить кнопку
                </Button>
              </div>
            )}

            {fields.length > 0 && (
              <div className="mt-4">
                <Label className="text-xs font-semibold">
                  {block.type === "faq" ? "Вопросы и ответы" : "Строки и карточки"}
                </Label>
                <div className="mt-2 space-y-3">
                  {(block.items ?? []).map((item, itemIndex) => (
                    <div key={item.id} className="bg-muted/40 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-xs font-semibold">
                          #{itemIndex + 1}
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(block.id, itemIndex, -1)}
                          >
                            <ArrowUp className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(block.id, itemIndex, 1)}
                          >
                            <ArrowDown className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-brand-terracotta"
                            onClick={() =>
                              patch(block.id, {
                                items: (block.items ?? []).filter((i) => i.id !== item.id),
                              })
                            }
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {fields.includes("value") && (
                          <Input
                            value={item.value ?? ""}
                            placeholder="Цифра, например 25+"
                            onChange={(e) =>
                              patchItem(block.id, item.id, { value: e.target.value })
                            }
                          />
                        )}
                        {fields.includes("title") && (
                          <Input
                            value={item.title ?? ""}
                            placeholder={
                              block.type === "faq"
                                ? "Вопрос"
                                : block.type === "timeline"
                                  ? "Год"
                                  : ITEM_FIELD_LABELS["title"]
                            }
                            onChange={(e) =>
                              patchItem(block.id, item.id, { title: e.target.value })
                            }
                          />
                        )}
                        {fields.includes("url") && (
                          <Input
                            value={item.url ?? ""}
                            placeholder="Ссылка (/diagnostika или https://…)"
                            onChange={(e) => patchItem(block.id, item.id, { url: e.target.value })}
                          />
                        )}
                        {fields.includes("icon") && (
                          <select
                            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                            value={item.icon ?? ""}
                            onChange={(e) => patchItem(block.id, item.id, { icon: e.target.value })}
                          >
                            <option value="">— иконка по умолчанию —</option>
                            {BLOCK_ICON_NAMES.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {fields.includes("text") && (
                        <Textarea
                          rows={2}
                          className="mt-2"
                          value={item.text ?? ""}
                          placeholder={block.type === "faq" ? "Ответ" : "Описание"}
                          onChange={(e) => patchItem(block.id, item.id, { text: e.target.value })}
                        />
                      )}

                      {fields.includes("image") && (
                        <div className="mt-2">
                          <ImageField
                            label="Фото карточки"
                            value={item.image ?? ""}
                            onChange={(url) => patchItem(block.id, item.id, { image: url })}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    patch(block.id, {
                      items: [...(block.items ?? []), { id: newId(), title: "", text: "" }],
                    })
                  }
                >
                  <Plus className="mr-2 size-4" aria-hidden="true" />
                  {block.type === "faq" ? "Добавить вопрос" : "Добавить строку"}
                </Button>
              </div>
            )}
          </div>
        );
      })}

      <div className="border-border flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-4">
        <select
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          value={newType}
          onChange={(e) => setNewType(e.target.value as BlockType)}
        >
          {BLOCK_TYPES.map((type) => (
            <option key={type} value={type}>
              {BLOCK_LABELS[type]}
            </option>
          ))}
        </select>
        <Button type="button" onClick={() => onChange([...blocks, emptyBlock(newType)])}>
          <Plus className="mr-2 size-4" aria-hidden="true" /> Добавить блок
        </Button>
      </div>
    </div>
  );
}
