# Debugging and Fixing App Navigation and Data Connectivity

I will perform a complete debug and fix of the application as requested, focusing on Supabase configuration, App routing/layout, logging, and error handling.

## 1. Verify and Fix Supabase Configuration (`src/lib/supabase.ts`)

* **Current State**: The file currently uses hardcoded credentials from `src/utils/supabase/info.tsx` and does not check `import.meta.env`.

* **Action**:

  * Modify `src/lib/supabase.ts` to prioritize `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

  * Maintain the fallback to `info.tsx` for compatibility but ensure the environment variables are the primary source.

  * Add logging to confirm which configuration source is being used.

## 2. Enhance Data Fetching with Logging and Error Handling (`src/hooks/useUserProgress.ts`)

* **Current State**: `useUserProgress` silently catches errors and returns default data, making debugging difficult. It lacks the requested `console.log`.

* **Action**:

  * Add an `error` state to the hook to track connection failures.

  * Insert `console.log('Dati recuperati:', data)` immediately after `getUserProgress` calls.

  * Capture and expose errors so they can be displayed in the UI.

## 3. Implement Global Layout and Fix Routing (`src/App.tsx`)

* **Current State**: The app renders views (`Dashboard`, `LessonList`, etc.) directly without wrapping them in the newly created `Layout` component. This causes the menu to be missing.

* **Action**:

  * Import `Layout` from `./components/Layout`.

  * Wrap the main application views (`dashboard`, `lessons`, `simulation`, `leaderboard`, `settings`, `badges`) inside the `<Layout>` component.

  * Ensure `currentView` and `onNavigate` are passed correctly to `Layout`.

  * Connect the "Academy" route to `LessonList` and "Journal" route to `SimulationView` (as per `Layout.tsx` mapping).

## 4. Fix Dashboard and Add Error Feedback (`src/components/Dashboard.tsx`)

* **Current State**: `Dashboard` uses the old `Navigation` component (causing potential double menus or conflicts) and lacks visible error messages.

* **Action**:

  * Remove the `<Navigation />` component usage since the global `Layout` will handle navigation.

  * Consume the new `error` state from `useUserProgress`.

  * Add a visible error alert/banner (e.g., "Errore di connessione a Supabase") if data fetching fails, to make debugging easier for you.

## 5. Verification

* I will verify that the Supabase client initializes with the correct URL.

* I will confirm logs appear in the console.

* I will check that the Sidebar/Menu is visible on Dashboard, Journal, and Academy pages.

* I will ensure the Dashboard shows an error message if the connection is simulated to fail (or if real connection fails).

