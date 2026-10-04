import fs from "node:fs";
import path from "node:path";
import { fragrances } from "../client/src/data/fragrances";
import { SITE_URL, buildLlmsTxt, buildSitemapXml } from "../shared/seo";

const publicDir = path.resolve(process.cwd(), "client/public");
fs.mkdirSync(publicDir, { recursive: true });
const slugs = fragrances.map(item => item.slug);
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), `${buildSitemapXml(slugs)}\n`);
fs.writeFileSync(path.join(publicDir, "llms.txt"), buildLlmsTxt(slugs));
fs.writeFileSync(path.join(publicDir, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /ar/account\nDisallow: /api/oauth/\nDisallow: /__manus__/\n\n# AI crawler policy follows the same public-crawl rules as general search crawlers.\n# Allowing access does not guarantee retrieval, training, ranking, mention, or citation.\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Generated SEO files for ${slugs.length} catalog products`);
