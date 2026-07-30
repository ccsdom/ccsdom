import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/conditions-generales",
          "/contact",
          "/creation-entreprise",
          "/domiciliation-orly",
          "/domiciliation-paris-12",
          "/features",
          "/mentions-legales",
          "/politique-de-confidentialite",
          "/transfert-entreprise",
        ],
        disallow: [
          "/admin",
          "/api",
          "/auth",
          "/dashboard",
          "/login",
          "/signup",
          "/test-route",
        ],
      },
    ],
    sitemap: "https://ccsdom.fr/sitemap.xml",
    host: "https://ccsdom.fr",
  };
}
