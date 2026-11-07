# Cozy Loops illustration checklist

The bundled `illustration-pending.png` is deliberately a neutral placeholder. It is not a crochet diagram. Each guide displays an illustration-pending notice and textual steps offline.

Replace the placeholder with reviewed, locally bundled artwork before presenting this as a fully illustrated educational resource. Create a static require-map in `src/features/glossary/data/stitches.ts` for individual step assets; React Native cannot bundle dynamically constructed image paths.

For each of the 12 guides, supply:
- A numbered image for each step (matching the text).
- A final appearance image where useful.
- Descriptive accessibility text and artist/license attribution.
- Clear working yarn/tail distinction, hook direction, entry point, and visible loops.
- A review by an experienced crocheter; verify right/left-hand labeling if depicted.

Required guides: Slip Knot, Chain, Slip Stitch, Single Crochet, Half Double Crochet, Double Crochet, Treble Crochet, Increase, Decrease, Magic Ring, Front Loop Only, Back Loop Only.

Content references (not fetched by the app):
- Craft Yarn Council terminology: https://www.craftyarncouncil.com/standards/crochet-abbreviations
- Utah State University 4-H Crocheting Handbook: https://extension.usu.edu/utah4h/files/crocheting-handbook.pdf
- Lion Brand adjustable ring: https://www.lionbrand.com/community/blog/great-beginnings-starting-your-crochet-project-right-pt-3/

US and UK stitch-height names are mapped explicitly. Slip knots and magic rings are techniques with no corresponding stitch-height conversion. Increase and decrease examples must not imply that every pattern uses the same method.
