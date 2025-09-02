import { createTheme, responsiveFontSizes } from "@mui/material";
import merge from "lodash.merge";
import { shadows } from "./shadows";
import { THEMES } from "@/utils/constants";
import themesOptions from "./themeOptions";
import componentsOverride from "./components";
// FONT VARIANTS
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
const baseOptions = {
    direction: "ltr",
    typography: { fontFamily: "'Inter', sans-serif" },
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
};
export const createCustomTheme = (settings) => {
    /**
     * settings.theme value is 'light' or 'dark'
     * update settings in contexts/settingsContext.tsx
     */
    let themeOptions = themesOptions[settings.theme];
    if (!themeOptions) {
        themeOptions = themesOptions[THEMES.LIGHT];
    }
    const mergedThemeOptions = merge({}, baseOptions, themeOptions, {
        direction: settings.direction,
    });
    let theme = createTheme(mergedThemeOptions);
    // OVERRIDE SHADOWS
    theme.shadows = shadows(theme);
    // OVERRIDE COMPONENTS
    theme.components = componentsOverride(theme);
    if (settings.responsiveFontSizes) {
        theme = responsiveFontSizes(theme);
    }
    return theme;
};
