# Google OAuth 2.0 Investigation (PostureAI)

## What I reviewed
- `src/pages/Auth.tsx` Google sign-in logic.
- `src/integrations/lovable/index.ts` Lovable cloud OAuth adapter.
- `src/integrations/supabase/client.ts` Supabase auth client config.
- `src/main.tsx` OAuth callback token consumption.

## Primary issue identified
Google OAuth uses **two different providers depending on hostname**:
- localhost -> `supabase.auth.signInWithOAuth(...)`
- non-localhost -> `lovable.auth.signInWithOAuth(...)`

This means production and local auth are running through different systems. Any mismatch in redirect setup, allowed domains, or token handoff behavior between Lovable Cloud Auth and Supabase causes Google OAuth to fail in production while potentially working locally.

### Why this is likely the breakage
1. The production path is selected purely by hostname (`localhost` / `127.0.0.1` check), not by explicit environment config.
2. The production path depends on Lovable Cloud Auth (`createLovableAuth({})`) with no visible project-specific configuration in-repo.
3. Supabase is already configured as the primary auth/session backend everywhere else in app state (`onAuthStateChange`, `getSession`, `setSession`).

In short: the login flow is split-brain. Local and production are not exercising the same OAuth backend.

## Secondary risks I found
1. Redirect URI inconsistency risk:
   - Supabase path uses `redirectTo`.
   - Lovable path uses `redirect_uri`.
   These are similar concepts but implemented by different SDKs/services, increasing configuration drift risk.
2. Callback token parsing in `src/main.tsx` only handles hash tokens (`#access_token=...`). If provider behavior is query-code based in some environments, callback behavior can diverge.

## Fix plan

### Phase 1 — Stabilize OAuth backend (highest priority)
1. Use **one OAuth initiation path** for Google across all environments (prefer Supabase directly in app code).
2. Remove hostname-based auth branching in `handleGoogleSignIn`.
3. Keep one canonical redirect target (e.g., `${window.location.origin}/auth` or dedicated callback route) and configure it in Supabase + Google Console.

### Phase 2 — Normalize callback handling
1. Add (or verify) a dedicated callback route (`/auth/callback`) to centralize OAuth completion.
2. Ensure both hash-token and auth-code redirect responses are handled safely.
3. Keep URL cleanup after token/code exchange to avoid leaking credentials in browser history.

### Phase 3 — Configuration hardening
1. Document exact required redirect URIs in repo (dev + prod).
2. Validate Supabase Auth settings:
   - Site URL
   - Additional redirect URLs
   - Google provider enabled and client credentials set
3. Validate Google Cloud OAuth client:
   - Authorized JavaScript origins
   - Authorized redirect URIs

### Phase 4 — Verification checklist
1. Local: sign in with Google from `/auth` and confirm user lands on `/dashboard`.
2. Production/staging: same flow and outcome.
3. Regression checks:
   - Email/password login still works.
   - Password reset flow still works.
   - Session persists on refresh.

## Recommended implementation order
1. Refactor auth button handler to single Supabase OAuth path.
2. Deploy to staging with corrected redirect settings.
3. Run end-to-end OAuth smoke tests in both localhost and deployed environment.
4. Remove unused Lovable OAuth integration code if no longer needed.
