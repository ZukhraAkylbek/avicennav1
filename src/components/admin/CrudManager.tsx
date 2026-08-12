import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "select";
  options?: { value: string; label: string }[];
  hint?: string;
  fromTitle?: boolean;
};

type Row = Record<string, unknown> & { id: string };

type CrudManagerProps = {
  table: "specialties" | "doctors" | "pages" | "hero_slides" | "specialty_faqs";
  queryKey: string;
  select: string;
  orderBy?: { column: string; ascending?: boolean };
  fields: CrudField[];
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  defaults?: Record<string, unknown>;
  searchFields?: string[];
  addLabel?: string;
  filter?: { column: string; ilike: string };
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё-]+/gi, "-")
    .replace(/^-+|-+$/g, "");

export function CrudManager({
  table,
  queryKey,
  select,
  orderBy = { column: "sort_order", ascending: true },
  fields,
  titleField,
  subtitleField,
  badgeField = "is_active",
  defaults = {},
  searchFields = [],
  addLabel = "Добавить",
  filter,
}: CrudManagerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: [queryKey, filter?.ilike ?? null],
    queryFn: async (): Promise<Row[]> => {
      let q = supabase.from(table).select(select);
      if (filter) q = q.ilike(filter.column, filter.ilike);
      const { data, error } = await q.order(orderBy.column, {
        ascending: orderBy.ascending ?? true,
      });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = { ...values };
      const id = payload["id"] as string | undefined;
      delete payload["id"];
      if (id) {
        const update = supabase.from(table).update as unknown as (
          v: unknown,
        ) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
        const { error } = await update(payload).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const insert = supabase.from(table).insert as unknown as (
          v: unknown,
        ) => Promise<{ error: { message: string } | null }>;
        const { error } = await insert(payload);
        if (error) throw new Error(error.message);
      }

    },
    onSuccess: () => {
      toast.success("Сохранено");
      setDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Удалено");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    if (!rows) return [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    const keys = searchFields.length > 0 ? searchFields : [titleField];
    return rows.filter((row) =>
      keys.some((key) => String(row[key] ?? "").toLowerCase().includes(term)),
    );
  }, [rows, search, searchFields, titleField]);

  const openNew = () => {
    const base: Record<string, unknown> = { ...defaults };
    fields.forEach((f) => {
      if (!(f.name in base)) base[f.name] = f.type === "switch" ? true : f.type === "number" ? 0 : "";
    });
    setDraft(base);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск…"
          className="border-admin-line bg-card h-11 max-w-sm rounded-xl"
        />
        <Button
          onClick={openNew}
          className="bg-admin-blue hover:bg-admin-blue/90 h-11 shrink-0 rounded-xl font-semibold text-white"
        >
          <Plus className="mr-1.5 size-4" /> {addLabel}
        </Button>
      </div>

      <div className="border-admin-line bg-card overflow-hidden rounded-2xl border">
        {isLoading ? (
          <div className="text-admin-muted p-6 text-sm">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="text-admin-muted p-8 text-center text-sm">
            Пока ничего нет. Нажмите «{addLabel}».
          </div>
        ) : (
          <ul className="divide-admin-line divide-y">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="hover:bg-admin-bg/70 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition-colors sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-[15px] font-bold">
                      {String(row[titleField] ?? "—")}
                    </p>
                    {badgeField in row && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                          row[badgeField]
                            ? "bg-admin-teal-soft text-admin-teal"
                            : "bg-admin-bg text-admin-muted",
                        )}
                      >
                        {row[badgeField] ? "Опубликовано" : "Черновик"}
                      </span>
                    )}
                  </div>
                  {subtitleField && (
                    <p className="text-admin-muted mt-0.5 truncate text-[13px]">
                      {String(row[subtitleField] ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setDraft({ ...row })}
                    aria-label="Редактировать"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive rounded-xl"
                    onClick={() => {
                      if (confirm("Удалить запись?")) deleteMutation.mutate(row.id);
                    }}
                    aria-label="Удалить"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{draft?.["id"] ? "Редактирование" : "Новая запись"}</SheetTitle>
            <SheetDescription>Изменения появятся на сайте сразу после сохранения.</SheetDescription>
          </SheetHeader>

          {draft && (
            <form
              className="space-y-4 px-4 pb-8"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(draft);
              }}
            >
              {fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-[13px] font-semibold">
                    {field.label}
                  </Label>
                  {field.type === "switch" ? (
                    <div className="flex items-center gap-3 pt-1">
                      <Switch
                        id={field.name}
                        checked={Boolean(draft[field.name])}
                        onCheckedChange={(v) => setDraft({ ...draft, [field.name]: v })}
                      />
                      <span className="text-admin-muted text-[13px]">
                        {draft[field.name] ? "Показывать" : "Скрыто"}
                      </span>
                    </div>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      rows={5}
                      value={String(draft[field.name] ?? "")}
                      onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
                      className="border-admin-line rounded-xl"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      value={String(draft[field.name] ?? "")}
                      onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
                      className="border-admin-line bg-card h-11 w-full rounded-xl border px-3 text-sm"
                    >
                      <option value="">—</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === "number" ? "number" : "text"}
                      value={String(draft[field.name] ?? "")}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [field.name]:
                            field.type === "number" ? Number(e.target.value) : e.target.value,
                          ...(field.fromTitle && !draft["id"]
                            ? {}
                            : {}),
                        })
                      }
                      className="border-admin-line bg-card h-11 rounded-xl"
                    />
                  )}
                  {field.hint && <p className="text-admin-muted text-[12px]">{field.hint}</p>}
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-admin-blue hover:bg-admin-blue/90 h-11 flex-1 rounded-xl font-semibold text-white"
                >
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => setDraft(null)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
