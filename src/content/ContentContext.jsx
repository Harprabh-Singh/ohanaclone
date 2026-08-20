/* ─────────────────────────────────────────────────────────────────
   CONTENT STORE
   • Renders bundled defaults instantly (no flash).
   • Re-hydrates from localStorage cache, then from Cloudinary
     (content.json) when configured.
   • /admin edits call setContent (marks dirty) and publish() pushes the
     whole object back to Cloudinary.
───────────────────────────────────────────────────────────────── */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { defaultContent } from './defaults';
import { fetchContent, publishContent, isCloudinaryConfigured } from '../lib/cloudinary';

const ContentContext = createContext(null);
const CACHE_KEY = 'ohana-content-cache-v1';

/* Older published snapshots (v1) lack the newer editable surfaces
   (showcase, palate, story, experiences, reviews, menuStats). Merge any
   incoming snapshot over the bundled defaults so those keys always exist.
   Also heals showcase slots: local build/dev asset paths (/src/… or
   /assets/…) baked into an early publish are swapped back to the stable
   public defaults, and every slot gains its mobile display settings. */
function sanitizeShowcase(slots) {
  const source = (Array.isArray(slots) && slots.length) ? slots : defaultContent.showcase;
  return source.map((slot, i) => {
    const def = defaultContent.showcase[i] || {};
    const brokenLocal = typeof slot.img === 'string' && /^\/(src|assets)\//.test(slot.img);
    return {
      ...def,
      ...slot,
      img: brokenLocal || !slot.img ? def.img || slot.img : slot.img,
      mob: { ...(def.mob || { w: 100, h: 118, x: 0, y: 0 }), ...(slot.mob || {}) },
    };
  });
}

function mergeWithDefaults(snapshot) {
  if (!snapshot || !snapshot.version) return null;
  const merged = {
    ...defaultContent,
    ...snapshot,
    menu: { ...defaultContent.menu, ...(snapshot.menu || {}) },
  };
  merged.showcase = sanitizeShowcase(snapshot.showcase);
  return merged;
}

export function ContentProvider({ children }) {
  const [content, setContentState] = useState(defaultContent);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState(null);
  /* idle | loading | live | offline | unconfigured */
  const [remoteStatus, setRemoteStatus] = useState('idle');
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const merged = mergeWithDefaults(JSON.parse(cached));
        if (merged) setContentState(merged);
      }
    } catch { /* ignore corrupt cache */ }

    if (!isCloudinaryConfigured()) {
      setRemoteStatus('unconfigured');
      return;
    }
    setRemoteStatus('loading');
    fetchContent().then((remote) => {
      const merged = mergeWithDefaults(remote);
      if (merged) {
        setContentState(merged);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch { /* full */ }
        setRemoteStatus('live');
      } else {
        setRemoteStatus('offline');
      }
    });
  }, []);

  const setContent = useCallback((updater) => {
    setContentState((prev) => (typeof updater === 'function' ? updater(prev) : updater));
    setDirty(true);
  }, []);

  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      const result = await publishContent(contentRef.current);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(contentRef.current)); } catch { /* full */ }
      setDirty(false);
      setLastPublishedAt(Date.now());
      return result;
    } finally {
      setPublishing(false);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setContentState(defaultContent);
    setDirty(true);
  }, []);

  const value = {
    content,
    setContent,
    dirty,
    publish,
    publishing,
    lastPublishedAt,
    remoteStatus,
    resetToDefaults,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/* Safe hook — returns null outside the provider instead of throwing,
   so components keep working with their bundled fallbacks. */
export function useContent() {
  return useContext(ContentContext);
}
