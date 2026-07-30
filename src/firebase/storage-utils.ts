
/**
 * Extrait le chemin relatif d’un objet Storage à partir d’une URL ou d’un chemin.
 * Utile pour forcer l'utilisation du bucket configuré même si la base de données
 * contient des URLs pointant vers un ancien bucket.
 */
export function getStorageRelativePath(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  
  if (pathOrUrl.startsWith("http")) {
    try {
      // Les URLs Firebase Storage sont au format: .../b/BUCKET_NAME/o/RELATIVE_PATH?alt=media...
      const parts = pathOrUrl.split("/o/");
      if (parts.length > 1) {
        const pathWithQuery = parts[1];
        const path = pathWithQuery.split("?")[0];
        return decodeURIComponent(path);
      }
    } catch (e) {
      console.warn("[getStorageRelativePath] Erreur lors du parsing de l'URL:", pathOrUrl, e);
    }
  }
  
  return pathOrUrl;
}
