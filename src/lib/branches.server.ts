import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

type BranchInput = {
  name: string;
  address: string;
};

export type BranchGeo = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

async function geocodeOne(branch: BranchInput): Promise<BranchGeo> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const googleKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !googleKey) {
    throw new Error("Google Maps connector credentials are not configured");
  }

  const fullAddress = `${branch.address}, Бишкек, Кыргызстан`;
  const url = `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": googleKey,
    },
  });

  if (response.status === 403) {
    const details: Array<{ reason?: string }> = (await response.json())?.error?.details ?? [];
    const reason = details.find((d) => d.reason)?.reason;
    if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
      throw new Error(
        'Google Maps server key is referrer-restricted. In Google Cloud Console, set the server key\'s application restrictions to "None" or "IP addresses".',
      );
    }
    if (reason === "API_KEY_SERVICE_BLOCKED") {
      throw new Error(
        "Google Maps server key does not allow this API. In Google Cloud Console, add Geocoding API to the server key's allowed-APIs list.",
      );
    }
    throw new Error("Google Maps request was denied (403). Check the server key's restrictions in Google Cloud Console.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Maps geocoding failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    status?: string;
    results?: Array<{
      geometry: { location: { lat: number; lng: number } };
    }>;
    error_message?: string;
  };

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Geocoding error for ${branch.address}: ${data.status ?? "UNKNOWN"} ${data.error_message ?? ""}`);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { name: branch.name, address: branch.address, latitude: lat, longitude: lng };
}

export const BRANCHES: BranchInput[] = [
  { name: "ул. Бакаева, 106", address: "ул. Бакаева, 106" },
  { name: "ул. Джунусалиева, 83", address: "ул. Джунусалиева, 83" },
  { name: "ул. Жукеева-Пудовкина, 124", address: "ул. Жукеева-Пудовкина, 124" },
  { name: "ул. Московская, 136", address: "ул. Московская, 136" },
  { name: "ул. Юнусалиева, 173А, блок А", address: "ул. Юнусалиева, 173А, блок А" },
  { name: "пр. Жибек-Жолу, 213", address: "пр. Жибек-Жолу, 213" },
];

export async function geocodeBranches(): Promise<BranchGeo[]> {
  const results = await Promise.all(BRANCHES.map((b) => geocodeOne(b)));
  return results;
}

export const fetchBranchCoordinates = createServerFn({ method: "GET" }).handler(async () => {
  return geocodeBranches();
});
