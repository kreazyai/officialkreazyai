/**
 * Official Google Identity Services (GIS) & OAuth 2.0 Web Authentication
 * 
 * Provides native Google-hosted account selection (prompt: 'select_account').
 * Automatically shows all Google accounts signed in on the user's phone or computer.
 */

let gisScriptPromise = null;

/**
 * Validates if a given client ID is a genuine configured Google OAuth 2.0 Web Client ID.
 */
export function hasValidGoogleClientId(clientId) {
  const id = (clientId || import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();
  if (!id) return false;
  // A genuine Google OAuth 2.0 Client ID ends in .apps.googleusercontent.com and is not a placeholder
  if (
    id.includes('kreazyai.apps.googleusercontent.com') ||
    id.includes('your-google-client-id') ||
    !id.endsWith('.apps.googleusercontent.com')
  ) {
    return false;
  }
  return true;
}

export function loadGoogleGisScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);

  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve) => {
    // Check if script already exists in document
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      if (window.google) resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(window.google);
    };
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load, falling back to direct OAuth redirection.');
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

/**
 * Triggers the official native Google Account Chooser popup or redirect.
 * If VITE_GOOGLE_CLIENT_ID is not configured with a valid Google Cloud Client ID,
 * it immediately triggers onError so callers can present the in-app Google modal
 * instead of popping up Google's "401: invalid_client / OAuth client was not found" error.
 */
export async function triggerGoogleNativeAuth({
  clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID,
  storeName = '',
  onSuccess,
  onError
}) {
  try {
    if (!hasValidGoogleClientId(clientId)) {
      const err = new Error(
        'VITE_GOOGLE_CLIENT_ID is not configured. Falling back to the in-app Google verification hub.'
      );
      err.code = 'OAUTH_CLIENT_NOT_CONFIGURED';
      if (onError) onError(err);
      return;
    }

    const google = await loadGoogleGisScript();

    if (google?.accounts?.oauth2) {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account', // Forces Google to show all signed-in accounts
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (onError) onError(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          try {
            // Fetch verified profile from official Google userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await res.json();

            if (onSuccess) {
              onSuccess({
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                googleId: profile.sub,
                credential: tokenResponse.access_token,
                storeName: storeName || (profile.name ? `${profile.name.split(' ')[0]}'s Store` : 'My Store')
              });
            }
          } catch (fetchErr) {
            if (onError) onError(fetchErr);
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    // Direct Google OAuth URL redirect fallback
    const redirectUri = window.location.origin + (window.location.pathname.includes('/register') ? '/register' : '/login');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20profile%20email&prompt=select_account&nonce=${Date.now()}`;
    
    // Open in standard popup
    const popup = window.open(authUrl, 'Google_Account_Chooser', 'width=520,height=640,status=no,toolbar=no,menubar=no,location=no');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = authUrl;
    }
  } catch (err) {
    if (onError) onError(err);
  }
}
