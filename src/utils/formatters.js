export function formatDate(dateStr) {
    if (!dateStr)
        return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}
export function formatSiren(siren) {
    return siren.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
}
