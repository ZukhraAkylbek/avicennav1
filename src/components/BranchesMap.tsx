/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";

import { CLINIC, doubleGisSearchUrl, googleMapsDirectionsUrl, googleMapsUrl } from "@/lib/clinic";


type Branch = (typeof CLINIC.branches)[number];

type WindowWithInitMap = Window & {
  initAvicennaMap?: () => void;
};

const loadGoogleMapsScript = (() => {
  let promise: Promise<typeof google.maps> | null = null;

  return function load(): Promise<typeof google.maps> {
    if (promise) return promise;

    const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
    const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];

    if (!key) {
      throw new Error("Google Maps browser key is not configured");
    }

    promise = new Promise<typeof google.maps>((resolve, reject) => {
      const existing = document.querySelector(`script[data-avicenna-maps="true"]`);
      if (existing) {
        if (typeof google !== "undefined" && google.maps?.Map) {
          resolve(google.maps);
        } else {
          const interval = setInterval(() => {
            if (typeof google !== "undefined" && google.maps?.Map) {
              clearInterval(interval);
              resolve(google.maps);
            }
          }, 100);
        }
        return;
      }

      const script = document.createElement("script");
      const callbackName = "initAvicennaMap";

      (window as WindowWithInitMap)[callbackName] = () => {
        if (typeof google !== "undefined" && google.maps) {
          resolve(google.maps);
        } else {
          reject(new Error("Google Maps API failed to initialize"));
        }
      };

      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${callbackName}&channel=${channel}`;
      script.async = true;
      script.defer = true;
      script.dataset["avicennaMaps"] = "true";
      script.onerror = () => reject(new Error("Failed to load Google Maps script"));

      document.head.appendChild(script);
    });

    return promise;
  };
})();

export function BranchesMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled && status === "loading") {
        setStatus("error");
        setErrorMessage("Карта не загрузилась за отведённое время. Используйте список адресов слева.");
      }
    }, 8000);

    const handleAuthFailure = () => {
      clearTimeout(timeoutId);
      setStatus("error");
      setErrorMessage(
        "Карта не загрузилась из-за ограничения ключа Google Maps. В списке слева есть ссылки для построения маршрута.",
      );
    };

    (window as typeof window & { gm_authFailure?: () => void }).gm_authFailure = handleAuthFailure;

    loadGoogleMapsScript()
      .then((maps) => {
        if (cancelled || !mapRef.current) return;

        const center = { lat: 42.858, lng: 74.607 };
        const mapInstance = new maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        const info = new maps.InfoWindow();
        const newMarkers: google.maps.Marker[] = [];

        CLINIC.branches.forEach((branch, index) => {
          const marker = new maps.Marker({
            position: { lat: branch.latitude, lng: branch.longitude },
            map: mapInstance,
            title: branch.name,
            label: {
              text: String(index + 1),
              color: "#FFFFFF",
              fontWeight: "700",
            },
          });

          marker.addListener("click", () => {
            info.setContent(buildInfoWindowContent(branch));
            info.open(mapInstance, marker);
            setActiveBranch(branch);
            mapInstance.panTo({ lat: branch.latitude, lng: branch.longitude });
            mapInstance.setZoom(15);
          });

          newMarkers.push(marker);
        });

        clearTimeout(timeoutId);
        setMap(mapInstance);
        setMarkers(newMarkers);
        setInfoWindow(info);
        setStatus("ready");
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error("Google Maps error:", err);
        setStatus("error");
        setErrorMessage("Карта временно недоступна. Используйте список адресов слева.");
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      markers.forEach((m) => m.setMap(null));
      infoWindow?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleBranchClick = (branch: Branch) => {
    if (!map || !infoWindow) return;
    const marker = markers.find((m) => m.getTitle() === branch.name);
    if (!marker) return;

    infoWindow.setContent(buildInfoWindowContent(branch));
    infoWindow.open(map, marker);
    setActiveBranch(branch);
    map.panTo({ lat: branch.latitude, lng: branch.longitude });
    map.setZoom(15);
  };

  const phone = CLINIC.phones[0] ?? "";

  return (
    <section id="filialy" className="border-border border-t py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <span className="eyebrow">Наши филиалы</span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            6 филиалов в Бишкеке
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-base sm:text-lg">
            Выберите ближайший адрес и постройте маршрут в Google Maps или 2ГИС.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <div className="order-2 space-y-3 lg:order-1">
            {CLINIC.branches.map((branch) => (
              <button
                key={branch.name}
                type="button"
                onClick={() => handleBranchClick(branch)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  activeBranch?.name === branch.name
                    ? "border-brand-green bg-surface-green shadow-sm"
                    : "border-border bg-card hover:border-brand-green/40 hover:bg-surface-green/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="bg-brand-green text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    📍
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-bold leading-tight">{branch.name}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{branch.city}, Кыргызстан</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={googleMapsUrl(branch.latitude, branch.longitude, branch.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border transition-colors hover:bg-surface-green"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Google Maps
                      </a>
                      <a
                        href={doubleGisSearchUrl(branch.street)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border transition-colors hover:bg-surface-green"
                        onClick={(e) => e.stopPropagation()}
                      >
                        2ГИС
                      </a>
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border transition-colors hover:bg-surface-green"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Позвонить
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="order-1 overflow-hidden rounded-2xl border shadow-sm lg:order-2">
            {error ? (
              <div className="flex h-[320px] items-center justify-center bg-surface-soft px-6 text-center lg:h-full lg:min-h-[420px]">
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
            ) : (
              <div ref={mapRef} className="h-[320px] w-full lg:h-full lg:min-h-[420px]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildInfoWindowContent(branch: Branch): string {
  const gmaps = googleMapsUrl(branch.latitude, branch.longitude, branch.name);
  const gmapsDir = googleMapsDirectionsUrl(branch.latitude, branch.longitude);
  const dGis = doubleGisSearchUrl(branch.street);

  return `
    <div style="font-family: system-ui, sans-serif; min-width: 220px; max-width: 280px;">
      <p style="font-weight: 700; font-size: 15px; margin: 0 0 6px; color: #111;">${branch.name}</p>
      <p style="font-size: 13px; margin: 0 0 12px; color: #555;">${branch.city}, Кыргызстан</p>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        <a href="${gmaps}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 10px; background: #0F9247; color: #fff; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600;">Google Maps</a>
        <a href="${gmapsDir}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 10px; background: #f3f4f6; color: #111; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; border: 1px solid #e5e7eb;">Маршрут</a>
        <a href="${dGis}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 10px; background: #f3f4f6; color: #111; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; border: 1px solid #e5e7eb;">2ГИС</a>
      </div>
    </div>
  `;
}
