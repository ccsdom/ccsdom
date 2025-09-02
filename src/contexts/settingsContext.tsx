import { createContext, PropsWithChildren } from "react";
import { ThemeSettings } from "@/theme";
import { THEMES } from "@/utils/constants";
import useLocalStorage from "@/hooks/useLocalStorage";

const initialSettings: ThemeSettings = {
  direction: "ltr",
  theme: THEMES.LIGHT,
  // activeLayout: "layout1",
  responsiveFontSizes: true,
};

export const SettingsContext = createContext({
  settings: initialSettings,
  saveSettings: (arg: ThemeSettings) => {},
});

const SettingsProvider = ({ children }: PropsWithChildren) => {
  const storage = useLocalStorage<ThemeSettings>("settings", initialSettings);
  const { data: settings, storeData: setStoreSettings } = storage;

  const saveSettings = (updateSettings: ThemeSettings) =>
    setStoreSettings(updateSettings);

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
