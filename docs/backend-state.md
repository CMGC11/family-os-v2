# FamilyOS v2 Backend State

## Current status

FamilyOS v2 is connected to the existing Supabase project from the previous FamilyOS app.

The app is currently using real Supabase-backed household data for:

- Grocery
- To-do
- Calendar
- Home dashboard counts

Temporary dev authentication is still in place.

---

## Supabase project

The app uses:

VITE_SUPABASE_URL  
VITE_SUPABASE_ANON_KEY  

Configured through:

.env.local  

The file is ignored by Git.

Client files:

src/core/config/env.ts  
src/lib/supabase/client.ts  
src/lib/supabase/devLogin.ts  
src/lib/supabase/household.ts  

---

## Authentication

Current auth is temporary.

src/lib/supabase/devLogin.ts  

This logs in a known Supabase user during development.

This must be replaced later with a real auth flow.

Do not ship production with hardcoded email/password.

---

## Household resolution

Household ID is now resolved dynamically through Supabase.

Used function:

public.get_my_household_id()

Function logic:

select household_id  
from people  
where user_id = auth.uid()  
limit 1;

Client helper:

src/lib/supabase/household.ts  

The app no longer hardcodes a household ID.

---

## Grocery

Table:

public.grocery_items  

Used columns:

id  
household_id  
name  
category  
is_checked  
created_at  
checked_at  

Ignored existing columns for now:

quantity  
notes  
added_by  
checked_by  
meal_source  
list_name  

Client files:

src/features/grocery/types.ts  
src/features/grocery/services/grocerySupabaseService.ts  
src/features/grocery/hooks/useGroceryItems.ts  
src/features/grocery/pages/GroceryPage.tsx  

Status:

Read      ✅  
Create    ✅  
Update    ✅  
Delete    ✅  
Realtime  ✅  

Realtime works reliably across browser clients.

---

## To-do

Table:

public.todo_items  

Created for FamilyOS v2 because no general task table existed.

Used columns:

id  
household_id  
title  
area  
due  
is_done  
created_by  
created_at  

Client files:

src/features/todo/types.ts  
src/features/todo/services/todoSupabaseService.ts  
src/features/todo/hooks/useTodoItems.ts  
src/features/todo/pages/TodoPage.tsx  

Status:

Read      ✅  
Create    ✅  
Update    ✅  
Delete    ✅  
Realtime  ✅  

Realtime works reliably across browser clients.

---

## Calendar

Table:

public.events  

Used columns:

id  
household_id  
title  
date  
start_time  
created_at  

Ignored existing complexity for now:

end_time  
all_day  
category  
visibility  
responsible_id  
location  
notes  
reminder  
is_busy  
updated_at  
recurrence  
recurrence_end  
recurrence_parent_id  
end_date  
is_multi_day  

Client files:

src/features/calendar/types.ts  
src/features/calendar/services/calendarSupabaseService.ts  
src/features/calendar/hooks/useCalendarItems.ts  
src/features/calendar/pages/CalendarPage.tsx  

Status:

Read              ✅  
Create            ✅  
Delete            ✅  
Realtime attempt  ⚠️  
Polling fallback  ✅  

Calendar realtime is unreliable across browsers (especially deletes).

Current solution:

- Realtime subscription still exists
- Polling refresh runs every ~3 seconds

This is acceptable for now: slower than Grocery/To-do, but stable.

---

## Home

Home reads real Supabase-backed counts from:

grocery_items  
todo_items  

Calendar data is partially integrated (basic count / selected-day events).

Client files:

src/features/home/hooks/useHomeSnapshot.ts  
src/features/home/pages/HomePage.tsx  

Status:

Real grocery count ✅  
Real todo count    ✅  
Calendar count     ⚠️ basic  

---

## Realtime setup

Enabled tables:

grocery_items  
todo_items  
events  

Notes:

- Grocery and To-do realtime work correctly across clients
- Calendar realtime is inconsistent, polling fallback is used
- Some tables use replica identity full to improve delete propagation

---

## Development workflow

Rule:

One module at a time.

Standard sequence:

Read  
Create  
Update  
Delete  
Realtime or fallback sync  
Commit  

Avoid large refactors while backend wiring is stabilizing.

---

## Design direction

Keep Apple-style prototype consistency:

Clean layout  
Light background  
Glass cards  
Large headers  
Subtle shadows  
Minimal clutter  
Strong typography  
Simple interactions  

Do not introduce random styling patterns.

---

## Known limitations

- Dev login still active
- Calendar recurrence ignored
- Calendar multi-day logic ignored
- Calendar selected date is static
- Calendar sync uses polling fallback
- No production auth flow yet

---

## Next recommended work

1. Replace dev login with real authentication flow  
2. Make calendar selected date dynamic  
3. Improve calendar sync only if needed  
4. Start wiring next modules: Wishlist, Health, Trips, Recipes  
5. Add basic user/session handling for multi-user environments  

---

## Summary

FamilyOS v2 now has a working shared household backend:

- Multi-user data model  
- Supabase-backed storage  
- RLS enforced per household  
- Realtime where stable  
- Polling fallback where needed  

This is a stable foundation to continue building on.