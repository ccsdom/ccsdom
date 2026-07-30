"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { getGoogleMaps } from "@/lib/google-maps";

type LatLng = { lat: number; lng: number };

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  status?: "active" | "inactive" | string;
}

interface MapProps {
  address?: string;
  center?: LatLng;
  markers?: MapMarker[];
  zoom?: number;
  className?: string;
}

export function Map({
  address,
  center,
  markers = [],
  zoom = 15,
  className = "",
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ attend que le div soit monté ET avec une taille réelle
  const waitForContainerReady = async (tries = 12) => {
    for (let i = 0; i < tries; i++) {
      const el = containerRef.current;
      if (
        el &&
        el.isConnected &&
        el instanceof Element &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0
      ) {
        return el;
      }
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;

    const clearMarkers = () => {
      markersRef.current.forEach((m) => {
        if (typeof m?.setMap === "function") {
          m.setMap(null);
          return;
        }

        if (m && "map" in m) {
          m.map = null;
        }
      });
      markersRef.current = [];
    };

    const loadMapsLibrary = async (googleObj: typeof window.google) => {
      const maps = googleObj.maps as any;
      const mapsLibrary =
        typeof maps.importLibrary === "function"
          ? await maps.importLibrary("maps")
          : maps;

      const MapCtor = maps.Map || mapsLibrary.Map;
      const LatLngBoundsCtor = maps.LatLngBounds || mapsLibrary.LatLngBounds;

      if (typeof MapCtor !== "function" || typeof LatLngBoundsCtor !== "function") {
        throw new Error("Google Maps n'a pas charge la carte correctement.");
      }

      return { MapCtor, LatLngBoundsCtor };
    };

    const loadMarkerLibrary = async (googleObj: typeof window.google) => {
      const maps = googleObj.maps as any;
      let markerLibrary: any = {};

      if (typeof maps.importLibrary === "function") {
        markerLibrary = await maps.importLibrary("marker");
      }

      return {
        MarkerCtor: maps.Marker || markerLibrary.Marker,
        AdvancedMarkerElement: markerLibrary.AdvancedMarkerElement,
        PinElement: markerLibrary.PinElement,
      };
    };

    const addMarker = (
      markerLibrary: {
        MarkerCtor?: any;
        AdvancedMarkerElement?: any;
        PinElement?: any;
      },
      loc: google.maps.LatLng | google.maps.LatLngLiteral,
      title?: string,
      status?: string
    ) => {
      let marker: any = null;

      if (typeof markerLibrary.MarkerCtor === "function") {
        marker = new markerLibrary.MarkerCtor({
          position: loc,
          map: mapRef.current,
          title: title || "",
          icon:
            status === "inactive"
              ? "http://maps.google.com/mapfiles/ms/icons/grey-dot.png"
              : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });
      } else if (typeof markerLibrary.AdvancedMarkerElement === "function") {
        const pin =
          typeof markerLibrary.PinElement === "function"
            ? new markerLibrary.PinElement({
                background: status === "inactive" ? "#94a3b8" : "#ef4444",
                borderColor: status === "inactive" ? "#64748b" : "#b91c1c",
                glyphColor: "#ffffff",
              })
            : null;

        marker = new markerLibrary.AdvancedMarkerElement({
          position: loc,
          map: mapRef.current,
          title: title || "",
          ...(pin ? { content: pin.element } : {}),
        });
      }

      if (!marker) return null;

      markersRef.current.push(marker);
      return marker;
    };

    const ensureMap = async (
      googleObj: typeof window.google,
      locations: { loc: google.maps.LatLng | google.maps.LatLngLiteral; title?: string; status?: string }[]
    ) => {
      if (cancelled) return;

      const el = await waitForContainerReady();
      if (!el || cancelled) return;

      const { MapCtor, LatLngBoundsCtor } = await loadMapsLibrary(googleObj);
      const markerLibrary = await loadMarkerLibrary(googleObj);
      if (cancelled) return;

      // Map Initialization
      if (!mapRef.current) {
        mapRef.current = new MapCtor(el, {
          center: center || locations[0]?.loc || { lat: 0, lng: 0 },
          zoom,
          disableDefaultUI: true,
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });
      }

      const map = mapRef.current;
      if (!map) return;

      clearMarkers();

      const bounds = new LatLngBoundsCtor();
      
      locations.forEach((item) => {
        addMarker(markerLibrary, item.loc, item.title, item.status);
        bounds.extend(item.loc);
      });

      if (center) {
        map.setCenter(center);
        map.setZoom(zoom);
      } else if (locations.length > 1) {
        map.fitBounds(bounds);
        const listener = map.addListener("bounds_changed", () => {
          if (map.getZoom()! > 16) map.setZoom(16);
          listener.remove();
        });
      } else if (locations.length === 1) {
        map.setCenter(locations[0].loc);
        map.setZoom(zoom);
      }

      if (!cancelled) setIsLoading(false);
    };

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const googleObj = await getGoogleMaps();
        if (cancelled) return;

        // Mode Markers
        if (markers.length > 0) {
          const locs = markers.map((m) => ({
            loc: { lat: m.lat, lng: m.lng },
            title: m.title,
            status: m.status,
          }));
          await ensureMap(googleObj, locs);
          return;
        }

        // Mode Center
        if (center) {
          await ensureMap(googleObj, [{ loc: center }]);
          return;
        }

        // Mode Address Geocoding
        const safeAddress = address?.trim();
        if (!safeAddress) {
          setError("Adresse ou coordonnées manquantes.");
          setIsLoading(false);
          return;
        }

        const maps = googleObj.maps as any;
        let GeocoderCtor = maps.Geocoder;

        if (typeof GeocoderCtor !== "function" && typeof maps.importLibrary === "function") {
          const geocodingLibrary = await maps.importLibrary("geocoding");
          GeocoderCtor = geocodingLibrary.Geocoder;
        }

        if (typeof GeocoderCtor !== "function") {
          throw new Error("Google Maps Geocoding n'a pas chargé correctement.");
        }

        const geocoder = new GeocoderCtor() as google.maps.Geocoder;
        geocoder.geocode({ address: safeAddress }, async (results, status) => {
          if (cancelled) return;

          if (status === "OK" && results?.[0]) {
            await ensureMap(googleObj, [
              { loc: results[0].geometry.location, title: safeAddress },
            ]);
          } else {
            setError(`Impossible de géolocaliser l'adresse. Statut: ${status}`);
            setIsLoading(false);
          }
        });
      } catch (e: any) {
        if (!cancelled) {
          console.error("[Map] error:", e);
          setError(e?.message || "Erreur de chargement de Google Maps.");
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      clearMarkers();
      mapRef.current = null;
    };
  }, [address, zoom, center?.lat, center?.lng, JSON.stringify(markers)]);

  if (error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-destructive/10 text-destructive flex items-center justify-center p-4 text-center text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isLoading ? "opacity-50" : "opacity-100"} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
