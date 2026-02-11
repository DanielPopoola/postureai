

# Fix Google OAuth on Localhost

## Problem
The `lovable.auth.signInWithOAuth()` function redirects to `/~oauth/initiate`, a proxy endpoint that only exists on Lovable-hosted domains (`*.lovable.app`). On `localhost`, this route doesn't exist, causing a 404.

## Solution
Update the Google sign-in handler in `src/pages/Auth.tsx` to detect when running on localhost and use the native Supabase OAuth flow directly instead of the Lovable proxy.

- On **localhost**: call `supabase.auth.signInWithOAuth()` which redirects through the standard authentication callback
- On **hosted domains**: continue using `lovable.auth.signInWithOAuth()` as before

## Changes

### 1. Update `src/pages/Auth.tsx`

Modify the `handleGoogleSignIn` function:

```typescript
const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
      // On localhost, use native Supabase OAuth (bypasses Lovable proxy)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } else {
      // On hosted domains, use Lovable managed OAuth proxy
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    }
  } catch (err: any) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};
```

No other files need to change. This ensures the hosted production flow remains untouched while localhost uses the direct OAuth path through your custom Google credentials configured in Lovable Cloud.

## Prerequisites (already done)
- Custom Google OAuth Client ID and Secret added in Lovable Cloud authentication settings
- `http://localhost:8080` in Google Cloud Console's Authorized JavaScript Origins
- `https://yyaxltrttenihnqnfyvv.supabase.co/auth/v1/callback` in Authorized redirect URIs

