import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // charge VITE_* depuis .env/.env.local

  // ⚙️ Choisis ta cible ici :
  // - En PROD (Cloud Run 2nd gen): ex. https://apientreprise-xxxx-uc.a.run.app
  // - En DEV (émulateur functions): http://127.0.0.1:5001/<PROJECT_ID>/europe-west1
  const TARGET = env.VITE_BACKEND_TARGET || "http://127.0.0.1:5001/<PROJECT_ID>/europe-west1";
  const isCloudRun = /a\.run\.app/.test(TARGET); // Cloud Run -> fonction exposée à "/"

  return {
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        // === API INSEE via fonction apiEntreprise ===
        "/apiEntreprise": {
          target: TARGET,
          changeOrigin: true,
          secure: true,
          // Cloud Run : réécrit /apiEntreprise -> /
          // Emulateur/Cloud Functions : NE PAS RÉÉCRIRE (il attend /apiEntreprise après /<region>)
          rewrite: isCloudRun
            ? (p) => p.replace(/^\/apiEntreprise(\/)?/, "/")
            : undefined,
        },

        // (optionnel) Stripe & co si tu veux les appeler en dev sans CORS :
        "/createCheckoutSession": {
          target: TARGET, // mets l’URL/région où tourne ta fonction Stripe
          changeOrigin: true,
          secure: true,
          // si c'est Cloud Run sur la racine de la fonction, réécris pareil :
          rewrite: isCloudRun
            ? (p) => p.replace(/^\/createCheckoutSession(\/)?/, "/")
            : undefined,
        },
        "/verifyPayment": {
          target: TARGET,
          changeOrigin: true,
          secure: true,
          rewrite: isCloudRun
            ? (p) => p.replace(/^\/verifyPayment(\/)?/, "/")
            : undefined,
        },
      },
    },
    css: {
      postcss: "./postcss.config.js",
    },
  };
});
