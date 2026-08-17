import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type Pair = { title: string; text: string };

/** Разбирает строки формата «Заголовок | Текст». */
export function parsePairsText(value: string | null | undefined): Pair[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: (title ?? "").trim(), text: rest.join("|").trim() };
    });
}

export function serializePairs(pairs: Pair[]): string {
  return pairs
    .filter((pair) => pair.title.trim() || pair.text.trim())
    .map((pair) => `${pair.title.trim()} | ${pair.text.trim().replace(/\n+/g, " ")}`)
    .join("\n");
}

type Props = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  titleLabel: string;
  textLabel: string;
  addLabel: string;
  /** Многострочное поле для второго значения (например, ответа) */
  multilineText?: boolean;
};

/**
 * Редактор пар «Заголовок | Текст» отдельными полями,
 * чтобы вопрос и ответ не попадали в одну строку.
 */
export function PairRows({
  value,
  onChange,
  titleLabel,
  textLabel,
  addLabel,
  multilineText = false,
}: Props) {
  const pairs = parsePairsText(value);

  const update = (next: Pair[]) => onChange(serializePairs(next));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...pairs];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    update(next);
  };

  return (
    <div className="space-y-3">
      {pairs.map((pair, index) => (
        <div key={index} className="bg-muted/40 rounded-lg p-3">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-xs font-semibold">#{index + 1}</span>
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
                className="text-brand-terracotta"
                onClick={() => update(pairs.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <Input
            className="mt-2"
            value={pair.title}
            placeholder={titleLabel}
            onChange={(e) => {
              const next = [...pairs];
              next[index] = { ...pair, title: e.target.value };
              update(next);
            }}
          />
          {multilineText ? (
            <Textarea
              rows={2}
              className="mt-2"
              value={pair.text}
              placeholder={textLabel}
              onChange={(e) => {
                const next = [...pairs];
                next[index] = { ...pair, text: e.target.value };
                update(next);
              }}
            />
          ) : (
            <Input
              className="mt-2"
              value={pair.text}
              placeholder={textLabel}
              onChange={(e) => {
                const next = [...pairs];
                next[index] = { ...pair, text: e.target.value };
                update(next);
              }}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => update([...pairs, { title: "", text: "" }])}
      >
        <Plus className="mr-2 size-4" aria-hidden="true" /> {addLabel}
      </Button>
    </div>
  );
}
