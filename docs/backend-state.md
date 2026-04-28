# FamilyOS v2 Backend + UI State

## Overview

FamilyOS v2 is connected to the existing Supabase backend and runs on real household data across all core modules.

Authentication, household resolution, person resolution, CRUD flows, and realtime sync are implemented for most modules. Calendar uses a polling fallback because events realtime has been unreliable.

The current focus has shifted from backend wiring to UI stability, detail views, and module-level UX refinement.

---

## Environment

Required environment variables:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Loaded from:

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
- Future sharing/person-specific features

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
- `medical_shares` are scoped through `person_id → people.household_id`, but are not wired in the UI yet.

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

## Grocery

Table:

```txt
public.grocery_items
```

Status:

- CRUD ✅
- Realtime ✅
- Clean list-only UI ✅
- No detail view by design ✅

Current role:

- Execution checklist for shared shopping.
- Intentionally does not have a detail screen.

---

## To-do

Table:

```txt
public.todo_items
```

Status:

- CRUD ✅
- Realtime ✅
- Compact filtered UI ✅

Current UX:

- Segmented views:
  - Today
  - Week
  - Done
- Compact task rows.
- Small trailing delete actions.

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

## Wishlist

Table:

```txt
public.wishlist_items
```

Notes:

```txt
owner_id = people.id
```

Status:

- CRUD ✅
- Realtime ✅
- Detail card ✅
- Visual cleanup ✅

Current UX:

- Compact list rows.
- Selecting an idea opens a local detail card.
- Detail card can show priority, occasion, note, created date, and saved link if present.
- No purchasing workflow.
- No sharing workflow.
- No schema changes were made for detail view.

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

Status:

- Medical notes CRUD ✅
- Medical notes realtime ✅
- Allergies CRUD ✅
- Allergies realtime ✅
- Medications CRUD ✅
- Medications realtime ✅
- Detail card for selected medical note ✅
- Visual cleanup mostly complete ✅

Current Health state:

- Health now loads medical notes, allergies, and medications.
- Allergies support:
  - add
  - list
  - severity
  - notes
  - delete
- Medications support:
  - add
  - list
  - dosage
  - frequency
  - notes
  - delete
- Allergies and medications are scoped by `household_id` and `person_id`.
- Existing medical notes and note detail view remain intact.
- `medical_shares` is intentionally not wired yet.

Current Health UX:

- Segmented views:
  - Notes
  - Allergies
  - Meds
- Notes retain compact list + selected note detail card.
- Allergies and medications use compact section layouts.
- Severe allergies are surfaced with an alert-style card when present.
- Add forms remain inline and compact.
- Delete actions remain small trailing actions.
- More advanced sharing/permissions should not be implemented until product rules are defined.

---

## Recipes

Table:

```txt
public.recipes
```

Status:

- CRUD ✅
- Realtime ✅
- Detail card ✅
- Form cleanup ✅

Current UX:

- Recipe book only.
- No meal-planning logic.
- Compact recipe list.
- Selecting a recipe opens a local detail card.
- Detail can show title, category, serves, ingredients, steps, notes/tags/source link when present.
- Add form supports recipe title, category, serves, ingredients, and steps.
- No grocery integration.
- No schema changes were made for detail view.

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

Status:

- Trips CRUD ✅
- Trips realtime ✅
- Trip detail card ✅
- Packing items CRUD ✅
- Prep items CRUD ✅
- Packing/prep styled ✅

Current Trips state:

- Trips detail view loads packing items and prep items for the selected trip.
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

---

## Calendar

Table:

```txt
public.events
```

Status:

- Read ✅
- Create ✅
- Delete ✅
- Single-event edit ✅
- Dynamic month grid ✅
- Selected-day agenda ✅
- Realtime ⚠️ unreliable
- Polling fallback ✅

Current Calendar behavior:

- Calendar has a real dynamic month grid.
- Users can navigate months.
- Users can select a day.
- Selected-day agenda shows events for that date.
- Users can create events for the selected day.
- Users can delete events.
- Users can edit a single event’s title and time.
- Event date stays unchanged during edit.
- No schema changes were made for single-event editing.

Current Calendar limits:

- No recurrence editing.
- No multi-day events.
- No availability checks.
- No drag/drop.
- No calendar sharing or participants UI.

## Calendar multi-day baseline

Implemented:
- Calendar schema supports multi-day events with `date`, `end_date`, and `is_multi_day`.
- Create/edit forms support start date, end date, start time, end time, and all-day.
- Calendar saves `date` as the start date.
- Calendar saves `end_date` as the selected end date.
- Calendar saves `is_multi_day` based on whether `end_date > date`.
- Agenda includes events where the selected day falls between `date` and `end_date`.
- Existing single-day events remain supported.
- No recurrence logic was implemented.

Known limitation:
- Month grid multi-day bar rendering is partially implemented but not visually final.
- Older or inconsistent multi-day rows may not always render exactly as one continuous Apple-style block yet.
- Multi-day rendering should be revisited as a dedicated visual/calendar rendering slice.

Current rule:
- Do not implement recurrence until multi-day rendering is stable.
- Do not fake multi-day by creating duplicate event rows.
- One event row should represent the full date range.

---

## Home

Reads aggregated data from modules.

Status:

- Real module counts ✅
- Real calendar integration ✅
- Home dashboard polish ✅

Current Home UX:

- Uses real module snapshot data.
- Shows today/calendar/task/grocery/hub summary.
- Shows upcoming calendar items.
- Shows Family Hub module counts.
- Bottom Family Hub layout was polished so the final Grocery card spans full width and clears the bottom nav.

---

# UI State

## Completed Visual Alignment

Completed:

- Home dashboard uses real module snapshot data.
- Calendar has real dynamic month grid, selected-day agenda, create/delete/edit flow, and isolated calendar styles.
- To-do uses compact filtered rows for Today / Week / Done.
- Family Hub has module cards and account/sign-out section.
- Grocery, Wishlist, Health, Recipes, and Trips use compact module-row grammar.
- Recipes, Trips, Health, and Wishlist have local detail cards.
- Floating logout button was removed.
- Sign out now lives inside Family/account area.
- Recipes form layout was repaired with scoped recipe CSS.
- Health visual layout was repaired with scoped health CSS.
- Wishlist layout was cleaned with scoped wishlist CSS.
- Home bottom layout was polished.

Current visual direction:

- Apple-style light gray shell.
- Glass cards.
- Large readable headers.
- Compact mobile-first rows.
- Small trailing delete actions.
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

## Current Visual Repair Baseline

Completed:

- Recipes form layout was repaired with scoped recipe CSS.
- Health visual layout was repaired with scoped health CSS.
- Wishlist layout was repaired with scoped wishlist CSS.
- Trip packing/prep styling was added to `globals.css`.
- Current CSS strategy is append-only scoped repair blocks unless a full stylesheet replacement is explicitly necessary.

Current styling rules:

- Do not replace `globals.css` wholesale during feature work unless the current file is inspected and preserved exactly.
- Prefer isolated class names per module.
- Prefer scoped append blocks for visual fixes.
- Remove temporary paste-source CSS files after copying their content into `globals.css`.
- Avoid shared class names that let one module accidentally break another.
- No orphan CSS files should remain in `src/styles` unless explicitly imported.

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

---

# Known Limitations

## Calendar

- Events realtime remains unreliable.
- Polling fallback is used.
- No recurrence.
- No multi-day events.
- No availability checks.
- No participants UI.
- No drag/drop.

## Health

- `medical_shares` is not wired.
- Sharing/permissions need product rules before implementation.

## Trips

- Packing/prep are wired.
- No documents.
- No itinerary.
- No bookings.
- No sharing.

## Recipes

- Recipe detail exists.
- No meal planning.
- No grocery integration.

## Wishlist

- Detail exists.
- No purchasing flow.
- No sharing flow.

## General UI

- Forms are still mostly inline.
- Detail views are local selections, not route-based pages.
- Some visual polish remains, especially Health.
- `globals.css` remains fragile and should be handled carefully.

---

# Current V2 Checkpoint

FamilyOS v2 now has:

- Real Supabase auth.
- Dynamic household resolution.
- Dynamic person resolution.
- Real household data.
- CRUD across core modules.
- Realtime sync across most modules.
- Calendar polling fallback.
- Dynamic Calendar month view.
- Calendar create/delete/single-event edit.
- Home dashboard using real data.
- Family Hub with real module routes.
- Detail cards for Recipes, Trips, Health notes, and Wishlist.
- Trips packing/prep items wired.
- Health allergies and medications wired.
- Cleaned module list-row grammar.
- Scoped visual repair strategy.

Current focus:

```txt
UI consistency
Small UX improvements
Careful module-specific refinements
No broad rewrites
No new major modules
```

---

# Suggested Next Steps

1. Health visual polish, if still needed.
2. Calendar minor QA only, no recurrence yet.
3. Improve inline add forms into cleaner sheets/detail flows.
4. Consider route-based detail pages if local detail cards become cramped.
5. Define rules before wiring:
   - Health sharing
   - Trip documents/bookings/itinerary
   - Calendar participants/recurrence
6. Keep CSS changes scoped and module-specific.

---

# Summary

FamilyOS v2 now has a stable backend foundation and a usable Apple-style mobile UI baseline.

The app is no longer just wired to Supabase; it now has real household workflows across Home, Calendar, To-do, Family Hub, Grocery, Wishlist, Recipes, Trips, and Health.

Next work should stay narrow, visual, and module-specific. Broad refactors and full stylesheet replacements should be avoided unless absolutely necessary.
