# FamilyOS v2 Backend + UI State

## Overview

FamilyOS v2 is connected to the existing Supabase backend and runs on real household data across all core modules.

Authentication, household resolution, person resolution, CRUD flows, edit support, and realtime sync are implemented for most modules. Calendar uses a polling fallback because events realtime has been unreliable.

The current focus has shifted from backend wiring to UI stability, module-level UX refinement, careful visual QA, and keeping the app snappy and stable.

---

## Environment

Required environment variables:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Loaded locally from:

```txt
.env.local
```

Core files:

```txt
src/core/config/env.ts
src/lib/supabase/client.ts
src/lib/supabase/auth.ts
src/lib/supabase/household.ts
src/lib/supabase/person.ts
```

Do not commit `.env.local`.

---

## Authentication

Handled via Supabase email/password auth.

Files:

```txt
src/app/AuthGate.tsx
src/lib/supabase/auth.ts
```

Status:

- Session check ✅
- Login ✅
- Logout ✅
- Auth state listener ✅
- Household/person cache clearing ✅

Current UX:

- Floating global logout was removed.
- Sign out now lives inside Family/account area.

---

## Household Resolution

Database function:

```sql
get_my_household_id()
```

Logic:

```sql
select household_id
from people
where user_id = auth.uid()
limit 1;
```

Used across modules for data scoping.

---

## Person Resolution

Resolved from:

```txt
public.people
```

Used for:

- Wishlist `owner_id`
- Health `person_id`
- Health allergies/medications
- Future person-specific grouping and filtering

Current product rule:

```txt
Everyone in the household can see everything for now.
Some information belongs to a person and should be filtered/grouped by person.
This is separation, not privacy.
```

No privacy or restricted visibility layer is implemented yet.

---

## RLS Model

Most household-scoped modules follow:

```txt
household_id = get_my_household_id()
```

Model:

```txt
auth.users.id
→ people.user_id
→ people.household_id
→ module.household_id
```

Special cases:

- `packing_items` are scoped through `trip_id → trips.household_id`.
- `medical_shares` are scoped through `person_id → people.household_id`, but are intentionally not wired in the UI yet.

---

## Realtime

Realtime-enabled tables:

```txt
grocery_items
todo_items
wishlist_items
medical_notes
allergies
medications
recipes
trips
packing_items
prep_items
events
```

Requirement:

```sql
alter table <table> replica identity full;
```

Working realtime:

- Grocery ✅
- To-do ✅
- Wishlist ✅
- Health notes ✅
- Allergies ✅
- Medications ✅
- Recipes ✅
- Trips ✅
- Trips packing/prep ✅

Calendar:

- Events realtime is unreliable ⚠️
- Calendar uses polling fallback ✅
- Polling interval is approximately 3 seconds

---

# Module State

## Home

Reads aggregated data from modules.

Files:

```txt
src/features/home/hooks/useHomeSnapshot.ts
src/features/home/pages/HomePage.tsx
```

Status:

- Real module counts ✅
- Real calendar integration ✅
- Home dashboard polish ✅
- Family Hub preview ✅

Current Home UX:

- Uses real module snapshot data.
- Shows today/calendar/task/grocery/hub summary.
- Shows upcoming calendar items.
- Shows Family Hub module counts.
- Bottom Family Hub layout was polished so the final Grocery card spans full width and clears the bottom nav.

---

## Calendar

Table:

```txt
public.events
```

Important columns:

```txt
id
household_id
title
date
start_time
end_time
all_day
category
visibility
responsible_id
location
notes
reminder
is_busy
recurrence
recurrence_end
recurrence_parent_id
end_date
is_multi_day
created_at
updated_at
```

Files:

```txt
src/features/calendar/types.ts
src/features/calendar/services/calendarSupabaseService.ts
src/features/calendar/hooks/useCalendarItems.ts
src/features/calendar/pages/CalendarPage.tsx
```

Status:

- Read ✅
- Create ✅
- Delete ✅
- Single-event edit ✅
- Multi-day create/edit foundation ✅
- Dynamic month grid ✅
- Selected-day agenda ✅
- Agenda range logic for multi-day events ✅
- Week-level multi-day month bars ✅
- Realtime ⚠️ unreliable
- Polling fallback ✅
- Recurrence ❌
- Participants UI ❌
- Availability checks ❌
- Drag/drop ❌

Current Calendar behavior:

- Calendar has a real dynamic month grid.
- Users can navigate months.
- Users can select a day.
- Selected-day agenda shows events for that date.
- Users can create events for the selected day.
- Users can delete events.
- Users can edit event title, date range, time, and all-day state.
- Multi-day events are represented by one row with `date`, `end_date`, and `is_multi_day`.
- Agenda includes events where the selected day falls between `date` and `end_date`.
- Month grid renders multi-day events as week-level bars instead of duplicate per-day rows.

Calendar multi-day rule:

```txt
Do not implement recurrence until multi-day behavior remains stable.
Do not fake multi-day by creating duplicate event rows.
One event row should represent the full date range.
```

Known Calendar limitations:

- Events realtime remains unreliable.
- Older or inconsistent multi-day rows may still need QA.
- Week-level bar rendering is the current baseline, but minor visual cleanup may still be needed after real-device testing.
- No recurrence editing.
- No participants UI.
- No availability checks.
- No drag/drop.

Important technical note:

```txt
Legacy local calendar data exists in:
src/features/calendar/services/calendarLocalService.ts
src/lib/store/familyStore.ts

CalendarEvent type fields for newer event properties should stay optional unless those mock/local files are updated.
```

---

## To-do

Table:

```txt
public.todo_items
```

Files:

```txt
src/features/todo/types.ts
src/features/todo/services/todoSupabaseService.ts
src/features/todo/hooks/useTodoItems.ts
src/features/todo/pages/TodoPage.tsx
```

Status:

- CRUD ✅
- Edit support ✅
- Realtime ✅
- Compact filtered UI ✅
- Shared household tasks ✅
- Person assignment ❌

Current UX:

- Segmented views:
  - Today
  - Week
  - Done
- Compact task rows.
- Rows support edit, toggle done, and delete.
- Edit loads title, area, and due date into the existing composer.
- Save updates the existing row without creating duplicates.

### To-do ownership baseline

Current To-do model:

- To-do items are household-level shared tasks.
- Everyone in the household can see all tasks.
- Completion is household-wide.
- There is no `assigned_to` field yet.
- `created_by` exists but is not currently used as the task owner/assignee model.

Current rule:

- Do not implement To-do person filtering yet.
- Do not treat `created_by` as assignment.
- Keep To-do shared until a proper assignment model is designed.

Future possible model:

- Add nullable `assigned_to` referencing `people.id`.
- Support All / Assigned to person filtering.
- Keep unassigned tasks visible as shared household tasks.

---

## Grocery

Table:

```txt
public.grocery_items
```

Files:

```txt
src/features/grocery/types.ts
src/features/grocery/services/grocerySupabaseService.ts
src/features/grocery/hooks/useGroceryItems.ts
src/features/grocery/pages/GroceryPage.tsx
```

Status:

- CRUD ✅
- Realtime ✅
- Clean list-only UI ✅
- No detail view by design ✅
- No edit support by design ✅

Current role:

- Execution checklist for shared shopping.
- Intentionally does not have a detail screen.
- Current flow is add → check off → delete.
- Do not overbuild Grocery unless the product need becomes clear.

---

## Wishlist

Table:

```txt
public.wishlist_items
```

Notes:

```txt
owner_id = people.id
```

Files:

```txt
src/features/wishlist/services/wishlistSupabaseService.ts
src/features/wishlist/hooks/useWishlistItems.ts
src/features/wishlist/pages/WishlistPage.tsx
```

Status:

- CRUD ✅
- Edit support ✅
- Realtime ✅
- Owner/person filter ✅
- AddSheet ✅
- Detail card ✅
- Visual cleanup ✅
- Shared visibility, separated by owner ✅
- Privacy rules ❌
- Purchasing/sharing workflow ❌

Current UX:

- Compact list rows.
- Selecting an idea opens a local detail card.
- Detail card can show priority, occasion, note, created date, and saved link if present.
- Edit reuses the Wishlist sheet.
- Edit supports title, note, link, priority, occasion, and owner/person.
- No purchasing workflow.
- No sharing workflow.
- No schema changes were made for detail view.

---

## Recipes

Table:

```txt
public.recipes
```

Files:

```txt
src/features/recipes/types.ts
src/features/recipes/services/recipesSupabaseService.ts
src/features/recipes/hooks/useRecipes.ts
src/features/recipes/pages/RecipesPage.tsx
```

Status:

- CRUD ✅
- Edit support ✅
- Realtime ✅
- Detail card ✅
- AddSheet ✅
- Recipe book only ✅
- Meal planning ❌
- Grocery integration ❌

Current UX:

- Recipe book only.
- No meal-planning logic.
- Compact recipe list.
- Selecting a recipe opens a local detail card.
- Detail can show title, category, serves, ingredients, steps, notes/tags/source link when present.
- Add/Edit sheet supports recipe title, category, serves, ingredients, and steps.
- Save updates the existing recipe without creating duplicates.
- No grocery integration.
- No schema changes were made for detail view.

Important:

```txt
Recipes page previously broke because TSX and CSS drifted.
Keep the current TSX/CSS class contract aligned.
Do not add legacy compatibility CSS unless absolutely necessary.
```

---

## Trips

Primary table:

```txt
public.trips
```

Subtables:

```txt
public.packing_items
public.prep_items
```

Files:

```txt
src/features/trips/types.ts
src/features/trips/services/tripsSupabaseService.ts
src/features/trips/hooks/useTrips.ts
src/features/trips/hooks/useTripDetailItems.ts
src/features/trips/pages/TripsPage.tsx
```

Status:

- Trips CRUD ✅
- Trips edit support ✅
- Trips realtime ✅
- Trip detail card ✅
- AddSheet ✅
- Packing items CRUD ✅
- Prep items CRUD ✅
- Packing/prep styled ✅
- Documents/itinerary/bookings/sharing ❌

Current Trips state:

- Trips detail view loads packing items and prep items for the selected trip.
- Trip edit reuses the existing trip sheet.
- Trip edit supports title, destination, start date, end date, accommodation link, and notes.
- Packing items support:
  - add
  - packed/unpacked toggle
  - delete
- Prep items support:
  - add
  - done/open toggle
  - delete
- Packing items are scoped through `trip_id → trips.household_id`.
- Prep items are scoped directly by `household_id`.
- No schema changes were made.
- No documents, itinerary, bookings, or sharing logic yet.

Important:

```txt
Trips page previously broke because TSX and CSS drifted.
Keep the current TSX/CSS class contract aligned.
Do not touch packing/prep logic during trip edit or visual slices unless explicitly scoped.
```

---

## Health

Primary tables:

```txt
public.medical_notes
public.allergies
public.medications
```

Not wired:

```txt
public.medical_shares
```

Files:

```txt
src/features/health/types.ts
src/features/health/services/healthSupabaseService.ts
src/features/health/hooks/useMedicalNotes.ts
src/features/health/hooks/useHealthItems.ts
src/features/health/pages/HealthPage.tsx
```

Status:

- Medical notes CRUD ✅
- Medical notes edit support ✅
- Medical notes realtime ✅
- Allergies CRUD ✅
- Allergies edit support ✅
- Allergies realtime ✅
- Medications CRUD ✅
- Medications edit support ✅
- Medications realtime ✅
- Detail card for selected medical note ✅
- Person filter ✅
- Visual cleanup mostly complete ✅
- `medical_shares` wired ❌

Current Health state:

- Health loads medical notes, allergies, and medications.
- Health records are separated by `person_id`.
- Everyone in the household can currently see all health records.
- New records use the selected person.
- If All is selected, new records default to the current person.
- Medical notes support:
  - add
  - list
  - selected note detail
  - edit
  - delete
- Allergies support:
  - add
  - list
  - severity
  - notes
  - edit
  - delete
- Medications support:
  - add
  - list
  - dosage
  - frequency
  - notes
  - edit
  - delete
- Allergies and medications are scoped by `household_id` and `person_id`.
- `medical_shares` is intentionally not wired yet.

Current Health UX:

- Segmented views:
  - Notes
  - Allergies
  - Meds
- Notes retain compact list + selected note detail card.
- Allergies and medications use compact section layouts.
- Severe allergies are surfaced with an alert-style card when present.
- Add/edit forms remain inline and compact.
- Row actions have been repaired so edit/delete controls stay inside cards.
- More advanced sharing/permissions should not be implemented until product rules are defined.

---

## Global Create Sheet

File:

```txt
src/ui/navigation/CreateActionSheet.tsx
```

Current global create actions:

```txt
Event → /calendar?create=event
Task → /todo?create=task
Grocery → /family/grocery?create=grocery
Wishlist → /family/wishlist?create=wishlist
Recipe → /family/recipes?create=recipe
Trip → /family/trips?create=trip
Health note → /family/health?create=health
```

Rule:

```txt
Every visible + must either open the correct form/sheet or not exist.
No decorative plus buttons.
```

Recent visual QA:

- Global create/add sheet height and scrolling were tightened.
- Bottom nav spacing and safe-area handling were tightened.
- Fake/decorative plus button issues should remain a hard QA check.

---

# UI State

## Completed Visual Alignment

Completed:

- Home dashboard uses real module snapshot data.
- Calendar has real dynamic month grid, selected-day agenda, create/delete/edit flow, multi-day foundation, and week-level multi-day bars.
- To-do uses compact filtered rows for Today / Week / Done and supports edit.
- Family Hub has module cards and account/sign-out section.
- Grocery, Wishlist, Health, Recipes, and Trips use compact module-row grammar.
- Wishlist, Recipes, Trips, Health notes, Health allergies, Health medications, and To-do support edit.
- Recipes, Trips, Health, and Wishlist have local detail cards.
- Floating logout button was removed.
- Sign out now lives inside Family/account area.
- Recipes form/layout was repaired with scoped recipe CSS.
- Health visual layout and row action overflow were repaired with scoped health CSS.
- Wishlist layout was cleaned with scoped wishlist CSS.
- Trip packing/prep styling was added to `globals.css`.
- Home bottom layout was polished.
- Bottom nav spacing and safe-area behavior received a visual QA pass.
- Global create sheet received a visual QA pass.

Current visual direction:

- Apple-style light gray shell.
- Glass cards.
- Large readable headers.
- Compact mobile-first rows.
- Small trailing destructive actions.
- Black active nav.
- Blue primary actions.
- Stability and speed over decorative complexity.

---

## Detail View Baseline

Completed detail views:

- Recipes opens a selected recipe detail card from the compact list.
- Trips opens a selected trip detail card from the compact list.
- Health opens a selected medical note detail card from the compact list.
- Wishlist opens a selected idea detail card from the compact list.
- Grocery remains an execution-only checklist and intentionally has no detail view.

Current detail-view rules:

- Detail views are local UI selections, not separate routes yet.
- No backend schema changes were made for detail views.
- Delete actions remain small trailing actions on rows.
- Detail cards should use scoped detail styling where possible.
- Do not wire richer backend subfeatures unless explicitly scoped.

---

## Add/Edit Sheet Baseline

Implemented AddSheet-style flows:

```txt
Wishlist ✅
Recipes ✅
Trips ✅
Health create choice sheet ✅
```

Edit support implemented:

```txt
Wishlist ✅
Recipes ✅
Trips ✅
Health notes ✅
Health allergies ✅
Health medications ✅
To-do ✅
```

Intentionally not implemented:

```txt
Grocery edit ❌ by design
```

Rules:

- Do not extract a universal shared AddSheet component yet.
- Do not create a mega-form component.
- Keep forms local to the module.
- Keep CSS scoped.
- Avoid broad CSS rewrites.
- Build after every slice.
- Commit after every clean slice.

---

## Current Visual Repair Baseline

Completed:

- Calendar week-level multi-day bar CSS restored and preserved after prior regressions.
- Recipes form/detail edit styling repaired with scoped recipe CSS.
- Health row/action styling repaired with scoped health CSS.
- Wishlist layout repaired with scoped wishlist CSS.
- Trip packing/prep styling added to `globals.css`.
- To-do edit row containment styling added.
- Bottom nav spacing and global create sheet behavior polished.
- Current CSS strategy is append-only scoped repair blocks unless a full stylesheet replacement is explicitly necessary.

Current styling rules:

- Do not replace `globals.css` wholesale during feature work unless the current file is inspected and preserved exactly.
- Prefer isolated class names per module.
- Prefer scoped append blocks for visual fixes.
- Remove temporary paste-source CSS files after copying their content into `globals.css`.
- Avoid shared class names that let one module accidentally break another.
- No orphan CSS files should remain in `src/styles` unless explicitly imported.
- When adding/editing CSS, verify Calendar, Recipes, Trips, Health, To-do, and bottom nav still render correctly.

Known CSS pain points:

- Full `globals.css` replacements repeatedly broke pages.
- AddSheet CSS consolidation previously broke Recipes/Trips.
- Calendar week bars regressed when a later CSS slice did not preserve the matching styles.
- If a page looks raw/broken, compare TSX class names against CSS before adding compatibility junk.

---

# Design Rules

- Mobile-first.
- Clean layout.
- Light gray shell.
- Glass cards.
- Large readable headers.
- Consistent spacing.
- Compact rows.
- Small destructive actions.
- Black active bottom nav.
- Blue primary actions.
- No random per-module styling chaos.
- Prefer stable and readable over fancy.
- Snappy and stable over decorative complexity.
- No fake buttons.
- No broad redesign while core QA remains open.

---

# Engineering Rules

- One module at a time.
- Inspect schema first.
- Inspect RLS policies.
- Then implement:
  - Read
  - Create
  - Delete
  - Realtime/polling
  - Update only when explicitly scoped
- No premature abstraction.
- Reuse working patterns.
- Prefer scoped CSS over global rewrites.
- Build after every slice.
- Commit after every clean slice.
- Push after every clean checkpoint.
- Do not stack new work on top of a broken Vercel deploy.
- Preserve existing CSS coverage when replacing `globals.css`.
- Prefer full replacement files when applying coding slices.

---

# Known Limitations

## Calendar

- Events realtime remains unreliable.
- Polling fallback is used.
- No recurrence.
- No availability checks.
- No participants UI.
- No drag/drop.
- Multi-day week bars are implemented but should still receive real-device QA.

## Health

- `medical_shares` is not wired.
- Sharing/permissions need product rules before implementation.
- Health is functional but can still become visually crowded.

## Trips

- Packing/prep are wired.
- No documents.
- No itinerary.
- No bookings.
- No sharing.

## Recipes

- Recipe detail and edit exist.
- No meal planning.
- No grocery integration.

## Wishlist

- Detail and edit exist.
- No purchasing flow.
- No sharing flow.

## To-do

- Edit exists.
- No person assignment.
- No person filtering.
- `created_by` is not assignment.

## Grocery

- Add/check/delete only by design.
- No detail.
- No edit.

## General UI

- Forms are still mostly inline except modules using AddSheet-style patterns.
- Detail views are local selections, not route-based pages.
- Some visual polish may remain, especially Health and Calendar edge cases.
- `globals.css` remains fragile and should be handled carefully.

---

# Current V2 Checkpoint

FamilyOS v2 now has:

- Real Supabase auth.
- Dynamic household resolution.
- Dynamic person resolution.
- Real household data.
- CRUD across core modules.
- Edit support across the main content modules:
  - Wishlist
  - Recipes
  - Trips
  - Health notes
  - Health allergies
  - Health medications
  - To-do
- Grocery intentionally remains simple: add/check/delete.
- Realtime sync across most modules.
- Calendar polling fallback.
- Dynamic Calendar month view.
- Calendar create/delete/edit.
- Calendar multi-day foundation.
- Calendar week-level multi-day bars.
- Home dashboard using real data.
- Family Hub with real module routes.
- Detail cards for Recipes, Trips, Health notes, and Wishlist.
- Trips packing/prep items wired.
- Health allergies and medications wired.
- Cleaned module list-row grammar.
- Scoped visual repair strategy.
- Visual QA polish pass for bottom nav, global create sheet, Health rows, To-do rows, and Calendar bars.

Current focus:

```txt
UI consistency
Small UX improvements
Visual QA
Careful module-specific refinements
No broad rewrites
No new major modules
```

Current recommended checkpoint tag:

```txt
familyos-v2-main-edit-polish-baseline
```

---

# Suggested Next Steps

1. Deploy/redeploy and smoke test the current main edit + polish baseline.
2. Calendar QA cleanup only if a specific visual issue remains.
3. Health visual polish only if still crowded on real device.
4. Repo/docs checkpoint after deployment.
5. Consider route-based detail pages only if local detail cards become cramped.
6. Define rules before wiring:
   - Health sharing
   - Trip documents/bookings/itinerary
   - Calendar participants/recurrence
7. Keep CSS changes scoped and module-specific.
8. Avoid new modules until the current flows feel stable.

Do not do next:

```txt
No recurrence yet.
No health sharing yet.
No trip documents yet.
No broad design rewrite.
No full globals.css replacement unless inspected and preserved.
```

---

# Smoke Test Checklist

After deploy:

```txt
Login
Home real data
Calendar month rendering
Calendar create/edit/delete
Calendar multi-day create/edit
Calendar agenda range display
Global create sheet
Wishlist add/edit/filter
Recipes add/edit/detail
Trips add/edit/detail/packing/prep
Health add/edit/delete note
Health add/edit/delete allergy
Health add/edit/delete medication
Health person filter
To-do add/edit/toggle/delete
Grocery add/check/delete
Bottom nav spacing
No fake + buttons
No black/raw pages
```

---

# Summary

FamilyOS v2 now has a stable backend foundation, a usable Apple-style mobile UI baseline, and a practical main edit-support baseline across the active modules.

The app is no longer just wired to Supabase; it now has real household workflows across Home, Calendar, To-do, Family Hub, Grocery, Wishlist, Recipes, Trips, and Health.

Next work should stay narrow, visual, and module-specific. Broad refactors, new modules, recurrence, sharing, and full stylesheet replacements should be avoided unless explicitly scoped.
