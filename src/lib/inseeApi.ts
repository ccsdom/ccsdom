export async function fetchEntrepriseBySiren(siren: string) {
  try {
    const response = await fetch(`/api/insee/${siren}`); // Utilise le proxy Vite ici
    if (!response.ok) throw new Error("SIREN introuvable");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Erreur fetch INSEE :", error);
    throw error;
  }
}
