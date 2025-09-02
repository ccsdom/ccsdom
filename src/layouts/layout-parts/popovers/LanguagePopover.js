import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useRef, useState } from "react";
import { IconButton, MenuItem, Popover, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
// ==============================================================
// LANGUAGE OPTIONS
const languageOptions = {
    en: { icon: "/static/flags/usa-round.png", label: "English" },
    es: { icon: "/static/flags/spain-round.png", label: "Spanish" },
    fr: { icon: "/static/flags/france-round.png", label: "Français" },
};
// STYLED COMPONENTS
const IconWrapper = styled("div")({
    width: 24,
    height: 24,
    padding: "2px",
    display: "flex",
    "& img": { width: "100%", borderRadius: "50%", objectFit: "cover" },
});
const LanguagePopover = () => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const { i18n } = useTranslation();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleChangeLanguage = (language) => {
        i18n.changeLanguage(language);
        setOpen(false);
    };
    const selectedLanguage = languageOptions[i18n.language];
    return (_jsxs(Fragment, { children: [_jsx(IconButton, { onClick: handleOpen, ref: anchorRef, children: _jsx(IconWrapper, { children: _jsx("img", { alt: selectedLanguage.label, src: selectedLanguage.icon }) }) }), _jsx(Popover, { keepMounted: true, open: open, onClose: handleClose, anchorEl: anchorRef.current, anchorOrigin: { horizontal: "center", vertical: "bottom" }, PaperProps: { sx: { width: 110, py: 1 } }, children: Object.keys(languageOptions).map((language) => (_jsx(MenuItem, { onClick: () => handleChangeLanguage(language), children: languageOptions[language].label }, languageOptions[language].label))) })] }));
};
export default LanguagePopover;
