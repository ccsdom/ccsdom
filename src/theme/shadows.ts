// src/theme/shadows.ts
import { Theme, alpha, Shadows } from "@mui/material";

export const shadows = (theme: Theme): Shadows => {
  const { mode, grey, primary } = theme.palette;

  // base color des ombres
  const base = mode === "light" ? grey[700] : "#000";
  // petite teinte primaire “Mira”
  const tint = alpha(primary.main, mode === "light" ? 0.14 : 0.12);

  // couches d’opacité
  const s1 = alpha(base, mode === "light" ? 0.06 : 0.38);
  const s2 = alpha(base, mode === "light" ? 0.08 : 0.48);
  const s3 = alpha(base, mode === "light" ? 0.12 : 0.56);

  // outline discret (surtout utile en dark)
  const outline = `0 0 0 1px ${alpha(grey[500], mode === "light" ? 0.08 : 0.22)}`;

  // génère une ombre composite douce + une pointe de teinte primaire
  const mix = (a: string, b: string, c: string) =>
    `${outline}, 0 1px 1px ${a}, 0 4px 8px ${b}, 0 8px 24px ${c}, 0 0 0 1px ${tint} inset`;

  const arr: string[] = [
    "none",                                       // 0
    mix(s1, s1, s2),                              // 1
    mix(s1, s2, s2),                              // 2
    mix(s1, s2, s3),                              // 3
    mix(s1, s2, s3),                              // 4
    mix(s1, s2, s3),                              // 5
    mix(s1, s2, s3),                              // 6
    mix(s1, s2, s3),                              // 7
    mix(s1, s2, s3),                              // 8
    mix(s1, s2, s3),                              // 9
    mix(s1, s2, s3),                              // 10
    mix(s1, s2, s3),                              // 11
    mix(s1, s2, s3),                              // 12
    mix(s1, s2, s3),                              // 13
    mix(s1, s2, s3),                              // 14
    mix(s1, s2, s3),                              // 15
    mix(s1, s2, s3),                              // 16
    mix(s1, s2, s3),                              // 17
    mix(s1, s2, s3),                              // 18
    mix(s1, s2, s3),                              // 19
    mix(s1, s2, s3),                              // 20
    mix(s1, s2, s3),                              // 21
    mix(s1, s2, s3),                              // 22
    mix(s1, s2, s3),                              // 23
    mix(s1, s2, s3),                              // 24
  ];

  // garde-fou : assure 25 entrées exactement
  const out = (arr.length >= 25 ? arr.slice(0, 25) : [...arr, ...Array(25 - arr.length).fill(arr[arr.length - 1])]) as Shadows;
  return out;
};
