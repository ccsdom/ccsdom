"use client";

import { useEffect } from "react";

export function ServiceWorkerReset() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      })
      .catch((error) => {
        console.warn("[ServiceWorkerReset] Cleanup failed", error);
      });
  }, []);

  return null;
}
