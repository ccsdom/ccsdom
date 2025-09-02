export interface Navigations {
  type?: "label" | "extLink";
  label?: string;              // utilisé si type === 'label'
  name?: string;               // nom affiché
  path?: string;               // chemin url
  icon?: React.ElementType;    // composant icône (ex: duotone.Home)
  iconText?: string;           // texte alternatif pour icône (optionnel)
  disabled?: boolean;          // désactive l’item
  children?: Navigations[];    // sous-items pour menu multi-niveaux
}
