/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "js.stripe.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },



  // ✅ React-PDF fix (pdfjs-dist est géré en interne par les versions récentes)
  transpilePackages: ["react-pdf"],
  // ✅ Rewrites pour supporter l'alias "suivi-clients" (évite les 404)
  async rewrites() {
    return [
      {
        source: "/admin/suivi-clients",
        destination: "/admin/clients",
      },
      {
        source: "/admin/suivi-clients/:id",
        destination: "/admin/clients/:id",
      },
      {
        source: "/admin/suclients/:id", // Cas extrême suggéré par le typo utilisateur
        destination: "/admin/clients/:id",
      },
    ];
  },
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config) => {
    // ✅ évite des soucis bundler côté browser
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;