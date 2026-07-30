

export function Footer() {
    return (
        <footer className="px-4 sm:px-6 py-4 border-t bg-background/95 text-center">
            <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} CCS DOM. Tous droits réservés.
            </p>
        </footer>
    )
}
