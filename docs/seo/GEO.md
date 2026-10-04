# Aurevia GEO policy

Generative Engine Optimization here means making first-party facts easier for answer systems to retrieve, understand, extract, and attribute. It does **not** guarantee ranking, inclusion, recommendation, mention, or citation.

## Entity identity

Aurevia is a curated fragrance discovery and commerce experience built around real product data. The public catalog contains 26 real fragrance records with official or licensed imagery; offer prices are labeled US snapshots and missing prices are not estimated. The creator credit shown in the site footer is `ENG. Abdulhamid ALkatib`.

## Extractability

Public pages use a semantic H1, concise answer block, factual catalog fields, visible limitations, and product-level source links. Structured data is emitted only for facts present in the visible product record. Ratings, reviews, awards, certifications, partnerships, and social profiles are not invented.

## Crawler policy

`robots.txt` permits crawling of public catalog and editorial routes and disallows `/api/`, auth callbacks, private account paths, and internal tooling. AI crawler behavior changes over time; this policy is deliberately maintained as ordinary robots guidance, not a promise of training, retrieval, or citation.

## llms.txt

`/llms.txt` is generated from the same product slug registry as the sitemap. It is a curated navigation aid and does not replace real HTML content, `robots.txt`, sitemap, or structured data.

## Multilingual GEO

English and Arabic have distinct URLs, metadata, language attributes, and answer copy. Arabic uses RTL. Product facts retain their verified names and source URLs.

## Off-site corroboration

Only official or legitimately associated profiles may be added to `sameAs` or an external authority list. Until a URL is verified, it is omitted. Do not create placeholder social profiles, fake reviews, or manufactured community mentions.

## Citation ledger and testing

Run the exact prompt, record engine/mode/date/locale, whether Aurevia appeared, whether it was linked, cited URL and passage, competitors, and evidence. Repeat observations over time; a single answer is not statistically meaningful and correlation after a content edit is not proof of causation.
