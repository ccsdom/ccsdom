import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resource";
i18next.use(initReactI18next).init({
    resources,
    lng: "fr", // Langue par défaut
    fallbackLng: "en", // Langue de secours
    interpolation: {
        escapeValue: false, // React already protects from XSS
    },
});
