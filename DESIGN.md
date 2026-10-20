# Editor interaction conventions

Preserve the approved template artwork. Editor controls use Outfit, navy #163b65 and teal #18a999.

Published defaults seed empty browsers only. Do not show a Load published project control. Existing projects remain local and retain the backup/import controls.

Both catalog and template photo editors share createBackgroundTools. Background removal overlays its preview with an accessible status, spinner and waiting guidance. Preserve the original on failure, allow retry and respect reduced motion.


## Product inspector update

Desktop: a compact white header with template selector and save status; left Products/Templates/Catalog tabs; a pale dotted preview workspace with zoom; right selected-product inspector and store settings. Navy #163b65, teal #18a999, neutral #f7f8fc, Outfit typography. Artwork colors and layout remain owned by each template.

`renderIndependentSlotEditor` remains the shared form owner. Its single DOM form docks in the desktop inspector and returns to the dialog on mobile. Native fields, existing validation, save queue and error notices are reused. The new poster list shows actual slot overrides and searches name/code; the catalog still manages reusable products.

`slot.textSizes` holds independent overrides for name, discount, sale and original. `textScale(key, slot)` falls back to the existing template default. All canvas renderers and HTML cards use this resolver. Reset clears only that slot's overrides. Template defaults remain available in a collapsed settings group.

Mobile product settings use the same editor in a bottom sheet: compact 56dvh and expanded 92dvh, limited to the visual viewport. Drag the handle to expand/collapse/dismiss; its button and arrow keys also change size. Settings scroll independently. Keyboard focus expands the sheet; open focuses the handle to avoid showing the keyboard immediately. Close and Escape preserve autosaved edits.

## UX clarity pass

Product editing explains shared catalog fields versus per-poster discounts/typography. Product-name search opens on typing rather than automatically covering the inspector. The poster list shows filled/total slots, a clear-search action, undo removal and capacity guidance. Disable Add at capacity. The catalog edit form exposes name, original price and image only; retained grouping metadata stays internal.

Product inspector uses a contained selection summary, pricing section, catalog scope note, and separate image/removal sections. Text size sliders include accessible five-percent step buttons (44px on mobile). Product image stays expanded. Reuse existing field listeners and preserve focus while adjusting values.

## Mobile spacing

The mobile editor uses 16px panel padding, 12px card gaps, 44px minimum action targets,
and 16px input text. Its bottom navigation separates Templates, Products, Preview,
Catalog and Settings. Templates is the initial section; selecting a template opens
Preview. Shared catalog editing stays separate from the list of placed products.
The existing shared product form remains in the swipeable bottom sheet. Mobile
spacing belongs in mobile.css; artwork, canvas text and print styles are unchanged.
