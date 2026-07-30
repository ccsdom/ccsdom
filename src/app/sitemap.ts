import type { MetadataRoute } from "next";

import { allArticles } from "@/lib/articles";

const baseUrl = "https://ccsdom.fr";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/domiciliation-orly", priority: 0.9, changeFrequency: "monthly" },
  { path: "/domiciliation-paris-12", priority: 0.9, changeFrequency: "monthly" },
  { path: "/creation-entreprise", priority: 0.8, changeFrequency: "monthly" },
  { path: "/transfert-entreprise", priority: 0.8, changeFrequency: "monthly" },
  { path: "/features", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/conditions-generales", priority: 0.2, changeFrequency: "yearly" },
  { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  { path: "/politique-de-confidentialite", priority: 0.2, changeFrequency: "yearly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articles = allArticles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [...pages, ...articles];
}
