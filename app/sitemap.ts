import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/commencer", "/mentions-legales", "/cgv", "/confidentialite"].map(
    (chemin) => ({ url: `${site.url}${chemin}` })
  );
}
