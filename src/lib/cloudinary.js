/* ─────────────────────────────────────────────────────────────────
   CLOUDINARY CONTENT STORE
   ─────────────────────────────────────────────────────────────────
   HOW IT WORKS
   • Images upload straight from the browser via the UNSIGNED preset
     `ohana10` (no API secret in the browser — never add one).
   • Two raw assets act as the "database":
       ohana/content.json — everything editable on the site
       ohana/auth.json    — studio accounts (hashed passwords, roles)
   • The public site fetches content.json on load and falls back to the
     bundled defaults when it is missing/unreachable.

   NOTE: unsigned presets can no longer overwrite assets at all
   (Cloudinary blocks it), so publishing NEVER reuses a public_id:
   every publish uploads a new versioned file tagged `ohana-content`
   (or `ohana-auth`), and readers pick the newest one via the tag list
   endpoint. That endpoint must be allowed once in the console:
   Settings → Security → Restricted media types → uncheck "List".
   Until then, the site keeps serving the fixed seed file
   (ohana/content.json) so nothing ever breaks.
───────────────────────────────────────────────────────────────── */
export const CLOUDINARY_CONFIG = {
  cloudName: 'dy7r3b4xb',
  uploadPreset: 'ohana10',
  folder: 'ohana',
};

export function isCloudinaryConfigured() {
  return !!(
    CLOUDINARY_CONFIG.cloudName &&
    CLOUDINARY_CONFIG.uploadPreset
  );
}

function assertConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured yet — set cloud name + upload preset in src/lib/cloudinary.js');
  }
}

/* ── Images ─────────────────────────────────────────────────────── */

/* Upload one image file. Returns the secure HTTPS URL. */
export async function uploadImage(file) {
  assertConfigured();
  const { cloudName, uploadPreset, folder } = CLOUDINARY_CONFIG;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', uploadPreset);
  fd.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || `Image upload failed (${res.status})`);
  }
  return json.secure_url;
}

/* ── Raw JSON assets (the "database") ───────────────────────────── */

const TAGS = { content: 'ohana-content', auth: 'ohana-auth' };
const LEGACY_IDS = { content: 'ohana/content.json', auth: 'ohana/auth.json' };

const LIST_DISABLED_MSG =
  'Cloudinary blocked the publish lookup: the "List" delivery type is restricted on this account. ' +
  'One-time fix: Cloudinary Console → Settings (⚙) → Security → "Restricted media types" → ' +
  'uncheck "List" → Save, then Publish again.';

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json && typeof json === 'object' ? json : null;
  } catch {
    return null;
  }
}

/* Newest versioned asset for a kind, via the tag list endpoint.
   Returns { public_id, version } or null. Throws LIST_DISABLED_MSG. */
async function latestVersion(kind) {
  const { cloudName } = CLOUDINARY_CONFIG;
  const res = await fetch(
    `https://res.cloudinary.com/${cloudName}/raw/list/${TAGS[kind]}.json?v=${Date.now()}`,
    { cache: 'no-store' }
  );
  if (res.status === 401 || res.status === 403) throw new Error(LIST_DISABLED_MSG);
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const resources = (json && Array.isArray(json.resources)) ? json.resources : [];
  if (!resources.length) return null;
  return resources.sort((a, b) => (b.version || 0) - (a.version || 0))[0];
}

/* Fetch the latest published snapshot: versioned tag lookup first,
   the fixed seed file as fallback (so the site works before the first
   successful publish and while List is still restricted). */
async function fetchLatest(kind) {
  if (!isCloudinaryConfigured()) return null;
  try {
    const latest = await latestVersion(kind);
    if (latest) {
      const json = await fetchJson(
        `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/v${latest.version}/${latest.public_id}?v=${Date.now()}`
      );
      if (json) return json;
    }
  } catch (e) {
    if (e.message === LIST_DISABLED_MSG) {
      /* List still restricted — silently fall back to the fixed seed
         file so readers keep working; publishing reports the fix. */
    }
  }
  return fetchJson(
    `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/${LEGACY_IDS[kind]}?v=${Date.now()}`
  );
}

/* Upload a new versioned snapshot, then verify it is discoverable.
   Never overwrites — works fully within unsigned-upload rules. */
async function publishVersioned(kind, obj) {
  assertConfigured();
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;
  const publicId = `ohana/versions/${kind}-${Date.now()}`;

  const fd = new FormData();
  fd.append('file', new Blob([JSON.stringify(obj)], { type: 'application/json' }), `${kind}.json`);
  fd.append('upload_preset', uploadPreset);
  fd.append('resource_type', 'raw');
  fd.append('public_id', publicId);
  fd.append('tags', TAGS[kind]);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || `Publish failed (${res.status})`);
  }

  /* Verify the new version is discoverable by readers. Cloudinary caches
     the tag index for up to ~60s, so this is a short grace window, not a
     hard gate: if it doesn't show in time the publish STILL succeeded and
     readers pick it up on the next index refresh — report a warning. */
  const matches = (pid) => String(pid || '').replace(/\.json$/i, '') === publicId;
  for (let attempt = 0; attempt < 6; attempt++) {
    await new Promise((r) => setTimeout(r, 1500));
    const latest = await latestVersion(kind); // throws LIST_DISABLED_MSG
    if (latest && matches(latest.public_id)) {
      return { ok: true, url: json.secure_url, warning: null };
    }
  }
  return {
    ok: true,
    url: json.secure_url,
    warning:
      'Published. Cloudinary caches the version index for up to a minute, ' +
      'so the change may take ~1 min to appear for everyone.',
  };
}

/* Site content */
export function fetchContent() {
  return fetchLatest('content');
}
export function publishContent(content) {
  return publishVersioned('content', {
    ...content,
    publishedAt: new Date().toISOString(),
  });
}

/* Studio accounts */
export function fetchAuth() {
  return fetchLatest('auth');
}
export function publishAuth(users) {
  return publishVersioned('auth', {
    version: 1,
    users,
    updatedAt: new Date().toISOString(),
  });
}

/* ── Password hashing (SHA-256, salted with username) ─────────────
   Lightweight client-side gate — see the honest caveat in /admin. */
export async function hashPassword(username, password) {
  const msg = `ohana-studio::${String(username).trim().toLowerCase()}::${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  /* Non-secure-context fallback (not cryptographic) */
  let h = 5381;
  for (let i = 0; i < msg.length; i++) h = ((h << 5) + h + msg.charCodeAt(i)) >>> 0;
  return 'weak-' + h.toString(16);
}
