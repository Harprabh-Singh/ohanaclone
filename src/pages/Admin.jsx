/* ─────────────────────────────────────────────────────────────────
   OHANA — STUDIO (/admin)
   A real dashboard shell: sidebar nav (Overview / Content / Account),
   overview page with live stats, quick actions and recent activity,
   then one focused view per editable surface of the site:
   menu items, house favourites, gallery frames, menu-book pages, team.

   AUTH — sign-in with two roles:
     owner — everything + can create/remove admin accounts (Team view)
     admin — all content changes, no account management
   Accounts live in ohana/auth.json on Cloudinary (SHA-256 hashed).
───────────────────────────────────────────────────────────────── */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Star, Images, BookOpen, Users,
  LogOut, ExternalLink, Clock, Menu as MenuIcon, X, KeyRound,
  LayoutGrid, ArrowRight, Plus, Zap,
} from 'lucide-react';
import { useContent } from '../content/ContentContext';
import { categoryBookMap } from '../data/menuData';
import {
  uploadImage, isCloudinaryConfigured,
  fetchAuth, publishAuth, hashPassword,
} from '../lib/cloudinary';

/* ─── Tokens (same language as the site) ─── */
const C = {
  bg: '#0B0906',
  panel: '#171208',
  panel2: '#1E1810',
  gold: '#B6912E',
  goldBright: '#D9B45B',
  cream: '#F2E7D0',
  muted: 'rgba(242,231,208,0.68)',
  faint: 'rgba(242,231,208,0.46)',
  hairline: 'rgba(242,231,208,0.16)',
  danger: '#E05A4E',
  ok: '#9DBA7A',
};
const DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const SERIF = "'Instrument Serif', Georgia, serif";
const BODY = "'Work Sans', sans-serif";

const inputStyle = {
  width: '100%', background: 'rgba(242,231,208,0.045)', border: `1px solid ${C.hairline}`,
  borderRadius: '3px', color: C.cream, fontFamily: BODY, fontSize: '13px',
  padding: '10px 12px', outline: 'none', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: '9px', fontWeight: 700, letterSpacing: '0.32em',
  textTransform: 'uppercase', color: C.faint, marginBottom: '6px', fontFamily: BODY,
};
const ghostBtn = {
  background: 'transparent', border: `1px solid rgba(182,145,46,0.45)`, color: C.goldBright,
  fontFamily: BODY, fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
  textTransform: 'uppercase', padding: '9px 14px', borderRadius: '3px', cursor: 'pointer',
};
const dangerBtn = { ...ghostBtn, border: `1px solid rgba(224,90,78,0.4)`, color: C.danger };

const SESSION_KEY = 'ohana-studio-session-v1';
const loadSession = () => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
};
const saveSession = (s) => {
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* private mode */ }
};

/* ─── Activity log (this device) ─── */
const ACT_KEY = 'ohana-studio-activity-v1';
let ACTOR = 'staff';
function getActivity() {
  try { return JSON.parse(localStorage.getItem(ACT_KEY)) || []; } catch { return []; }
}
function logActivity(text) {
  try {
    const arr = getActivity();
    arr.unshift({ text, who: ACTOR, t: Date.now() });
    localStorage.setItem(ACT_KEY, JSON.stringify(arr.slice(0, 30)));
  } catch { /* full/blocked */ }
}
const timeAgo = (t) => {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* Hidden file input + button; uploads to Cloudinary and hands back the URL */
function UploadBtn({ onUrl, notify, label = 'Replace image' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref} type="file" accept="image/*" hidden
        onChange={async (e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true);
          try {
            onUrl(await uploadImage(f));
            logActivity('Uploaded an image');
            notify({ type: 'ok', msg: 'Image uploaded — remember to Publish.' });
          } catch (err) {
            notify({ type: 'err', msg: err.message });
          } finally {
            setBusy(false);
          }
        }}
      />
      <button type="button" style={{ ...ghostBtn, opacity: busy ? 0.55 : 1 }} disabled={busy}
        onClick={() => ref.current && ref.current.click()}>
        {busy ? 'Uploading…' : label}
      </button>
    </>
  );
}

function SectionHead({ num, title, sub }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
        <span style={{ fontFamily: DISPLAY, fontSize: '13px', color: C.gold, letterSpacing: '0.08em' }}>{num}</span>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', color: C.cream, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {sub && <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.muted, fontSize: '15px', margin: '8px 0 0 42px' }}>{sub}</p>}
    </div>
  );
}

function Thumb({ src, ratio = '4 / 3', contain }) {
  return (
    <div style={{
      width: '100%', aspectRatio: ratio, background: '#070501',
      border: `1px solid ${C.hairline}`, borderRadius: '3px', overflow: 'hidden', marginBottom: '10px',
    }}>
      {src
        ? <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.faint, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: BODY }}>No image</div>}
    </div>
  );
}

const MENU_BADGES = [
  ['isVeg', 'Veg'],
  ['isNonVeg', 'Non-veg'],
  ['isSpicy', 'Spicy'],
  ['isNew', 'New'],
  ['isOhanaSpecial', 'Ohana Special'],
  ['containsPork', 'Pork'],
];

/* ═══════════════ VIEW · MENU ITEMS ═══════════════ */
function MenuItemsSection({ content, update, notify }) {
  const cats = content.menu.categories;
  const items = content.menu.items;
  const [filterCat, setFilterCat] = useState('all');
  const [q, setQ] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => (filterCat === 'all' || item.category === filterCat))
      .filter(({ item }) => !needle
        || (item.title || '').toLowerCase().includes(needle)
        || (item.subcategory || '').toLowerCase().includes(needle));
  }, [items, filterCat, q]);

  const patchItem = (idx, patch) => update((next) => { Object.assign(next.menu.items[idx], patch); });

  const addItem = () => {
    const category = filterCat === 'all' ? cats[0].slug : filterCat;
    update((next) => {
      next.menu.items.push({
        category, subcategory: '', title: 'New item', description: '', price: 0, image: '',
      });
    });
    logActivity('Added a menu item');
    notify({ type: 'ok', msg: 'Item added at the end of the list.' });
  };

  const removeItem = (idx) => {
    if (!window.confirm(`Delete “${items[idx].title}”? This cannot be undone.`)) return;
    logActivity(`Deleted “${items[idx].title}”`);
    update((next) => { next.menu.items.splice(idx, 1); });
    setOpenIdx(null);
  };

  return (
    <section>
      <SectionHead num="02" title="Menu items"
        sub={`${items.length} dishes across ${cats.length} categories — names, prices, descriptions, badges, photos.`} />

      {/* Category cards */}
      <details style={{ marginBottom: '26px', border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '14px 16px', background: C.panel }}>
        <summary style={{ cursor: 'pointer', fontFamily: BODY, fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.gold }}>
          Category cards · names, taglines, cover photos
        </summary>
        <div style={{ marginTop: '18px', display: 'grid', gap: '18px' }}>
          {cats.map((cat, ci) => (
            <div key={cat.slug} style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Name">
                  <input style={inputStyle} value={cat.name}
                    onChange={(e) => update((n) => { n.menu.categories[ci].name = e.target.value; })} />
                </Field>
                <Field label="Tagline">
                  <input style={inputStyle} value={cat.tagline}
                    onChange={(e) => update((n) => { n.menu.categories[ci].tagline = e.target.value; })} />
                </Field>
              </div>
              <Field label="Cover image">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={cat.image}
                    onChange={(e) => update((n) => { n.menu.categories[ci].image = e.target.value; })} />
                  <UploadBtn notify={notify} onUrl={(url) => update((n) => { n.menu.categories[ci].image = url; })} />
                </div>
              </Field>
            </div>
          ))}
        </div>
      </details>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          style={{ ...inputStyle, width: 'auto', flex: '1 1 160px' }}>
          <option value="all">All categories</option>
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <input placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 180px' }} />
        <button type="button" style={ghostBtn} onClick={addItem}>+ Add item</button>
      </div>

      {/* Items */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {filtered.map(({ item, idx }) => {
          const open = openIdx === idx;
          return (
            <div key={idx} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', background: open ? C.panel : 'transparent' }}>
              <button type="button" onClick={() => setOpenIdx(open ? null : idx)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: BODY, fontWeight: 600, fontSize: '14px', color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                  <span style={{ display: 'block', fontFamily: BODY, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, marginTop: '3px' }}>
                    {(cats.find((c) => c.slug === item.category) || {}).name || item.category}{item.subcategory ? ` · ${item.subcategory}` : ''}
                  </span>
                </span>
                <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.goldBright, fontSize: '15px', whiteSpace: 'nowrap' }}>₹{item.price}</span>
                <span style={{ color: C.faint, fontSize: '11px', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s' }}>→</span>
              </button>

              {open && (
                <div style={{ padding: '4px 14px 16px', borderTop: `1px solid ${C.hairline}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0 12px', marginTop: '12px' }}>
                    <Field label="Dish name">
                      <input style={inputStyle} value={item.title} onChange={(e) => patchItem(idx, { title: e.target.value })} />
                    </Field>
                    <Field label="Price (number or e.g. 100/120)">
                      <input style={inputStyle} value={String(item.price)}
                        onChange={(e) => {
                          const v = e.target.value;
                          patchItem(idx, { price: /^\d+$/.test(v) ? Number(v) : v });
                        }} />
                    </Field>
                    <Field label="Category">
                      <select style={inputStyle} value={item.category} onChange={(e) => patchItem(idx, { category: e.target.value })}>
                        {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Subcategory (section header)">
                      <input style={inputStyle} value={item.subcategory || ''} list={`subs-${item.category}`}
                        onChange={(e) => patchItem(idx, { subcategory: e.target.value })} />
                      <datalist id={`subs-${item.category}`}>
                        {[...new Set(items.filter((i) => i.category === item.category).map((i) => i.subcategory).filter(Boolean))]
                          .map((s) => <option key={s} value={s} />)}
                      </datalist>
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea style={{ ...inputStyle, minHeight: '64px', resize: 'vertical' }} value={item.description || ''}
                      onChange={(e) => patchItem(idx, { description: e.target.value })} />
                  </Field>
                  <Field label="Badges">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {MENU_BADGES.map(([key, label]) => {
                        const active = !!item[key];
                        return (
                          <button key={key} type="button" onClick={() => patchItem(idx, { [key]: !active })}
                            style={{
                              ...ghostBtn, padding: '7px 11px',
                              border: `1px solid ${active ? C.gold : C.hairline}`,
                              color: active ? C.goldBright : C.faint,
                              background: active ? 'rgba(182,145,46,0.1)' : 'transparent',
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Photo">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input style={{ ...inputStyle, flex: 1 }} value={item.image || ''} placeholder="https://…"
                        onChange={(e) => patchItem(idx, { image: e.target.value })} />
                      <UploadBtn notify={notify} onUrl={(url) => patchItem(idx, { image: url })} />
                    </div>
                  </Field>
                  <button type="button" style={dangerBtn} onClick={() => removeItem(idx)}>Delete item</button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.muted, textAlign: 'center', padding: '30px 0' }}>Nothing matches that search.</p>
        )}
      </div>
    </section>
  );
}

/* ═══════════════ VIEW · HOUSE FAVOURITES ═══════════════ */
function HouseFavsSection({ content, update, notify }) {
  const favs = content.houseFavs;
  const patch = (i, p) => update((n) => { Object.assign(n.houseFavs[i], p); });
  return (
    <section>
      <SectionHead num="03" title="House favourites"
        sub="The pinned showcase on the home page — five signature dishes, full control." />
      <div style={{ display: 'grid', gap: '26px' }}>
        {favs.map((d, i) => (
          <div key={i} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: DISPLAY, fontSize: '12px', color: C.gold }}>{String(i + 1).padStart(2, '0')}</span>
              <button type="button" style={dangerBtn}
                onClick={() => { if (window.confirm(`Remove “${d.name}” from house favourites?`)) { logActivity(`Removed favourite “${d.name}”`); update((n) => { n.houseFavs.splice(i, 1); }); } }}>
                Remove
              </button>
            </div>
            <Thumb src={d.image} ratio="16 / 8" />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={d.image || ''} placeholder="https://…"
                onChange={(e) => patch(i, { image: e.target.value })} />
              <UploadBtn notify={notify} onUrl={(url) => patch(i, { image: url })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0 12px' }}>
              <Field label="Name"><input style={inputStyle} value={d.name} onChange={(e) => patch(i, { name: e.target.value })} /></Field>
              <Field label="Short label"><input style={inputStyle} value={d.short || ''} onChange={(e) => patch(i, { short: e.target.value })} /></Field>
              <Field label="Tagline"><input style={inputStyle} value={d.tagline || ''} onChange={(e) => patch(i, { tagline: e.target.value })} /></Field>
              <Field label="Sub-line"><input style={inputStyle} value={d.sub || ''} onChange={(e) => patch(i, { sub: e.target.value })} /></Field>
              <Field label="Price (number)">
                <input style={inputStyle} value={String(d.price)}
                  onChange={(e) => { const v = e.target.value; patch(i, { price: /^\d+$/.test(v) ? Number(v) : v }); }} />
              </Field>
              <Field label="Tag"><input style={inputStyle} value={d.tag || ''} onChange={(e) => patch(i, { tag: e.target.value })} /></Field>
              <Field label="Accent colour">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={d.accent || '#B6912E'} onChange={(e) => patch(i, { accent: e.target.value })}
                    style={{ width: '42px', height: '38px', padding: 0, border: `1px solid ${C.hairline}`, background: 'none', borderRadius: '3px' }} />
                  <input style={{ ...inputStyle, flex: 1 }} value={d.accent || ''} onChange={(e) => patch(i, { accent: e.target.value })} />
                </div>
              </Field>
              <Field label="Image side">
                <select style={inputStyle} value={d.imgPos || 'right'} onChange={(e) => patch(i, { imgPos: e.target.value })}>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button type="button" style={{ ...ghostBtn, marginTop: '16px' }}
        onClick={() => {
          logActivity('Added a house favourite');
          update((n) => {
            n.houseFavs.push({
              id: n.houseFavs.length, name: 'New favourite', short: 'DISH', tagline: '', sub: '',
              price: 0, tag: 'NEW', accent: '#B6912E', image: '', imgPos: 'right',
            });
          });
        }}>
        + Add favourite
      </button>
    </section>
  );
}

/* ═══════════════ VIEW · GALLERY ═══════════════ */
function GallerySection({ content, update, notify }) {
  const imgs = content.gallery;
  const patch = (i, p) => update((n) => { Object.assign(n.gallery[i], p); });
  return (
    <section>
      <SectionHead num="04" title="Gallery"
        sub={`${imgs.length} frames — swap photos, retitle, or file them under a room.`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {imgs.map((img, i) => (
          <div key={i} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '10px', background: C.panel }}>
            <Thumb src={img.src} ratio="1 / 1" />
            <Field label="Label">
              <input style={inputStyle} value={img.label} onChange={(e) => patch(i, { label: e.target.value })} />
            </Field>
            <Field label="Room">
              <select style={inputStyle} value={img.category} onChange={(e) => patch(i, { category: e.target.value })}>
                <option>Interior</option>
                <option>Terrace</option>
                <option>Food</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <UploadBtn notify={notify} label="Replace" onUrl={(url) => patch(i, { src: url })} />
              <button type="button" style={{ ...dangerBtn, padding: '9px 11px' }}
                onClick={() => { if (window.confirm(`Remove “${img.label}”?`)) { logActivity(`Removed frame “${img.label}”`); update((n) => { n.gallery.splice(i, 1); }); } }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '16px' }}>
        <UploadBtn notify={notify} label="+ Add frame"
          onUrl={(url) => { logActivity('Added a gallery frame'); update((n) => { n.gallery.push({ src: url, label: 'New frame', category: 'Interior' }); }); }} />
      </div>
    </section>
  );
}

/* ═══════════════ VIEW · MENU BOOK ═══════════════ */
function MenuBookSection({ content, update, notify }) {
  const pages = content.menuPages;
  const stats = content.menuStats || [];
  return (
    <section>
      <SectionHead num="05" title="Menu book"
        sub="The printed menu, page by page — replace any spread of the flip book." />

      {/* Menu page hero stats */}
      <div style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel, marginBottom: '30px' }}>
        <div style={{ ...labelStyle, marginBottom: '12px' }}>Menu page hero stats — “8 Categories · 130+ Dishes · 4.8★ …”</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 16px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: '0 10px' }}>
              <Field label={`Value ${i + 1}`}>
                <input style={inputStyle} value={s.n} onChange={(e) => update((n) => { n.menuStats[i].n = e.target.value; })} />
              </Field>
              <Field label="Label">
                <input style={inputStyle} value={s.l} onChange={(e) => update((n) => { n.menuStats[i].l = e.target.value; })} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
        {pages.map((src, i) => (
          <div key={i} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '10px', background: C.panel }}>
            <Thumb src={src} ratio="1 / 1.4" contain />
            <div style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: C.faint, marginBottom: '10px' }}>
              {i === 0 ? 'Cover' : `Page ${i}`}
            </div>
            <UploadBtn notify={notify} label="Replace" onUrl={(url) => { logActivity(`Replaced book ${i === 0 ? 'cover' : `page ${i}`}`); update((n) => { n.menuPages[i] = url; }); }} />
          </div>
        ))}
      </div>
      <p style={{ fontFamily: BODY, fontSize: '11px', color: C.muted, marginTop: '16px', lineHeight: 1.7 }}>
        Keep pages in the same tall portrait format (the current PNG/JPG ratio) so the book flips cleanly.
      </p>
    </section>
  );
}

/* ═══════════════ VIEW · HOME PAGE ═══════════════ */
const priceOfAdmin = (p) => {
  if (typeof p === 'number') return p;
  const m = String(p).match(/\d+/);
  return m ? Number(m[0]) : Infinity;
};

function SubHead({ title, sub }) {
  return (
    <div style={{ margin: '46px 0 18px', borderTop: `1px solid ${C.hairline}`, paddingTop: '26px' }}>
      <h3 style={{ fontFamily: DISPLAY, fontSize: '15px', color: C.goldBright, margin: 0, letterSpacing: '0.04em' }}>{title}</h3>
      {sub && <p style={{ fontFamily: BODY, fontSize: '12px', color: C.muted, margin: '8px 0 0', lineHeight: 1.75, maxWidth: '640px' }}>{sub}</p>}
    </div>
  );
}

function HomePageSection({ content, update, notify }) {
  const cats = content.menu.categories;
  const items = content.menu.items;
  const showcase = content.showcase || [];
  const palate = content.palate || [];
  const story = content.story || { guests: '', rating: '', years: '' };
  const experiences = content.experiences || [];
  const reviews = content.reviews || [];

  const catName = (slug) => (cats.find((c) => c.slug === slug) || {}).name || slug;
  const statsFor = (slug) => {
    const list = items.filter((it) => it.category === slug);
    if (!list.length) return 'no items in this category yet';
    const min = Math.min(...list.map((it) => priceOfAdmin(it.price)));
    return `${list.length} item${list.length === 1 ? '' : 's'} · from ₹${min}`;
  };
  const bookFor = (slug) => categoryBookMap[slug] || { flip: 1, side: 'left' };

  const patchShowcase = (i, p) => update((n) => { Object.assign(n.showcase[i], p); });
  const patchPalate = (i, p) => update((n) => { Object.assign(n.palate[i], p); });
  const patchExp = (i, p) => update((n) => { Object.assign(n.experiences[i], p); });
  const patchReview = (i, p) => update((n) => { Object.assign(n.reviews[i], p); });
  const patchStory = (p) => update((n) => { Object.assign(n.story, p); });

  const disabledInput = { ...inputStyle, opacity: 0.42 };
  const autoNote = {
    fontFamily: BODY, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
    color: C.gold, marginTop: '4px', lineHeight: 1.7,
  };

  return (
    <section>
      <SectionHead num="01" title="Home page"
        sub="Every editable surface of the landing page — the hero menu reel, the spinning category carousel, story numbers, experience panels and guest reviews." />

      {/* ── A · HERO MENU SHOWCASE ── */}
      <SubHead
        title="Hero menu showcase"
        sub="The dish reel right after the hero scroll. Pick a menu subheading per slot — the item count, the “from ₹” price and the menu-book link all follow it automatically. Coffee stays first: it anchors the scroll animation and can't be changed." />
      <div style={{ display: 'grid', gap: '26px' }}>
        {showcase.map((slot, i) => {
          const locked = !!slot.locked;
          const book = slot.categorySlug ? bookFor(slot.categorySlug) : { flip: 7, side: 'left' };
          const auto = slot.categorySlug ? statsFor(slot.categorySlug) : (slot.stats || []).filter(Boolean).join(' · ');
          return (
            <div key={slot.id || i} style={{
              border: `1px solid ${locked ? 'rgba(182,145,46,0.45)' : C.hairline}`,
              borderRadius: '3px', padding: '16px', background: C.panel,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
                <span style={{ fontFamily: DISPLAY, fontSize: '12px', color: C.gold }}>
                  {String(i + 1).padStart(2, '0')} · {slot.name}
                </span>
                {locked && (
                  <span style={{
                    fontFamily: BODY, fontSize: '8px', fontWeight: 700, letterSpacing: '0.26em',
                    textTransform: 'uppercase', color: C.goldBright,
                    border: '1px solid rgba(182,145,46,0.45)', borderRadius: '100px', padding: '5px 11px',
                    whiteSpace: 'nowrap',
                  }}>Locked anchor</span>
                )}
              </div>
              <Thumb src={slot.img} ratio="16 / 8" />
              {!locked && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={slot.img || ''} placeholder="https://…"
                    onChange={(e) => patchShowcase(i, { img: e.target.value })} />
                  <UploadBtn notify={notify} onUrl={(url) => patchShowcase(i, { img: url })} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0 12px' }}>
                <Field label="Menu subheading">
                  {locked
                    ? <input style={disabledInput} value="Coffee (fixed)" disabled readOnly />
                    : (
                      <select
                        style={inputStyle}
                        value={slot.categorySlug || ''}
                        onChange={(e) => {
                          const slug = e.target.value;
                          patchShowcase(i, { categorySlug: slug, name: catName(slug).toUpperCase() });
                        }}
                      >
                        {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    )}
                </Field>
                <Field label="Shown as">
                  <input style={disabledInput} value={slot.name} disabled readOnly />
                </Field>
              </div>
              <Field label="Description">
                <input
                  style={locked ? disabledInput : inputStyle} value={slot.desc || ''}
                  disabled={locked} readOnly={locked}
                  onChange={(e) => patchShowcase(i, { desc: e.target.value })} />
              </Field>
              {!locked && (
                <>
                  <div style={{ ...labelStyle, margin: '4px 0 10px' }}>
                    Mobile dish display — width / height % of the slide, x / y shift %
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: '0 12px' }}>
                    {[
                      ['w', 'Width %', 20, 220],
                      ['h', 'Height %', 20, 220],
                      ['x', 'Shift X %', -100, 100],
                      ['y', 'Shift Y %', -100, 100],
                    ].map(([key, lab, min, max]) => (
                      <Field key={key} label={lab}>
                        <input
                          type="number" min={min} max={max} style={inputStyle}
                          value={String((slot.mob && slot.mob[key] !== undefined ? slot.mob[key] : (key === 'h' ? 118 : key === 'w' ? 100 : 0)))}
                          onChange={(e) => {
                            const v = e.target.value;
                            patchShowcase(i, {
                              mob: {
                                w: 100, h: 118, x: 0, y: 0,
                                ...(slot.mob || {}),
                                [key]: v === '' ? '' : Math.max(min, Math.min(max, Number(v))),
                              },
                            });
                          }} />
                      </Field>
                    ))}
                  </div>
                </>
              )}
              <p style={autoNote}>
                Auto: {auto} — tap opens the book at spread {book.flip} ({book.side} page)
              </p>
            </div>
          );
        })}
      </div>

      {/* ── B · CATEGORY CAROUSEL ── */}
      <SubHead
        title="Category carousel"
        sub="The spinning 3-D wheel (“Our Burgers”, “Our Pizza”…). Swap the photo, title and copy of each card — the Explore button already deep-links to the matching menu page." />
      <div style={{ display: 'grid', gap: '26px' }}>
        {palate.map((slot, i) => (
          <div key={slot.key || i} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: DISPLAY, fontSize: '12px', color: C.gold }}>
                {String(i + 1).padStart(2, '0')} · {slot.title}
              </span>
              <span style={{ fontFamily: BODY, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.faint }}>
                → {catName(slot.categorySlug)}
              </span>
            </div>
            <Thumb src={slot.image} ratio="16 / 9" />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={slot.image || ''} placeholder="https://…"
                onChange={(e) => patchPalate(i, { image: e.target.value })} />
              <UploadBtn notify={notify} onUrl={(url) => patchPalate(i, { image: url })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 12px' }}>
              <Field label="Title"><input style={inputStyle} value={slot.title} onChange={(e) => patchPalate(i, { title: e.target.value })} /></Field>
              <Field label="Kicker"><input style={inputStyle} value={slot.sub || ''} onChange={(e) => patchPalate(i, { sub: e.target.value })} /></Field>
            </div>
            <Field label="Copy">
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', lineHeight: 1.6 }}
                value={slot.copy || ''} onChange={(e) => patchPalate(i, { copy: e.target.value })} />
            </Field>
          </div>
        ))}
      </div>

      {/* ── C · STORY NUMBERS ── */}
      <SubHead
        title="Story numbers"
        sub="The three stats inside “Our Story” — guests served, average rating and years in Jorhat. The rating also feeds the gold badge on the story photo." />
      <div style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0 12px' }}>
          <Field label="Guests (e.g. 2K+)">
            <input style={inputStyle} value={story.guests} onChange={(e) => patchStory({ guests: e.target.value })} />
          </Field>
          <Field label="Rating (e.g. 4.8)">
            <input style={inputStyle} value={story.rating} onChange={(e) => patchStory({ rating: e.target.value })} />
          </Field>
          <Field label="Years in Jorhat (e.g. 3yr)">
            <input style={inputStyle} value={story.years} onChange={(e) => patchStory({ years: e.target.value })} />
          </Field>
        </div>
      </div>

      {/* ── D · EXPERIENCE PANELS ── */}
      <SubHead
        title="Experience panels"
        sub="Terrace Dining, Coffee Moments and the other full-screen panels near the bottom of the home page. A new line in the title splits it across two lines." />
      <div style={{ display: 'grid', gap: '26px' }}>
        {experiences.map((xp, i) => (
          <div key={xp.id || i} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontFamily: DISPLAY, fontSize: '12px', color: C.gold }}>{xp.id || String(i + 1).padStart(2, '0')}</span>
            </div>
            <Thumb src={xp.image} ratio="16 / 9" />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={xp.image || ''} placeholder="https://…"
                onChange={(e) => patchExp(i, { image: e.target.value })} />
              <UploadBtn notify={notify} onUrl={(url) => patchExp(i, { image: url })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 12px' }}>
              <Field label="Title">
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '52px', lineHeight: 1.5 }}
                  value={xp.title} onChange={(e) => patchExp(i, { title: e.target.value })} />
              </Field>
              <Field label="Tag"><input style={inputStyle} value={xp.tag || ''} onChange={(e) => patchExp(i, { tag: e.target.value })} /></Field>
            </div>
            <Field label="Description">
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', lineHeight: 1.6 }}
                value={xp.description || ''} onChange={(e) => patchExp(i, { description: e.target.value })} />
            </Field>
          </div>
        ))}
      </div>

      {/* ── E · GUEST REVIEWS ── */}
      <SubHead
        title="Guest reviews"
        sub="The scrolling review wall — real Google reviews of Ohana. Edit the wording, remove one, or add a new five-star quote." />
      <div style={{ display: 'grid', gap: '26px' }}>
        {reviews.map((r, i) => (
          <div key={i} style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: DISPLAY, fontSize: '12px', color: C.gold }}>{String(i + 1).padStart(2, '0')} · {r.author}</span>
              <button type="button" style={dangerBtn}
                onClick={() => { if (window.confirm(`Remove the review by ${r.author}?`)) { logActivity(`Removed review by ${r.author}`); update((n) => { n.reviews.splice(i, 1); }); } }}>
                Remove
              </button>
            </div>
            <Field label="Quote">
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '84px', lineHeight: 1.6 }}
                value={r.quote} onChange={(e) => patchReview(i, { quote: e.target.value })} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0 12px' }}>
              <Field label="Author"><input style={inputStyle} value={r.author} onChange={(e) => patchReview(i, { author: e.target.value })} /></Field>
              <Field label="Visit note"><input style={inputStyle} value={r.visit || ''} onChange={(e) => patchReview(i, { visit: e.target.value })} /></Field>
              <Field label="Rating">
                <select style={inputStyle} value={r.rating} onChange={(e) => patchReview(i, { rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v} star{v === 1 ? '' : 's'}</option>)}
                </select>
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button type="button" style={{ ...ghostBtn, marginTop: '16px' }}
        onClick={() => {
          logActivity('Added a guest review');
          update((n) => { n.reviews.push({ quote: '', author: 'New guest', visit: 'Google review', rating: 5 }); });
        }}>
        + Add review
      </button>
    </section>
  );
}

/* ═══════════════ VIEW · TEAM (owner only) ═══════════════ */
function TeamSection({ users, session, saveUsers, notify }) {
  const [nu, setNu] = useState('');
  const [np, setNp] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (e) { notify({ type: 'err', msg: e.message }); }
    finally { setBusy(false); }
  };

  const createAdmin = () => run(async () => {
    const uname = nu.trim();
    if (!uname || !np) { notify({ type: 'err', msg: 'Give the new admin a username and a password.' }); return; }
    if (users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
      notify({ type: 'err', msg: `“${uname}” already exists.` }); return;
    }
    const passHash = await hashPassword(uname, np);
    const ok = await saveUsers([...users, { username: uname, role: 'admin', passHash, createdAt: new Date().toISOString() }]);
    if (ok) { setNu(''); setNp(''); logActivity(`Created admin “${uname}”`); notify({ type: 'ok', msg: `Admin “${uname}” created.` }); }
  });

  const removeUser = (uname) => run(async () => {
    if (!window.confirm(`Remove account “${uname}”? They will no longer be able to sign in.`)) return;
    const ok = await saveUsers(users.filter((u) => u.username !== uname));
    if (ok) { logActivity(`Removed account “${uname}”`); notify({ type: 'ok', msg: `“${uname}” removed.` }); }
  });

  return (
    <section>
      <SectionHead num="05" title="Team"
        sub="Owner territory — create admin accounts or retire them." />

      <div style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
        {users.map((u) => (
          <div key={u.username} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '12px 14px', background: C.panel }}>
            <span style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: u.role === 'owner' ? 'rgba(182,145,46,0.18)' : 'rgba(242,231,208,0.06)',
              border: `1px solid ${u.role === 'owner' ? 'rgba(182,145,46,0.5)' : C.hairline}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: DISPLAY, fontSize: '13px', color: u.role === 'owner' ? C.goldBright : C.muted,
            }}>
              {u.username.charAt(0).toUpperCase()}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: BODY, fontWeight: 600, fontSize: '14px', color: C.cream }}>{u.username}</span>
              <span style={{ display: 'block', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: u.role === 'owner' ? C.goldBright : C.faint, marginTop: '3px' }}>
                {u.role}{u.username === session.u ? ' · you' : ''}
              </span>
            </span>
            {u.role !== 'owner' && u.username !== session.u && (
              <button type="button" style={dangerBtn} disabled={busy} onClick={() => removeUser(u.username)}>Remove</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel }}>
        <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.gold, marginBottom: '14px' }}>
          Create an admin
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0 12px' }}>
          <Field label="Username"><input style={inputStyle} value={nu} onChange={(e) => setNu(e.target.value)} autoComplete="off" /></Field>
          <Field label="Password"><input style={inputStyle} type="password" value={np} onChange={(e) => setNp(e.target.value)} autoComplete="new-password" /></Field>
        </div>
        <button type="button" style={ghostBtn} disabled={busy} onClick={createAdmin}>
          {busy ? 'Saving…' : '+ Create admin'}
        </button>
      </div>
    </section>
  );
}

/* ═══════════════ VIEW · MY PASSWORD (all roles) ═══════════════ */
function PasswordSection({ users, session, saveUsers, notify }) {
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);

  const changeOwnPassword = async () => {
    if (!newPw) { notify({ type: 'err', msg: 'Type the new password first.' }); return; }
    setBusy(true);
    try {
      const me = (users || []).find((u) => u.username === session.u);
      if (!me) { notify({ type: 'err', msg: 'Your account was not found.' }); return; }
      const curHash = await hashPassword(me.username, curPw);
      if (curHash !== me.passHash) { notify({ type: 'err', msg: 'Current password is wrong.' }); return; }
      const passHash = await hashPassword(me.username, newPw);
      const ok = await saveUsers(users.map((u) => (u.username === me.username ? { ...u, passHash } : u)));
      if (ok) { setCurPw(''); setNewPw(''); logActivity('Changed password'); notify({ type: 'ok', msg: 'Password updated.' }); }
    } catch (e) {
      notify({ type: 'err', msg: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <SectionHead num="06" title="My password" sub="Change the password you sign in with." />
      <div style={{ border: `1px solid ${C.hairline}`, borderRadius: '3px', padding: '16px', background: C.panel, maxWidth: '520px' }}>
        <Field label="Current password"><input style={inputStyle} type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} autoComplete="current-password" /></Field>
        <Field label="New password"><input style={inputStyle} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" /></Field>
        <button type="button" style={ghostBtn} disabled={busy} onClick={changeOwnPassword}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </div>
    </section>
  );
}

/* ═══════════════ VIEW · DASHBOARD OVERVIEW ═══════════════ */
function StatCard({ icon: Icon, label, value, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="oh-statcard"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
        background: hov && onClick ? C.panel2 : C.panel, border: `1px solid ${hov && onClick ? 'rgba(182,145,46,0.45)' : C.hairline}`,
        borderRadius: '10px', padding: '22px 22px 20px', transition: 'all 0.25s ease',
      }}>
      <span style={{ position: 'absolute', top: 0, left: '22px', right: '22px', height: '1px', background: `linear-gradient(90deg, ${C.gold}, transparent)`, opacity: 0.55, pointerEvents: 'none' }} />
      <Icon size={92} strokeWidth={1} color={C.gold} style={{ position: 'absolute', right: '-16px', bottom: '-16px', opacity: 0.1, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(182,145,46,0.16)', border: '1px solid rgba(182,145,46,0.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={C.goldBright} strokeWidth={2} />
        </span>
        <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.muted }}>{label}</span>
      </div>
      <div className="oh-statnum" style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 2.9rem)', color: C.cream, lineHeight: 1 }}>{value}</div>
    </button>
  );
}

function DashboardHome({ content, users, session, isOwner, go, activity }) {
  const stats = [
    { icon: UtensilsCrossed, label: 'Menu items', value: content.menu.items.length, view: 'menu' },
    { icon: LayoutGrid, label: 'Categories', value: content.menu.categories.length, view: 'menu' },
    { icon: Star, label: 'House favourites', value: content.houseFavs.length, view: 'favs' },
    { icon: Images, label: 'Gallery frames', value: content.gallery.length, view: 'gallery' },
    { icon: BookOpen, label: 'Book pages', value: content.menuPages.length, view: 'book' },
    { icon: Users, label: 'Team members', value: users ? users.length : '—', view: isOwner ? 'team' : null },
  ];
  const actions = [
    { icon: Plus, label: 'Add a menu item', view: 'menu' },
    { icon: Images, label: 'Add a gallery frame', view: 'gallery' },
    { icon: Star, label: 'Edit house favourites', view: 'favs' },
    { icon: BookOpen, label: 'Replace a book page', view: 'book' },
    ...(isOwner ? [{ icon: Users, label: 'Manage the team', view: 'team' }] : []),
  ];

  return (
    <div>
      {/* Hero card */}
      <div style={{
        position: 'relative', overflow: 'hidden', background: C.panel, border: `1px solid ${C.hairline}`,
        borderRadius: '12px', padding: 'clamp(26px, 5vw, 44px)', marginBottom: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-6%', width: '340px', height: '180%',
          background: 'radial-gradient(ellipse, rgba(182,145,46,0.16) 0%, transparent 65%)', pointerEvents: 'none',
        }} />
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: `linear-gradient(${C.goldBright}, ${C.gold})`, pointerEvents: 'none' }} />
        <div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.7rem, 5vw, 2.6rem)', color: C.cream, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
            Dashboard Overview
          </h1>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.muted, fontSize: 'clamp(14px, 2.5vw, 17px)', margin: 0 }}>
            Welcome back, {session.u} — here's what's on the pass at Ohana.
          </p>
        </div>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
          border: `1px solid rgba(182,145,46,0.45)`, color: C.goldBright, borderRadius: '8px',
          fontFamily: BODY, fontSize: '10px', fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase',
          padding: '13px 18px', background: 'rgba(182,145,46,0.06)', whiteSpace: 'nowrap',
        }}>
          View Live Site <ExternalLink size={13} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="oh-stats">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} onClick={s.view ? () => go(s.view) : undefined} />
        ))}
      </div>

      {/* Quick actions + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
        <div style={{ background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: '12px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Zap size={15} color={C.goldBright} />
            <span style={{ fontFamily: DISPLAY, fontSize: '15px', color: C.cream }}>Quick Actions</span>
          </div>
          <div className="oh-actions">
            {actions.map((a) => (
              <button key={a.label} type="button" onClick={() => go(a.view)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', cursor: 'pointer',
                  background: C.panel2, border: `1px solid ${C.hairline}`, borderRadius: '8px', padding: '14px',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(182,145,46,0.45)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.hairline)}>
                <span style={{
                  width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(182,145,46,0.12)', border: '1px solid rgba(182,145,46,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <a.icon size={14} color={C.goldBright} />
                </span>
                <span style={{ flex: 1, fontFamily: BODY, fontSize: '12px', fontWeight: 600, color: C.cream }}>{a.label}</span>
                <ArrowRight size={13} color={C.faint} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: '12px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Clock size={15} color={C.goldBright} />
            <span style={{ fontFamily: DISPLAY, fontSize: '15px', color: C.cream }}>Recent Activity</span>
          </div>
          {activity.length === 0 ? (
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.muted, fontSize: '14px', margin: 0 }}>
              Nothing yet — edits, uploads and publishes will appear here.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '4px' }}>
              {activity.slice(0, 8).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', padding: '8px 0', borderBottom: i < 7 ? `1px solid ${C.hairline}` : 'none' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.gold, flexShrink: 0, transform: 'translateY(-2px)' }} />
                  <span style={{ flex: 1, fontFamily: BODY, fontSize: '12px', color: C.cream, lineHeight: 1.5 }}>{a.text}</span>
                  <span style={{ fontFamily: BODY, fontSize: '10px', color: C.faint, whiteSpace: 'nowrap' }}>{a.who} · {timeAgo(a.t)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ AUTH SCREENS ═══════════════ */
function AuthShell({ children, title, sub }) {
  return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '340px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '26px' }}>
          <span style={{ width: '30px', height: '1px', background: C.gold }} />
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.5em', textTransform: 'uppercase', color: C.gold, fontFamily: BODY }}>Ohana Studio</span>
          <span style={{ width: '30px', height: '1px', background: C.gold }} />
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: '2rem', color: C.cream, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h1>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: C.muted, fontSize: '15px', margin: '0 0 28px' }}>{sub}</p>
        {children}
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [phase, setPhase] = useState('loading'); /* loading | setup | signin | error */
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');

  useEffect(() => {
    let live = true;
    fetchAuth().then((data) => {
      if (!live) return;
      if (data && Array.isArray(data.users) && data.users.length) {
        setUsers(data.users);
        setPhase('signin');
      } else if (!isCloudinaryConfigured()) {
        setPhase('error');
        setErr('Cloudinary is not configured — set cloud name + preset in src/lib/cloudinary.js.');
      } else {
        setPhase('setup');
      }
    });
    return () => { live = false; };
  }, []);

  const enter = (user, allUsers) => {
    const session = { u: user.username, r: user.role, t: Date.now() };
    saveSession(session);
    onAuth(session, allUsers);
  };

  const doSetup = async (e) => {
    e.preventDefault();
    const uname = f1.trim();
    if (!uname || !f2) { setErr('Pick a username and a password.'); return; }
    if (f2 !== f3) { setErr('Passwords do not match.'); return; }
    setBusy(true); setErr('');
    try {
      const passHash = await hashPassword(uname, f2);
      const newUsers = [{ username: uname, role: 'owner', passHash, createdAt: new Date().toISOString() }];
      await publishAuth(newUsers);
      enter(newUsers[0], newUsers);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const doSignin = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const uname = f1.trim().toLowerCase();
      const user = (users || []).find((u) => u.username.toLowerCase() === uname);
      const passHash = await hashPassword(f1, f2);
      if (!user || user.passHash !== passHash) { setErr('Wrong username or password.'); return; }
      enter(user, users);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'loading') {
    return (
      <AuthShell title="One moment." sub="Reaching the studio…">
        <p style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading…</p>
      </AuthShell>
    );
  }

  if (phase === 'setup') {
    return (
      <AuthShell title="First key." sub="No accounts yet — create the owner account.">
        <form onSubmit={doSetup} style={{ textAlign: 'left' }}>
          <Field label="Owner username"><input style={inputStyle} value={f1} onChange={(e) => setF1(e.target.value)} autoFocus autoComplete="username" /></Field>
          <Field label="Password"><input style={inputStyle} type="password" value={f2} onChange={(e) => setF2(e.target.value)} autoComplete="new-password" /></Field>
          <Field label="Repeat password"><input style={inputStyle} type="password" value={f3} onChange={(e) => setF3(e.target.value)} autoComplete="new-password" /></Field>
          {err && <p style={{ color: C.danger, fontSize: '11px', fontFamily: BODY, margin: '0 0 12px', textAlign: 'center' }}>{err}</p>}
          <button type="submit" disabled={busy} style={{ ...ghostBtn, width: '100%', padding: '13px' }}>
            {busy ? 'Creating…' : 'Create owner account'}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Private door." sub="Staff only beyond this point.">
      <form onSubmit={doSignin} style={{ textAlign: 'left' }}>
        <Field label="Username"><input style={inputStyle} value={f1} onChange={(e) => setF1(e.target.value)} autoFocus autoComplete="username" /></Field>
        <Field label="Password"><input style={inputStyle} type="password" value={f2} onChange={(e) => setF2(e.target.value)} autoComplete="current-password" /></Field>
        {err && <p style={{ color: C.danger, fontSize: '11px', fontFamily: BODY, margin: '0 0 12px', textAlign: 'center' }}>{err}</p>}
        <button type="submit" disabled={busy} style={{ ...ghostBtn, width: '100%', padding: '13px' }}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>
      </form>
      <p style={{ color: C.faint, fontSize: '9px', fontFamily: BODY, marginTop: '26px', letterSpacing: '0.12em', lineHeight: 1.7, textAlign: 'center' }}>
        Passwords are stored hashed on your own Cloudinary. Still a light lock — don't share this link casually.
      </p>
    </AuthShell>
  );
}

/* ═══════════════ SIDEBAR ═══════════════ */
function NavItem({ icon: Icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 14px 11px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(182,145,46,0.1)' : hov ? 'rgba(242,231,208,0.04)' : 'transparent',
        borderRadius: '8px', transition: 'background 0.2s',
      }}>
      {active && (
        <span style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '2px', background: `linear-gradient(${C.goldBright}, ${C.gold})` }} />
      )}
      <Icon size={15} strokeWidth={2} color={active ? C.goldBright : C.faint} />
      <span style={{
        fontFamily: BODY, fontSize: '12.5px', letterSpacing: '0.02em',
        fontWeight: active ? 700 : 500, color: active ? C.cream : C.muted,
      }}>
        {label}
      </span>
    </button>
  );
}

function Sidebar({ session, isOwner, view, go, onSignOut, onClose, open }) {
  const groups = [
    { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      label: 'Content',
      items: [
        { id: 'home', label: 'Home Page', icon: LayoutGrid },
        { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
        { id: 'favs', label: 'House Favourites', icon: Star },
        { id: 'gallery', label: 'Gallery', icon: Images },
        { id: 'book', label: 'Menu Book', icon: BookOpen },
      ],
    },
    {
      label: 'Account',
      items: [
        ...(isOwner ? [{ id: 'team', label: 'Team', icon: Users }] : []),
        { id: 'account', label: 'My Password', icon: KeyRound },
      ],
    },
  ];

  return (
    <aside className={open ? 'oh-sidebar open' : 'oh-sidebar'} style={{ background: C.panel }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px 20px', borderBottom: `1px solid ${C.hairline}` }}>
        <span style={{
          width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.goldBright}, ${C.gold})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: DISPLAY, fontSize: '15px', color: '#120A03',
        }}>O</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: '14px', color: C.cream, letterSpacing: '0.03em' }}>Ohana Cafe</div>
          <div style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.gold, marginTop: '3px' }}>Studio Panel</div>
        </div>
        <button type="button" className="oh-sideclose" onClick={onClose}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
          <X size={16} color={C.muted} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        {groups.map((g) => (
          <div key={g.label} style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.34em', textTransform: 'uppercase', color: C.faint, padding: '0 20px 8px' }}>
              {g.label}
            </div>
            <div style={{ display: 'grid', gap: '2px' }}>
              {g.items.map((it) => (
                <NavItem key={it.id} icon={it.icon} label={it.label} active={view === it.id} onClick={() => go(it.id)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + sign out */}
      <div style={{ borderTop: `1px solid ${C.hairline}`, padding: '14px 12px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '6px 8px 12px' }}>
          <span style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(182,145,46,0.15)', border: `1px solid rgba(182,145,46,0.45)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY, fontSize: '14px', color: C.goldBright,
          }}>
            {session.u.charAt(0).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: '13px', color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.u}</div>
            <div style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: isOwner ? C.goldBright : C.faint, marginTop: '2px' }}>{session.r}</div>
          </div>
        </div>
        <button type="button" onClick={onSignOut}
          style={{ ...ghostBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: `1px solid ${C.hairline}`, color: C.muted }}>
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════ ADMIN ═══════════════ */
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  home: 'Home Page',
  menu: 'Menu Items',
  favs: 'House Favourites',
  gallery: 'Gallery',
  book: 'Menu Book',
  team: 'Team',
  account: 'My Password',
};

export default function Admin() {
  const ctx = useContent();
  const [session, setSession] = useState(loadSession);
  const [users, setUsers] = useState(null);
  const [view, setView] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const [activity, setActivity] = useState(getActivity);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = (t) => {
    setToast(t);
    setActivity(getActivity());
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), t.type === 'err' ? 6000 : 3600);
  };

  const go = (v) => {
    setView(v);
    setSideOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    document.body.style.backgroundColor = C.bg;
    document.documentElement.style.backgroundColor = C.bg;
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      clearTimeout(toastTimer.current);
    };
  }, []);

  /* Refresh accounts once signed in (for Team / Password views) */
  useEffect(() => {
    if (!session) return;
    fetchAuth().then((data) => {
      if (data && Array.isArray(data.users)) setUsers(data.users);
    });
  }, [session]);

  if (!ctx) return null;
  if (!session) {
    return <AuthScreen onAuth={(s, u) => {
      ACTOR = s.u;
      logActivity('Signed in');
      setSession(s);
      setUsers(u);
    }} />;
  }
  ACTOR = session.u;

  const { content, setContent, dirty, publish, publishing, remoteStatus, resetToDefaults, lastPublishedAt } = ctx;
  const update = (fn) => setContent((prev) => {
    const next = structuredClone(prev);
    fn(next);
    return next;
  });

  /* Publish account changes immediately (separate from site content) */
  const saveUsers = async (newUsers) => {
    const r = await publishAuth(newUsers);
    setUsers(newUsers);
    return true;
  };

  const signOut = () => {
    logActivity('Signed out');
    saveSession(null);
    setSession(null);
  };

  const onPublish = async () => {
    try {
      const r = await publish();
      logActivity('Published site content');
      notify({ type: 'ok', msg: (r && r.warning) || 'Published — the live site now serves this version.' });
    } catch (e) {
      notify({ type: 'err', msg: e.message });
    }
  };

  const configured = isCloudinaryConfigured();
  const isOwner = session.r === 'owner';
  const statusColor = { live: C.ok, loading: C.goldBright, offline: C.danger, unconfigured: C.danger, idle: C.faint }[remoteStatus] || C.faint;
  const statusText = {
    live: 'Cloud connected', loading: 'Connecting…', offline: 'Bundled defaults',
    unconfigured: 'Cloud not configured', idle: '…',
  }[remoteStatus] || remoteStatus;

  return (
    <div className="oh-admin" style={{ minHeight: '100svh', background: C.bg, color: C.cream, fontFamily: BODY }}>
      <style>{`
        .oh-sidebar { position: fixed; inset: 0 auto 0 0; width: 252px; z-index: 70;
          display: flex; flex-direction: column; border-right: 1px solid ${C.hairline};
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1); }
        .oh-main { margin-left: 252px; min-height: 100svh; }
        .oh-backdrop { display: none; }
        .oh-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; margin-bottom: 22px; }
        .oh-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
        @media (max-width: 899px) {
          .oh-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
          .oh-statcard { padding: 16px 14px 14px !important; }
          .oh-statnum { font-size: 1.85rem !important; }
          .oh-actions { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 370px) {
          .oh-statnum { font-size: 1.55rem !important; }
        }
        @media (max-width: 899px) {
          .oh-sidebar { transform: translateX(-105%); box-shadow: none; }
          .oh-sidebar.open { transform: none; box-shadow: 60px 0 140px rgba(0,0,0,0.65); }
          .oh-sidebar.open .oh-sideclose { display: block !important; }
          .oh-main { margin-left: 0; }
          .oh-backdrop.on { display: block; position: fixed; inset: 0; z-index: 65;
            background: rgba(5,3,1,0.6); backdrop-filter: blur(2px); border: 0; padding: 0; }
          .oh-burger { display: inline-flex !important; }
          .oh-statustext { display: none; }
        }
      `}</style>

      <Sidebar session={session} isOwner={isOwner} view={view} go={go} onSignOut={signOut} onClose={() => setSideOpen(false)} open={sideOpen} />
      <button type="button" aria-label="Close menu" className={`oh-backdrop ${sideOpen ? 'on' : ''}`} onClick={() => setSideOpen(false)} />

      <div className="oh-main">
        {/* ── Top bar ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,9,6,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.hairline}`,
        }}>
          <div style={{ padding: '13px clamp(16px, 3vw, 32px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" className="oh-burger" onClick={() => setSideOpen(true)}
              style={{ display: 'none', background: 'none', border: `1px solid ${C.hairline}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', alignItems: 'center' }}>
              <MenuIcon size={16} color={C.goldBright} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: '14px', letterSpacing: '0.04em', color: C.cream, whiteSpace: 'nowrap' }}>
                {VIEW_TITLES[view]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                <span className="oh-statustext" style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.faint }}>{statusText}</span>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            {dirty && (
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.goldBright, whiteSpace: 'nowrap' }}>
                ● Unpublished
              </span>
            )}
            <button type="button" onClick={onPublish} disabled={publishing}
              style={{
                background: publishing ? 'rgba(182,145,46,0.4)' : `linear-gradient(135deg, ${C.goldBright}, ${C.gold})`,
                color: '#120A03', border: 'none', borderRadius: '8px', cursor: publishing ? 'default' : 'pointer',
                fontFamily: BODY, fontSize: '10px', fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase',
                padding: '12px 20px', whiteSpace: 'nowrap',
              }}>
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: 'clamp(20px, 3.5vw, 36px) clamp(16px, 3vw, 32px) 120px', maxWidth: '1180px' }}>
          {!configured && (
            <div style={{ border: `1px solid rgba(224,90,78,0.45)`, background: 'rgba(224,90,78,0.07)', borderRadius: '8px', padding: '16px 18px', marginBottom: '26px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase', color: C.danger, marginBottom: '8px' }}>
                Cloudinary not connected
              </div>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.8, color: C.muted }}>
                Edits work in this browser session only. To save permanently, set your cloud name and unsigned
                upload preset in <code style={{ color: C.goldBright }}>src/lib/cloudinary.js</code>, then Publish.
              </p>
            </div>
          )}

          {view === 'dashboard' && (
            <DashboardHome content={content} users={users} session={session} isOwner={isOwner} go={go} activity={activity} />
          )}
          {view === 'home' && <HomePageSection content={content} update={update} notify={notify} />}
          {view === 'menu' && <MenuItemsSection content={content} update={update} notify={notify} />}
          {view === 'favs' && <HouseFavsSection content={content} update={update} notify={notify} />}
          {view === 'gallery' && <GallerySection content={content} update={update} notify={notify} />}
          {view === 'book' && <MenuBookSection content={content} update={update} notify={notify} />}
          {view === 'team' && isOwner && users && (
            <TeamSection users={users} session={session} saveUsers={saveUsers} notify={notify} />
          )}
          {view === 'account' && (
            <PasswordSection users={users} session={session} saveUsers={saveUsers} notify={notify} />
          )}

          <div style={{ height: '1px', background: C.hairline, margin: '70px 0 22px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.faint }}>
              {lastPublishedAt ? `Last published ${new Date(lastPublishedAt).toLocaleTimeString()}` : 'Not published yet this session'}
            </span>
            <button type="button" style={{ ...ghostBtn, border: `1px solid ${C.hairline}`, color: C.faint }}
              onClick={() => { if (window.confirm('Reset everything back to the bundled defaults? Unpublished edits will be lost.')) { logActivity('Reset to defaults'); resetToDefaults(); notify({ type: 'ok', msg: 'Reset to defaults — Publish to make it live.' }); } }}>
              Reset to defaults
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', left: '50%', bottom: '26px', transform: 'translateX(-50%)', zIndex: 100,
          maxWidth: 'min(92vw, 480px)', padding: '13px 18px', borderRadius: '8px',
          background: '#161208', border: `1px solid ${toast.type === 'err' ? 'rgba(224,90,78,0.5)' : 'rgba(182,145,46,0.5)'}`,
          color: toast.type === 'err' ? C.danger : C.cream, fontFamily: BODY, fontSize: '12px', lineHeight: 1.6,
          boxShadow: '0 18px 50px rgba(0,0,0,0.6)',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
