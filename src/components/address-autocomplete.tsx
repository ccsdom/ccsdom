"use client";

import React, { useEffect, useRef, useState } from "react";
import { getGoogleMaps } from "@/lib/google-maps";

type AddressAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  country?: string;
};

export function AddressAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Saisir une adresse...",
  className = "",
  inputClassName = "",
  disabled = false,
  country = "fr",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onChange, onPlaceSelected]);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      listenerRef.current?.remove();
      listenerRef.current = null;
      autocompleteRef.current = null;
    };

    const init = async () => {
      cleanup();
      setReady(false);

      try {
        const google = await getGoogleMaps();
        await google.maps.importLibrary("places");

        if (cancelled || !inputRef.current) return;

        if (!google.maps.places?.Autocomplete) {
          throw new Error("Google Places Autocomplete indisponible.");
        }

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country },
          fields: ["formatted_address", "geometry", "address_components", "name"],
          types: ["address"],
        });

        autocompleteRef.current = autocomplete;
        listenerRef.current = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace() ?? null;
          const formatted = place?.formatted_address || place?.name || inputRef.current?.value || "";

          onChangeRef.current(formatted);
          onPlaceSelectedRef.current?.(place);
        });

        setReady(true);
      } catch (error) {
        console.error("[AddressAutocomplete] init error:", error);
        if (!cancelled) setReady(true);
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [country]);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${inputClassName}`}
        autoComplete="off"
      />

      {!ready && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          Chargement...
        </div>
      )}
    </div>
  );
}
