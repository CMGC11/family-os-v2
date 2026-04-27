# FamilyOS v2 Backend State

## Overview

FamilyOS v2 is connected to an existing Supabase backend and now runs on real household data across all core modules.

Authentication, household resolution, and realtime sync are implemented and stable for most modules.

---

## Environment

VITE_SUPABASE_URL  
VITE_SUPABASE_ANON_KEY  

Loaded from:

.env.local

Core files:

src/core/config/env.ts  
src/lib/supabase/client.ts  
src/lib/supabase/auth.ts  
src/lib/supabase/household.ts  
src/lib/supabase/person.ts  

---

## Authentication

Handled via Supabase email/password.

Files:

src/app/AuthGate.tsx  
src/lib/supabase/auth.ts  

Status:

Session check ✅  
Login ✅  
Logout ✅  
Auth state listener ✅  
Cache clearing ✅  

---

## Household Resolution

Database function:

get_my_household_id()

Logic:

select household_id  
from people  
where user_id = auth.uid()  
limit 1;

Used across all modules for data scoping.

---

## Person Resolution

Resolved from:

public.people

Used for:

Wishlist owner_id  
Health person_id  

---

## RLS Model

All modules follow:

household_id = get_my_household_id()

Model:

auth.users.id  
→ people.user_id  
→ people.household_id  
→ module.household_id  

---

## Realtime

Enabled tables:

grocery_items  
todo_items  
wishlist_items  
medical_notes  
recipes  
trips  
events  

Requirement:

alter table <table> replica identity full;

Working realtime:

Grocery ✅  
To-do ✅  
Wishlist ✅  
Health ✅  
Recipes ✅  
Trips ✅  

Calendar uses polling fallback.

---

## Modules

### Grocery

Table: public.grocery_items

Status:

CRUD ✅  
Realtime ✅  

---

### To-do

Table: public.todo_items

Status:

CRUD ✅  
Realtime ✅  

---

### Wishlist

Table: public.wishlist_items

Notes:

owner_id = people.id

Status:

CRUD ✅  
Realtime ✅  

---

### Health

Table: public.medical_notes

Other tables (not wired):

allergies  
medications  
medical_shares  

Status:

CRUD ✅  
Realtime ✅  

---

### Recipes

Table: public.recipes

Status:

CRUD ✅  
Realtime ✅  

UI intentionally simplified.

---

### Trips

Table: public.trips

Other tables (not wired):

packing_items  
prep_items  

Status:

CRUD ✅  
Realtime ✅  

---

### Calendar

Table: public.events

Status:

Read ✅  
Create ✅  
Delete ✅  
Realtime ⚠️ unreliable  
Polling fallback ✅  

Notes:

~3s polling interval  
No recurrence handling  
Static month grid  

---

### Home

Reads aggregated data from modules.

Status:

Real counts ✅  
Basic calendar integration ⚠️  

---

## Current System State

Auth → real sessions ✅  
Household → dynamic resolution ✅  
Person → dynamic resolution ✅  

Grocery → CRUD + realtime ✅  
To-do → CRUD + realtime ✅  
Wishlist → CRUD + realtime ✅  
Health → CRUD + realtime ✅  
Recipes → CRUD + realtime ✅  
Trips → CRUD + realtime ✅  
Calendar → CRUD + polling fallback ✅  
Home → real data ✅  

---

## Design Rules

Mobile-first  
Clean layout  
Light gray shell  
Glass cards  
Large headers  
Consistent spacing  
No per-module styling chaos  

---

## Engineering Rules

One module at a time  
Inspect schema first  
Inspect RLS  
Then: Read → Create → Delete → Realtime  
No premature abstraction  
Reuse working patterns  

---

## Known Limitations

Calendar realtime unreliable  
Calendar month not dynamic  
No edit/update flows  
Recipes form simplified  
Trips packing/prep not implemented  
Health extra tables not wired  
Home still basic  
Logout overlaps header UI  

---

## Next Steps

1. UI consistency pass  
2. Fix header/logout positioning  
3. Add detail/edit screens  
4. Proper calendar month navigation  
5. Trips packing/prep items  
6. Health allergies/medications  
7. Improve Home dashboard  

---

## Summary

FamilyOS v2 now has:

Real auth  
Real household data  
Realtime sync (most modules)  
Stable backend foundation  

Focus shifts from backend → UI + UX + structure.