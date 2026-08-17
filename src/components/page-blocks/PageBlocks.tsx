import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Award,
  Baby,
  Building2,
  CalendarCheck,
  ClipboardList,
  Clock,
  FlaskConical,
  Heart,
  HeartPulse,
  MapPin,
  Microscope,
  Minus,
  Phone,
  Plus,
  Scan,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/Reveal";
import type { BlockItem, PageBlock } from "@/lib/page-blocks";

export const BLOCK_ICONS: Record<string, LucideIcon> = {
  Activity,
  Award,
  Baby,
  Building2,
  CalendarCheck,
  ClipboardList,
  Clock,
  FlaskConical,
  Heart,
  HeartPulse,
  MapPin,
  Microscope,
  Phone,
  Scan,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
};

export const BLOCK_ICON_NAMES = Object.keys(BLOCK_ICONS);

function Icon({ name, className }: { name?: string | undefined; className?: string }) {
  const Cmp = (name && BLOCK_ICONS[name]) || Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
}

const BTN_PRIMARY =
  "bg-accent text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[16px] font-extrabold transition-colors";
const BTN_GHOST =
  "border-border text-foreground hover:border-primary/50 inline-flex items-center gap-2 rounded-2xl border bg-background/90 px-6 py-3.5 text-[16px] font-extrabold transition-colors";

function Buttons({ block, invert = false }: { block: PageBlock; invert?: boolean }) {
  const buttons = block.buttons ?? [];
  if (buttons.length === 0) return null;
  return (
    <div className="mt-7 flex flex-wrap gap-3">
      {buttons.map((btn, index) => (
        <a
          key={`${btn.label}-${index}`}
          href={btn.url || "#"}
          {...(/^https?:/.test(btn.url ?? "")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={
            index === 0
              ? BTN_PRIMARY
              : invert
                ? "text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 text-[16px] font-extrabold transition-colors"
                : BTN_GHOST
          }
        >
          {btn.label}
        </a>
      ))}
    </div>
  );
}

function Heading({ block }: { block: PageBlock }) {
  if (!block.title && !block.subtitle) return null;
  return (
    <div className="max-w-3xl">
      {block.title && (
        <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {block.title}
        </h2>
      )}
      {block.subtitle && (
        <p className="text-muted-foreground mt-3 text-[17px] leading-relaxed sm:text-[19px]">
          {block.subtitle}
        </p>
      )}
    </div>
  );
}

const Section = ({
  children,
  tone = "plain",
}: {
  children: React.ReactNode;
  tone?: "plain" | "soft";
}) => (
  <section className={tone === "soft" ? "bg-surface-soft" : ""}>
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">{children}</div>
  </section>
);

function paragraphs(text?: string) {
  return (text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function HeroBlock({ block }: { block: PageBlock }) {
  return (
    <section className="relative overflow-hidden">
      {block.image && (
        <>
          <img
            src={block.image}
            alt={block.title ?? ""}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <h1
            className={`text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-[56px] ${
              block.image ? "text-white" : "text-foreground"
            }`}
          >
            {block.title}
          </h1>
          {block.subtitle && (
            <p
              className={`mt-5 max-w-2xl text-[17px] leading-relaxed sm:text-[19px] ${
                block.image ? "text-white/85" : "text-muted-foreground"
              }`}
            >
              {block.subtitle}
            </p>
          )}
          <Buttons block={block} />
        </div>
      </div>
    </section>
  );
}

function TextBlock({ block }: { block: PageBlock }) {
  const items = block.items ?? [];
  return (
    <Section>
      <Heading block={block} />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {paragraphs(block.text).map((line, index) => (
          <p key={index} className="text-muted-foreground text-[17px] leading-relaxed sm:text-lg">
            {line}
          </p>
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="bg-surface-green rounded-2xl p-6">
              <p className="text-foreground text-lg font-extrabold">{item.title}</p>
              {item.text && (
                <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{item.text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function TimelineBlock({ block }: { block: PageBlock }) {
  const items = block.items ?? [];
  return (
    <Section tone="soft">
      <Heading block={block} />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Reveal key={item.id}>
            <div className="relative pt-8">
              <span className="bg-primary absolute top-0 left-0 size-3.5 rounded-full" />
              <span className="bg-primary/25 absolute top-[6px] right-0 left-5 h-0.5" />
              <p className="text-primary text-xl font-extrabold">{item.title}</p>
              {item.text && (
                <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{item.text}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function StatsBlock({ block }: { block: PageBlock }) {
  const items = block.items ?? [];
  return (
    <Section>
      <Heading block={block} />
      <div className="mt-8 grid auto-rows-fr grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <Reveal key={item.id}>
            <div className="border-border h-full rounded-2xl border p-6 text-center">
              {item.value ? (
                <p className="text-primary text-4xl font-extrabold sm:text-5xl">{item.value}</p>
              ) : (
                <Icon name={item.icon} className="text-primary mx-auto size-9" />
              )}
              <p className="text-foreground mt-2 text-[17px] font-extrabold">{item.title}</p>
              {item.text && (
                <p className="text-muted-foreground mt-1.5 text-[14px] leading-relaxed">
                  {item.text}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function CardsBlock({ block }: { block: PageBlock }) {
  const items = block.items ?? [];
  return (
    <Section tone="soft">
      <Heading block={block} />
      <div className="mt-8 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Wrapper = item.url ? "a" : "div";
          return (
            <Reveal key={item.id}>
              <Wrapper
                {...(item.url
                  ? {
                      href: item.url,
                      ...(/^https?:/.test(item.url)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {}),
                    }
                  : {})}
                className="bg-background border-border hover:border-primary/40 group flex h-full flex-col rounded-2xl border p-6 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="bg-surface-green text-primary grid size-12 shrink-0 place-items-center rounded-xl">
                    <Icon name={item.icon} className="size-6" />
                  </span>
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="ml-auto size-16 rounded-xl object-cover"
                    />
                  )}
                </div>
                <p className="text-foreground mt-4 text-lg font-extrabold break-words">
                  {item.title}
                </p>
                {item.text && (
                  <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                    {item.text}
                  </p>
                )}
                <span className="text-primary mt-auto flex justify-end pt-4">
                  <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Wrapper>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

function FaqRow({ item }: { item: BlockItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-border border-b">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-foreground text-[17px] font-extrabold sm:text-lg">{item.title}</span>
        <span className="bg-surface-green text-primary grid size-8 shrink-0 place-items-center rounded-full">
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
      {open && item.text && (
        <div className="pb-5">
          {paragraphs(item.text).map((line, index) => (
            <p
              key={index}
              className="text-muted-foreground mt-1 text-[16px] leading-relaxed whitespace-pre-line"
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function FaqBlock({ block }: { block: PageBlock }) {
  const items = block.items ?? [];
  return (
    <Section>
      <Heading block={block} />
      <div className="mt-6 max-w-4xl">
        {items.map((item) => (
          <FaqRow key={item.id} item={item} />
        ))}
      </div>
    </Section>
  );
}

function BranchesBlock({ block }: { block: PageBlock }) {
  const items = block.items ?? [];
  return (
    <Section tone="soft">
      <Heading block={block} />
      <div className="mt-8 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-background border-border flex h-full flex-col rounded-2xl border p-6"
          >
            <span className="bg-surface-green text-primary grid size-11 place-items-center rounded-xl">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <p className="text-foreground mt-4 text-lg font-extrabold">{item.title}</p>
            {item.text && (
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed whitespace-pre-line">
                {item.text}
              </p>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-auto pt-4 text-sm font-extrabold"
              >
                Построить маршрут
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

function MissionBlock({ block }: { block: PageBlock }) {
  return (
    <Section>
      <div className="grid items-center gap-8 lg:grid-cols-2">
        {block.image && (
          <img
            src={block.image}
            alt={block.title ?? "Миссия клиники"}
            className="h-72 w-full rounded-3xl object-cover sm:h-96"
          />
        )}
        <div>
          {block.title && (
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
              {block.title}
            </h2>
          )}
          {paragraphs(block.text).map((line, index) => (
            <p
              key={index}
              className="text-muted-foreground mt-4 text-[19px] leading-relaxed sm:text-[22px]"
            >
              {line}
            </p>
          ))}
          <Buttons block={block} />
        </div>
      </div>
    </Section>
  );
}

function OfferBlock({ block }: { block: PageBlock }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="bg-primary text-primary-foreground rounded-3xl px-6 py-12 sm:px-12">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{block.title}</h2>
        {block.subtitle && (
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed opacity-90 sm:text-[19px]">
            {block.subtitle}
          </p>
        )}
        <Buttons block={block} invert />
      </div>
    </section>
  );
}

export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks
        .filter((block) => !block.hidden)
        .map((block) => {
          switch (block.type) {
            case "hero":
              return <HeroBlock key={block.id} block={block} />;
            case "text":
              return <TextBlock key={block.id} block={block} />;
            case "timeline":
              return <TimelineBlock key={block.id} block={block} />;
            case "stats":
              return <StatsBlock key={block.id} block={block} />;
            case "cards":
              return <CardsBlock key={block.id} block={block} />;
            case "faq":
              return <FaqBlock key={block.id} block={block} />;
            case "branches":
              return <BranchesBlock key={block.id} block={block} />;
            case "mission":
              return <MissionBlock key={block.id} block={block} />;
            case "offer":
              return <OfferBlock key={block.id} block={block} />;
            default:
              return null;
          }
        })}
    </>
  );
}
