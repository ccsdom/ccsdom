// theme/index.ts
import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material/styles";
import merge from "lodash.merge";
import { shadows } from "./shadows";
import { THEMES } from "@/utils/constants";
import themesOptions from "./themeOptions";
import componentsOverride from "./components";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

const baseOptions: ThemeOptions = {
  direction: "ltr",
  typography: { fontFamily: "'Inter', sans-serif" },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
};

// --- PALETTE PRO (clair/sombre) ---
const buildBrandPalette = (mode: "light" | "dark"): ThemeOptions["palette"] => {
  const isLight = mode === "light";

  const primary = {
    main: "#8649e1",
    light: "#A377EE",
    dark: "#6C2CCA",
    contrastText: "#FFFFFF",
  };

  const secondary = {
    main: "#9083c5",
    light: "#B1A8D8",
    dark: "#6F64A3",
    contrastText: "#FFFFFF",
  };

  const success = { main: "#2EA56B", light: "#51BE88", dark: "#1E7A4C", contrastText: "#FFFFFF" };
  const warning = { main: "#F7B500", light: "#F9C63E", dark: "#C28F00", contrastText: "#1A1A1A" };
  const error   = { main: "#E53935", light: "#EF6A67", dark: "#AB000D", contrastText: "#FFFFFF" };
  const info    = { main: "#3BA0E6", light: "#6BBBF0", dark: "#177CC3", contrastText: "#FFFFFF" };

  const grey = {
    50:  "#F7F7FA",
    100: "#EEF0F5",
    200: "#E3E6ED",
    300: "#CCD1DB",
    400: "#AEB6C5",
    500: "#8F98AA",
    600: "#727C90",
    700: "#5A6374",
    800: "#3F4653",
    900: "#242832",
    A100: "#15181F",
  };

  return {
    mode,
    primary,
    secondary,
    success,
    warning,
    error,
    info,
    divider: isLight ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.12)",
    text: {
      primary:   isLight ? "#0F172A" : "#F8FAFC",
      secondary: isLight ? "rgba(15, 23, 42, 0.68)" : "rgba(248, 250, 252, 0.72)",
      disabled:  isLight ? "rgba(15, 23, 42, 0.38)" : "rgba(248, 250, 252, 0.38)",
    },
    background: {
      default: isLight ? "#F4F5F9" : "#0E1117",
      paper:   isLight ? "#FFFFFF" : "#121722",
    },
    action: {
      hoverOpacity:    isLight ? 0.06 : 0.08,
      selectedOpacity: isLight ? 0.10 : 0.12,
      disabledOpacity: 0.38,
      focusOpacity:    0.12,
      activatedOpacity:0.16,
    },
    grey,
  };
};

// 👉 Overrides “Mira” conservés (on laisse la palette au helper ci-dessus)
const miraOverrides: ThemeOptions = {
  shape: { borderRadius: 10 },
};

// 👉 Typographie pro (sobre & responsive)
const proTypography: NonNullable<ThemeOptions["typography"]> = {
  fontFamily: "'Inter', sans-serif",
  fontWeightRegular: 500,
  fontWeightMedium: 600,
  fontWeightBold: 700,

  h1: { fontWeight: 800, lineHeight: 1.15, fontSize: "clamp(28px, 4vw, 40px)" },
  h2: { fontWeight: 800, lineHeight: 1.18, fontSize: "clamp(24px, 3.2vw, 32px)" },
  h3: { fontWeight: 800, lineHeight: 1.2,  fontSize: "clamp(20px, 2.6vw, 28px)" },
  h4: { fontWeight: 700, lineHeight: 1.25, fontSize: "clamp(18px, 2.2vw, 24px)" },
  h5: { fontWeight: 700, lineHeight: 1.3,  fontSize: "clamp(16px, 1.9vw, 20px)" },
  h6: { fontWeight: 700, lineHeight: 1.35, fontSize: "clamp(14px, 1.7vw, 18px)" },

  subtitle1: { fontSize: "0.95rem", lineHeight: 1.5 },
  subtitle2: { fontSize: "0.85rem", lineHeight: 1.45 },
  body1:     { fontSize: "0.95rem" },
  body2:     { fontSize: "0.875rem" },
  button:    { textTransform: "none", fontWeight: 700 },
  overline:  { letterSpacing: ".06em" },
};

// 👉 Petits overrides globaux (marges titres, Stepper plus discret, icône plus petite)
const proComponents: NonNullable<ThemeOptions["components"]> = {
  MuiTypography: {
    styleOverrides: { gutterBottom: { marginBottom: "0.5rem" } },
  },
  MuiStepLabel: {
    styleOverrides: { label: { fontSize: "0.85rem", fontWeight: 600 } },
  },
  MuiStepIcon: {
    styleOverrides: { root: { fontSize: "20px" } },
  },
};

export type ThemeSettings = {
  theme: string; // "light" | "dark"
  direction: "ltr" | "rtl";
  responsiveFontSizes?: boolean;
};

export const createCustomTheme = (settings: ThemeSettings) => {
  const themeOpt = themesOptions[settings.theme] || themesOptions[THEMES.LIGHT];
  const mode = settings.theme === "dark" ? "dark" : "light";

  // Merge base + options + direction + Mira + palette pro + typo + composants
  const mergedThemeOptions: ThemeOptions = merge(
    {},
    baseOptions,
    themeOpt,
    { direction: settings.direction },
    miraOverrides,
    { palette: buildBrandPalette(mode) },
    { typography: proTypography },
    { components: proComponents }
  );

  // 1) Créer la base
  let theme = createTheme(mergedThemeOptions);

  // 2) Ombres + overrides dépendants du theme (déjà dans ton projet)
  theme.shadows = shadows(theme);
  theme.components = {
    ...theme.components,
    ...componentsOverride(theme),
  };

  // 3) Optionnel : typo responsive
  if (settings.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};
