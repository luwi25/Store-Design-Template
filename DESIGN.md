# Editor interaction conventions

Preserve the approved template artwork. Editor controls use Outfit, navy #163b65 and teal #18a999.

Published defaults seed empty browsers and refresh revision-tracked projects at startup when a newer snapshot is published. Do not show the old Load published project control above the preview. Backup/import controls remain available in Catalog.

The top toolbar provides Restore Published Defaults beside Background remover in the browser build. Each scope requires an explicit confirmation and offers a backup download. Selected-template reset restores that template's settings and products while preserving other templates and existing catalog edits; changed shared products are copied instead of overwritten. Entire-project reset replaces the whole project. Fetch fresh published data before saving, retain the current project on failure, and respect concurrent-tab save conflicts. The toolbar button opens a scope chooser on desktop and mobile, followed by the existing confirmation and backup controls.

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

## Browser icon

The favicon uses a white poster sheet and teal sparkle on navy. Keep it legible at 16px; avoid lettering or store-specific logos. SVG is primary, with PNG and ICO fallbacks in icons/.

## Download actions

The toolbar uses one Download button opening PDF and PNG options. Keep existing export handlers, progress and disabled states. The dropdown supports keyboard focus, Escape and outside-click dismissal on desktop and mobile.

Print paper and Print fit fields are hidden in template settings. Their values and event bindings remain intact for saved projects, PDF export and printing.

Products and Catalog navigation tabs are visually hidden in the sidebar and corresponding mobile navigation. Keep their DOM, handlers, catalog data, and product editing functions intact. Mobile navigation displays Templates, Preview, and Settings.

The Add a background image action is visually hidden; its upload handler remains available. Sidebar spacing uses 16px panel padding, 10px template-card gaps, readable wrapped names, and 14px field separation. Settings summaries and mobile inputs retain accessible touch heights. These rules are scoped to screen-only editor rails in sidebar-spacing.css.

The redundant desktop Templates tab strip is hidden. The left rail and its panels use a continuous white background; the template panel has no leftover top divider. Keep mobile Templates navigation available.

The mobile Choose a product picker is visually hidden. Users open product settings by tapping a poster product; the picker DOM and handlers remain unchanged.

Template text defaults starts expanded in template settings; users can still collapse the section.

The desktop left rail fills the viewport while sticky, with internal scrolling for long template lists. Do not subtract toolbar height: the toolbar scrolls out of view.

Mobile hides the Templates screen and its bottom navigation button. Preview is the mobile starting screen, with Preview and Settings sharing the navigation width. Desktop template access remains unchanged.

Desktop Templates starts near the top of the left rail: no rail top padding or inherited sibling-panel margin, with a 12px template-panel inset. Hidden panels must not leave spacing above the visible template list.

Mobile polish is CSS-only: compact two-column toolbar prioritizes Download/Print, wider preview, distinct selected-product outline, clearer sheet handle/header, grouped pricing/image/text controls, 44-48px targets and focus rings. Existing sheet gestures, keyboard expansion, handlers, data and desktop/print appearance remain unchanged. Install app remains available.

Mobile toolbar shows Download, Print poster and More. More contains the original Background remover, Restore Published Defaults and Install app buttons; moving existing nodes preserves their handlers and states. Desktop positions are restored on wider screens. The menu supports Escape, outside dismissal and keyboard focus.

Zoom minus/percentage/plus and Fit controls are visually hidden on desktop and mobile. Keep their handlers and preview scaling logic intact.

Download menu includes PDF, PNG and Download backup on desktop and mobile. Reuse the original downloadDatabaseBackup button and its handler; include backup in keyboard navigation and disabled-state checks.

Group template navigation by stable store identity: Home Express, PesoPlus, then Other templates for custom designs. Keep alphabetical order within each group, preserve renamed template titles, and use matching optgroups in the toolbar selector.

## Home Express blue and orange collection

Home Express - Back (Blue & Orange) is an additional template with five rows of five products: Christmas Bundles, Kitchenware, School Supplies, Hardware, and Groceries. The supplied artwork owns the logo, tagline, section ribbons, and footer. Cards use blue names on white backgrounds with orange corners and a bold dark-orange price below each name. Names, photos and prices are editable through the shared product inspector. Displayed prices use the existing discount calculation and sale-price text-size control. Card photos fit above the name and price without cropping. Seed prices remain zero because the reference provides none. Existing four templates and their sales-sync assignments retain their current configuration.

The maintained renderer is home-express-collection.js. embed_collection.py embeds its source artwork and catalog seed assets into both the standalone HTML and Pages build. The template participates in store navigation, product selection, deletion, backup/import, selected-template restore, PNG/PDF export, and the shared two-copy print layout.

The blue-and-orange template exposes all five section headings in its own Section headings panel, with a restore-original action. Names persist in homeCollection.groupNames, retain spaces while typing, and fall back to original labels when blank. Preview, product-list headings, PNG, PDF and print share those labels. Section ribbons use consistent live canvas typography; product names wrap to two lines with measured font fitting. Product photos retain their source detail and aspect ratio with high-quality resampling and separate space for names and prices.

Home Express - Front (Blue & Orange) is a separate companion template with eight editable products in two rows of four. Preserve its supplied logo, Cebuano promotional copy, storefront, footer and QR. Extract product photos from the full-resolution supplied artwork, frame the complete objects, and render readable blue names with dark-orange sale prices below. Reuse the collection name-fitting helper, shared product inspector, independent typography settings, and existing print/export pipeline. Reference prices are unspecified; seed prices remain zero until entered. Store this template in homeCollectionFront, with a maximum of four products per row, and include it in Home Express navigation and published-default restoration. Existing sales-sync assignments remain unchanged.

The shared Selected template name field lives in Template Settings so it remains accessible on mobile. Allow 80 characters, preserve spaces and caret position while typing, and refresh the sidebar and toolbar selector immediately after a rename. Renaming changes the template title and download filename, not the artwork logo or promotional text.

Weekly sales sync includes both Home Express Template #2 designs. Front shows the eight highest-selling eligible products by units for the last completed week. Back assigns ranked departments to its four non-Christmas sections and ranks products within each; Christmas Bundles and its heading remain curated. These category rankings are independent of Template #1, while existing excluded departments remain excluded. Names and photos resolve by the store-specific catalog stock-code match, and current prices come from UBEST. Cleanup considers all saved template references.

A store-chooser dialog opens automatically the first time the app loads, asking whether to show Home Express templates, PesoPlus templates, or all templates. The choice is UI-only (kept in this browser's localStorage, not in the saved project), filters the existing template-store groups and toolbar template selector by hiding non-matching groups rather than removing or altering any template data, and never hides the Other templates group holding custom uploads. A Store row above the Templates list in the left sidebar shows the current choice and reopens the dialog at any time to change it; switching away from the active template's store selects the first visible template so the editor never lands on a hidden one. Every option asks for its own password (client-side check only, not real access control) before applying: Home Express, PesoPlus and All stores each have a distinct password. Until one is entered correctly, every store group stays hidden (Other templates excepted) and the Store row reads Locked; a wrong password, or closing the dialog without entering one, leaves the view locked rather than falling back to any store.
