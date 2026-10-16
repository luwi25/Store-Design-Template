# Editor interaction conventions

Preserve the approved template artwork. Editor controls use Outfit, navy #163b65 and teal #18a999.

Published defaults seed empty browsers only. Do not show a Load published project control. Existing projects remain local and retain the backup/import controls.

Both catalog and template photo editors share createBackgroundTools. Background removal overlays its preview with an accessible status, spinner and waiting guidance. Preserve the original on failure, allow retry and respect reduced motion.


## Product inspector update

Desktop: a compact white header with template selector and save status; left Products/Templates/Catalog tabs; a pale dotted preview workspace with zoom; right selected-product inspector and store settings. Navy #163b65, teal #18a999, neutral #f7f8fc, Outfit typography. Artwork colors and layout remain owned by each template.

`renderIndependentSlotEditor` remains the shared form owner. Its single DOM form docks in the desktop inspector and returns to the dialog on mobile. Native fields, existing validation, save queue and error notices are reused. The new poster list shows actual slot overrides and searches name/code; the catalog still manages reusable products.

`slot.textSizes` holds independent overrides for name, discount, sale and original. `textScale(key, slot)` falls back to the existing template default. All canvas renderers and HTML cards use this resolver. Reset clears only that slot's overrides. Template defaults remain available in a collapsed settings group.
