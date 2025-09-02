import React from "react";
import ReactDOM from "react-dom/client";
import SettingsProvider from "@/contexts/settingsContext";
import App from "./App";
import './index.css';

// imports CSS tiers...

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);
