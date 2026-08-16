# Licensing

All original code in this repository is **MIT** (see `LICENSE`). A few
third-party assets keep their own licenses, noted below.

## Third-party font

The Sloan/HOTV optotype letters (C D H K N O R S V Z, T) are rendered using **Optician Sans**, a typeface based on the historical Sloan/Snellen optotypes, licensed under the **SIL Open Font License 1.1** (not MIT — see `src/assets/fonts/OFL-LICENSE.md`). Credits: ANTI Hamar / Fábio Duarte Martins — [github.com/anewtypeofinterference/Optician-Sans](https://github.com/anewtypeofinterference/Optician-Sans). OFL permits bundling/embedding the font in software (including commercial use) as long as the font itself isn't sold standalone under its reserved name — which is exactly how it's used here (embedded webfont, `src/assets/fonts/`).

Tumbling E and Landolt C remain hand-drawn procedural geometry (ISO 8596 / classic 5x5 grid) — no font dependency for those.

## Third-party images (pathology diagrams)

`src/pathologies/` uses illustrations from two third-party sources:

- **Servier Medical Art** (smart.servier.com), **CC BY 4.0** — attribution required, commercial use permitted. Images: normal eye anatomy, diabetic retinopathy, macular degeneration (dry AMD + wet AMD), glaucoma, cataract, conjunctivitis, myopia, hyperopia, astigmatism. Required attribution: **"Servier Medical Art, Les Laboratoires Servier — CC BY 4.0"** — [smart.servier.com/how-to-cite-servier-medical-art](https://smart.servier.com/how-to-cite-servier-medical-art/).
- **Wikimedia Commons**, `Keratoconus_pl.svg` by Madhero88 / M.Komorniczak, **CC BY-SA 3.0** — image: keratoconus. Modified (title labels translated from Polish to Spanish; the small anatomical sub-labels — iris/lens/aqueous humor/cornea — were vector-outlined paths, not editable text, so they were removed entirely along with their leader lines rather than left untranslated). Being a modified derivative, this file must stay CC BY-SA 3.0 (or compatible) if redistributed — it's tracked separately from the MIT-covered code for exactly this reason.

Both attributions render on-screen automatically (bottom-right corner) whenever that diagram is displayed — see `OptotypeEngine.renderPathology()` / `pathologies/index.ts`'s `ATTRIBUTION_BY_KEY`.

Remaining pathologies in the picker (blefaritis, orzuelo, DVP, fotopsias, miodesopsias, DRR, DRT, ROP, EMD, oclusión de vena, membrana epirretiniana, pterigión, agujero macular, ojo seco, uveítis, nervio óptico normal vs. patológico) show a "próximamente" placeholder — Servier's ophthalmology catalog (~20 core topics) doesn't cover them, and Wikimedia's results for these were either real patient photos (inconsistent style with the rest of the picker), foreign-language diagrams not worth adapting, or no results at all (uveítis, retinal detachment, macular edema, optic disc cupping).

## Side-by-side comparison layout

When a non-"normal" pathology is selected, `OptotypeEngine.renderPathology()` shows two panels: "Ojo normal" on the left (always `normal.png`) and the selected pathology on the right, both captioned in the same font (`PATHOLOGY_CAPTION_FONT`, currently a serif matching the style of the embedded reference diagrams). `queratocono` is the one exception — its source image already bakes in its own normal-vs-keratoconus comparison with its own captions, so it renders as a single centered panel instead of being wrapped in a second comparison layout.
