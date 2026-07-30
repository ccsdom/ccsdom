export default function NotFound() {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Page introuvable</h1>
          <p className="text-sm text-muted-foreground">
            L’URL demandée n’existe pas (ou plus).
          </p>
          <a
            href="/"
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Retour à l’accueil
          </a>
        </div>
      </div>
    );
  }
  