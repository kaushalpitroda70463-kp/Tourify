# Tourify Image Download Checklist

Audit-only checklist based on the current HTML templates, local image paths and static JavaScript mappings. No code, assets or localStorage were changed.

## Runtime data limitation

The live records are stored in `tourify_destinations` and `tourify_tours` in browser localStorage. This audit environment cannot inspect browser storage, so stable runtime IDs and any records added by Admin are unavailable. The names below are the actual legacy template entities found in `destinations.html` and `tours.html`; `destination-*.webp` and `tour-*.webp` are legacy asset references, not record IDs. Before mapping downloaded files, match each filename to the runtime record's actual `id`.

## Destinations — two images each

All rows require a cover and a secondary/gallery image. Uses: destination cover = Home featured destination, Destinations listing, Destination Details and Admin preview when that record is selected; secondary = Destination Details/Gallery.

| Destination | Runtime ID | Required files | Subject |
|---|---|---|---|
| Maldives | unavailable in source (legacy asset `destination-2.webp`) | `maldives-cover.jpg`, `maldives-gallery-01.jpg` | Turquoise lagoon/beach; distinct resort or reef view |
| Rome, Italy | unavailable in source (`destination-4.webp`) | `rome-cover.jpg`, `rome-gallery-01.jpg` | Colosseum/ancient Rome; street or Vatican heritage view |
| Swiss Alps | unavailable in source (`destination-6.webp`) | `swiss-alps-cover.jpg`, `swiss-alps-gallery-01.jpg` | Alpine panorama; trek/village or lake view |
| Costa Rica | unavailable in source (`destination-8.webp`) | `costa-rica-cover.jpg`, `costa-rica-gallery-01.jpg` | Rainforest/wildlife; volcano or waterfall |
| Dubai, UAE | unavailable in source (`destination-10.webp`) | `dubai-cover.jpg`, `dubai-gallery-01.jpg` | Dubai skyline; desert or landmark view |
| Amalfi Coast, Italy | unavailable in source (`destination-12.webp`) | `amalfi-coast-cover.jpg`, `amalfi-coast-gallery-01.jpg` | Coastal villages/cliffs; sea-facing road or town |
| Thailand | unavailable in source (`destination-14.webp`) | `thailand-cover.jpg`, `thailand-gallery-01.jpg` | Temple or Bangkok scene; beach/island view |
| Nepal Himalayas | unavailable in source (`destination-16.webp`) | `nepal-himalayas-cover.jpg`, `nepal-himalayas-gallery-01.jpg` | Himalayan peaks; trekking trail or village |
| Egypt | unavailable in source (`destination-18.webp`) | `egypt-cover.jpg`, `egypt-gallery-01.jpg` | Pyramids; Nile/temple detail |
| Singapore | unavailable in source (`destination-20.webp`) | `singapore-cover.jpg`, `singapore-gallery-01.jpg` | Skyline; Gardens by the Bay or Marina Bay |

Destination files are used by Home, `destinations.html`, `destination-details.html`, related tours and Admin previews after runtime IDs are matched. The static details template also contains Santorini content and should not be treated as a confirmed runtime destination record.

## Tours/packages

The 14 names below are actual static tour cards. Each tour uses its destination cover/secondary images where a matching audited destination exists. Separate package files are recommended only where no matching destination image set is present or the package needs a distinct experience image. Tour pages: Home featured tours, `tours.html`, `tour-details.html`, booking summary and Admin preview.

| Tour/package | Runtime ID | Image decision | Required files/subject |
|---|---|---|---|
| Bali Adventure Escape | unavailable in source | Separate set; Bali is not in the destination listing | `bali-adventure-cover.jpg`, `bali-adventure-gallery-01.jpg` — temple/volcano and beach or rice terrace |
| Romantic Paris Getaway | unavailable in source | Separate set; Paris is not in the destination listing | `paris-getaway-cover.jpg`, `paris-getaway-gallery-01.jpg` — Eiffel/Seine and Paris street or landmark |
| Tokyo Cultural Experience | unavailable in source | Separate set; Tokyo is not in the destination listing | `tokyo-cultural-cover.jpg`, `tokyo-cultural-gallery-01.jpg` — skyline/night scene and temple or traditional street |
| Norwegian Fjords Cruise | unavailable in source | Separate set; Norway is not in the destination listing | `norwegian-fjords-cover.jpg`, `norwegian-fjords-gallery-01.jpg` — fjord/cruise and village or waterfall |
| Ancient Egypt Explorer | unavailable in source | Reuse Egypt destination set | No additional package files; use `egypt-cover.jpg` and `egypt-gallery-01.jpg` |
| Costa Rica Eco Adventure | unavailable in source | Reuse Costa Rica destination set | No additional package files; use `costa-rica-cover.jpg` and `costa-rica-gallery-01.jpg` |
| Greek Islands Hopping | unavailable in source | Reuse the Santorini/details-template set if the runtime destination matches; otherwise add a Greece set after storage audit | No additional files in this checklist |
| Patagonia Wilderness Trek | unavailable in source | Separate set; no matching destination listing | `patagonia-trek-cover.jpg`, `patagonia-trek-gallery-01.jpg` — glacial peaks and trekking landscape |
| Swiss Alps Adventure | unavailable in source | Reuse Swiss Alps destination set | No additional package files; use `swiss-alps-cover.jpg` and `swiss-alps-gallery-01.jpg` |
| Iceland Northern Lights | unavailable in source | Separate set; no matching destination listing | `iceland-northern-lights-cover.jpg`, `iceland-northern-lights-gallery-01.jpg` — aurora and volcanic/ice landscape |
| Magical Morocco Tour | unavailable in source | Separate set; no matching destination listing | `morocco-tour-cover.jpg`, `morocco-tour-gallery-01.jpg` — medina/desert and market or kasbah |
| Peru Machu Picchu Trek | unavailable in source | Separate set; no matching destination listing | `peru-machu-picchu-cover.jpg`, `peru-machu-picchu-gallery-01.jpg` — Machu Picchu and mountain trail |
| Vietnam Discovery | unavailable in source | Separate set; no matching destination listing | `vietnam-discovery-cover.jpg`, `vietnam-discovery-gallery-01.jpg` — Ha Long Bay or rice terraces and cultural street |
| Australia Highlights | unavailable in source | Separate set; no matching destination listing | `australia-highlights-cover.jpg`, `australia-highlights-gallery-01.jpg` — Sydney landmark/coast and reef or national park |

The static `tour-details.html` also contains Venice/Santorini placeholder/template content. It is not evidence of an additional runtime package and requires ID-based mapping before any replacement.

## Home hero, Gallery and shared photography

- Home hero: `home-hero-travel.jpg` — wide 16:9 premium travel landscape showing a recognisable journey, not a generic stock collage. Used only by the Home hero; download at least 1920x1080.
- Gallery page: `gallery-bali-temple.jpg`, `gallery-paris-seine.jpg`, `gallery-tokyo-night.jpg`, `gallery-swiss-alps.jpg`, `gallery-egypt-pyramids.jpg`, `gallery-costa-rica-rainforest.jpg`, `gallery-santorini-sunset.jpg`, `gallery-australia-coast.jpg`. These correspond to the existing eight Gallery slots and should be used by `gallery.html`; they may also be reused in details pages. Download at least 1600px wide.
- Home featured destinations and tours should reuse the destination/tour cover files above; no extra per-card duplicates are required.

## Quantity and filenames

Recommended dedicated download set: **49 files**.

- Destinations: 20 files (10 covers + 10 secondary images).
- Tour-specific: 20 files (10 packages x 2; Egypt, Costa Rica, Greek/Santorini and Swiss Alps reuse destination imagery).
- Home hero: 1 file.
- Gallery: 8 files.

Exact filenames are the 20 destination names, 20 tour-specific names, `home-hero-travel.jpg`, and the 8 `gallery-*.jpg` names listed above. If the eight Gallery cards reuse existing secondary images instead, the minimum falls to **41 files**; the 49-file set avoids repetitive Gallery presentation.

## Existing suitable versus missing

All 49 proposed filenames are currently missing. The project does contain 84 local images, including existing `travel/destination-*.webp`, `travel/tour-*.webp`, `gallery/gallery-1.webp` through `gallery-8.webp`, `showcase-*.webp` and `misc-*.webp`. Their paths and dimensions are valid, but they are not counted as approved replacements because their visual suitability was not established for this request. They may remain as fallbacks until the new files are visually reviewed.

## Incoming and final folders

Place the manually downloaded files flat in `IMAGE_INCOMING/` at the project root using the exact filenames above. The later mapping step should move/copy destination files to `CLIENT SIDE/assets/img/destinations/`, tour-specific files to `CLIENT SIDE/assets/img/tours/`, the hero to `CLIENT SIDE/assets/img/hero/` or the existing travel folder, and Gallery files to `CLIENT SIDE/assets/img/gallery/`. Do not map them until runtime IDs are inspected.

For every download, keep the source URL and applicable Unsplash/Pexels license note available for the later manifest update. This audit did not download or attempt any external request.
