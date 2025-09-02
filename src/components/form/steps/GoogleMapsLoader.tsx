import React, { useEffect, useState } from "react";

type GoogleMapsLoaderProps = {
  children: React.ReactNode;
};

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleReady = () =>
      typeof window !== "undefined" &&
      typeof window.google !== "undefined" &&
      typeof window.google.maps !== "undefined" &&
      typeof window.google.maps.places !== "undefined";

    const tryInitialize = () => {
      if (checkGoogleReady()) {
        setLoaded(true);
        return true;
      }
      return false;
    };

    // Si déjà chargé
    if (tryInitialize()) return;

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", tryInitialize);
      return;
    }

    // Sinon, injecte le script
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // vérifie après un léger délai (sécurité)
      setTimeout(() => {
        if (tryInitialize()) return;
        console.warn("Google Maps API loaded but not ready yet.");
      }, 300);
    };

    script.onerror = () => {
      console.error("Erreur lors du chargement de l'API Google Maps.");
    };

    document.body.appendChild(script);
  }, []);

  if (!loaded) return <div>Chargement de Google Maps…</div>;

  return <>{children}</>;
};

export default GoogleMapsLoader;
