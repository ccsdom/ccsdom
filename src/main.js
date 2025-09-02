import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import SettingsProvider from "@/contexts/settingsContext";
import App from "./App";
import './index.css';
// imports CSS tiers...
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(_jsx(React.StrictMode, { children: _jsx(SettingsProvider, { children: _jsx(App, {}) }) }));
