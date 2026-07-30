import { Loader } from "@googlemaps/js-api-loader";

let googlePromise: Promise<typeof window.google> | null = null;

async function ensureMapsCore(googleObj: typeof window.google): Promise<typeof window.google> {
  const maps = googleObj.maps as any;

  if (typeof maps.Map !== "function" && typeof maps.importLibrary === "function") {
    await maps.importLibrary("maps");
  }

  if (typeof maps.Map !== "function") {
    throw new Error("Google Maps n'a pas charge la librairie maps correctement.");
  }

  return googleObj;
}

export function getGoogleMaps(): Promise<typeof window.google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps uniquement cote client."));
  }

  // window.google.maps can exist before the core maps library is fully ready.
  if (window.google?.maps) {
    return ensureMapsCore(window.google);
  }

  if (!googlePromise) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      googlePromise = Promise.reject(
        new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY manquante.")
      );
      return googlePromise;
    }

    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geocoding", "marker"],
      ...(mapId ? { mapIds: [mapId] } : {}),
    });

    googlePromise = loader.load().then((g) => {
      if (!g?.maps) throw new Error("Google Maps n'a pas charge correctement.");
      return ensureMapsCore(g);
    });
  }

  return googlePromise;
}
