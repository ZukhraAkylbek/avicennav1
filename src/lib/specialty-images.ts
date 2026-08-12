import urolog from "@/assets/spec-urolog.png.asset.json";
import gastro from "@/assets/spec-gastro.png.asset.json";
import kardio from "@/assets/spec-kardio.png.asset.json";
import nevro from "@/assets/spec-nevro.png.asset.json";
import gineko from "@/assets/spec-gineko.png.asset.json";
import travma from "@/assets/spec-travma.png.asset.json";
import hirurg from "@/assets/spec-hirurg.jpg.asset.json";
import endokrin from "@/assets/spec-endokrin.png.asset.json";
import pediatr from "@/assets/spec-pediatr.png.asset.json";

/** Иллюстрации направлений клиники по slug. */
const IMAGES: Record<string, string> = {
  urolog: urolog.url,
  gastroenterolog: gastro.url,
  kardiolog: kardio.url,
  nevrolog: nevro.url,
  ginekolog: gineko.url,
  travmatolog: travma.url,
  hirurg: hirurg.url,
  endokrinolog: endokrin.url,
  pediatr: pediatr.url,
};

const FALLBACKS = [kardio.url, nevro.url, gastro.url, travma.url];

export function specialtyImage(slug: string, index = 0): string {
  return IMAGES[slug] ?? FALLBACKS[index % FALLBACKS.length] ?? kardio.url;
}
