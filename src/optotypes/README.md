# Restricción: cero derivación de GPL

Ningún código, SVG, ni asset se copia, adapta, ni se consulta desde `open-optometry` (GPLv2) ni de ninguna otra fuente no-MIT/no-permisiva mientras se escribe este código. Ver [ADR-001](../../docs/adr/ADR-001-Opsin-Independent-Module.md).

- **Tumbling E, Landolt C**: geometría procedimental de dominio público (ISO 8596 para Landolt C, grid clásico 5×5 para Tumbling E) — sin dependencias externas.
- **Sloan / HOTV** (`sloanLetters.ts`, `hotv.ts`): usan la tipografía **Optician Sans** (SIL Open Font License 1.1, no MIT — ver `NOTICE.md` y `src/assets/fonts/OFL-LICENSE.md`) en vez de geometría dibujada a mano. El intento inicial de aproximar las letras con rectángulos/segmentos vectoriales no lograba calidad tipográfica aceptable (diagonales dentadas, proporciones inconsistentes) — un font licenciado específicamente para esto da mejor resultado que reinventar el trazo de cada letra.
- **Pediátrico, fijación**: pictogramas/formas originales propias, sin fuente ni asset externo.
