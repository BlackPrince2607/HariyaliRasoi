import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hariyalirasoi.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/cart", "/events", "/contact", "/track-order"];
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/menu" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/menu" ? 0.9 : 0.7,
  }));
}
