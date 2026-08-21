import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Lenis from 'lenis';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Design tokens (shared with About) ─────────────────────── */
const C = {
  bg: '#0B0906',
  bg2: '#121009',
  bg3: '#0E0C08',
  gold: '#B6912E',
  goldBright: '#D9B45B',
  cream: '#F2E7D0',
  muted: 'rgba(242,231,208,0.55)',
  faint: 'rgba(242,231,208,0.28)',
  hairline: 'rgba(242,231,208,0.12)',
};
const DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const SERIF = "'Instrument Serif', Georgia, serif";
const BODY = "'Work Sans', sans-serif";

const IMG = {
  hero: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1600&q=80',
  interlude: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
};

const GoldLabel = ({ children, center = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: center ? 'center' : 'flex-start' }}>
    <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />
    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: C.gold, whiteSpace: 'nowrap' }}>{children}</span>
    {center && <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />}
  </div>
);

const pillGold = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  background: C.gold, color: '#0B0906', border: 'none', cursor: 'pointer',
  padding: '17px 34px', borderRadius: '100px', width: '100%',
  fontSize: '11px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
  fontFamily: BODY, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
};

/* Underline-style field */
const fieldWrap = { position: 'relative', display: 'block' };
const fieldLabel = {
  display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.35em',
  textTransform: 'uppercase', color: C.gold, marginBottom: '10px', fontFamily: BODY,
};
const fieldInput = {
  width: '100%', background: 'transparent', border: 'none',
  borderBottom: `1px solid ${C.hairline}`, borderRadius: 0,
  padding: '10px 0 14px', fontSize: '17px', color: C.cream,
  fontFamily: BODY, outline: 'none', colorScheme: 'dark',
  transition: 'border-color 0.3s ease',
};
const onFieldFocus = (e) => { e.currentTarget.style.borderBottomColor = C.gold; };
const onFieldBlur = (e) => { e.currentTarget.style.borderBottomColor = C.hairline; };

/* ═════════════════════════════════════════════════════════════
   1 · HERO — full-bleed evening photo, char reveal
   ═════════════════════════════════════════════════════════════ */
const HeroSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);
  const hintRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const splits = [];
    const ctx = gsap.context(() => {
      if (!reduced) {
        lineRefs.current.forEach((lineEl, li) => {
          if (!lineEl) return;
          const split = new SplitType(lineEl, { types: 'chars' });
          splits.push(split);
          gsap.set(split.chars, { yPercent: 115, rotateX: -45, transformPerspective: 600 });
          gsap.to(split.chars, {
            yPercent: 0, rotateX: 0,
            duration: 1.15, ease: 'expo.out',
            stagger: 0.022, delay: 0.25 + li * 0.14,
          });
        });
        gsap.fromTo('.rv-hero-fade',
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.85 }
        );
        gsap.fromTo(bgRef.current, { scale: 1.18, yPercent: 0 }, {
          scale: 1, yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        });
        gsap.to(contentRef.current, {
          yPercent: -12, opacity: 0.25, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        });
        gsap.to(hintRef.current, {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '18% top', scrub: true },
        });
      } else {
        gsap.set(bgRef.current, { scale: 1 });
      }
    }, sectionRef);
    return () => { ctx.revert(); splits.forEach(s => s.revert()); };
  }, [reduced]);

  const lineWrap = { display: 'block', overflow: 'hidden', paddingBottom: '0.1em', marginBottom: '-0.1em' };

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '100svh', minHeight: '540px', overflow: 'hidden', background: C.bg }}>
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, willChange: 'transform', transformOrigin: 'center center' }}>
        <img src={IMG.hero} alt="Evening table setting at Ohana" fetchpriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,9,6,0.72) 0%, rgba(11,9,6,0.18) 26%, rgba(11,9,6,0.12) 55%, rgba(11,9,6,0.82) 84%, #0B0906 100%)', pointerEvents: 'none' }} />

      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(22px, 6vw, 96px) clamp(84px, 13vh, 130px)', paddingTop: '80px', maxWidth: '1500px', margin: '0 auto', width: '100%' }}>
        <div className="rv-hero-fade" style={{ marginBottom: 'clamp(20px, 3vh, 34px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel>Reservations</GoldLabel>
        </div>

        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(3rem, 13.5vw, 9rem)', lineHeight: 0.88, letterSpacing: '-0.03em', margin: '0 0 clamp(22px, 3.5vh, 38px)', color: C.cream }}>
          <span style={lineWrap}><span ref={el => { lineRefs.current[0] = el; }} style={{ display: 'inline-block' }}>Book Your</span></span>
          <span style={lineWrap}>
            <span ref={el => { lineRefs.current[1] = el; }} style={{ display: 'inline-block' }}>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, letterSpacing: '0' }}>Terrace</span>{' '}Table.
            </span>
          </span>
        </h1>

        <p className="rv-hero-fade" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)', color: 'rgba(242,231,208,0.7)', lineHeight: 1.55, maxWidth: '480px', margin: 0, opacity: reduced ? 1 : 0 }}>
          Walk-ins welcome. Reservations guaranteed.
        </p>
      </div>

      <div ref={hintRef} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 3, pointerEvents: 'none' }}>
        <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.faint, fontFamily: BODY }}>Scroll</span>
        <div style={{ position: 'relative', width: '1px', height: '56px', background: 'rgba(182,145,46,0.28)', overflow: 'hidden' }}>
          <span className="rv-hint-dot" style={{ position: 'absolute', top: 0, left: '-1.5px', width: '4px', height: '4px', borderRadius: '50%', background: C.goldBright }} />
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   2 · BOOKING LEDGER — numbered editorial chapters + form
   ═════════════════════════════════════════════════════════════ */
const LedgerSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const confirmRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [formState, setFormState] = useState({ date: '', size: '2', name: '', phone: '', requests: '' });
  // Manual time entry: hour (1–12) + minute (00–59) + AM/PM dropdown
  const [timeParts, setTimeParts] = useState({ hour: '', minute: '', ampm: 'PM' });

  const set = (key) => (e) => setFormState((s) => ({ ...s, [key]: e.target.value }));
  const largeGroup = parseInt(formState.size, 10) > 8 || formState.size === '20+';
  const composedTime = timeParts.hour
    ? `${timeParts.hour}:${(timeParts.minute || '00').padStart(2, '0')} ${timeParts.ampm}`
    : '';

  const handleSubmit = (event) => {
    event.preventDefault();
    const h = parseInt(timeParts.hour, 10);
    if (!timeParts.hour || isNaN(h) || h < 1 || h > 12) { setTimeError(true); return; }
    setTimeError(false);
    setConfirmOpen(true);
  };

  /* Entrance reveals */
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray('.rv-chapter').forEach((ch) => {
        gsap.fromTo(ch,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', scrollTrigger: { trigger: ch, start: 'top 84%', once: true } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  /* Confirmation moment — card pop + self-drawing check */
  useEffect(() => {
    if (!confirmOpen || !confirmRef.current) return undefined;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo('.rv-confirm-scrim', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' });
      gsap.fromTo('.rv-confirm-card',
        { opacity: 0, y: 36, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', delay: 0.08 }
      );
      gsap.fromTo('.rv-check-circle', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.35 });
      gsap.fromTo('.rv-check-mark', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', delay: 0.85 });
    }, confirmRef);
    const timer = setTimeout(() => setConfirmOpen(false), 5000);
    return () => { clearTimeout(timer); ctx.revert(); };
  }, [confirmOpen, reduced]);

  const chapterHead = (num, title) => (
    <div style={{ position: 'relative', marginBottom: 'clamp(26px, 4vh, 38px)' }}>
      <span aria-hidden style={{
        position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
        fontFamily: DISPLAY, fontSize: 'clamp(3.4rem, 12vw, 6rem)', lineHeight: 1,
        color: 'transparent', WebkitTextStroke: '1.5px rgba(182,145,46,0.35)',
        pointerEvents: 'none', userSelect: 'none',
      }}>{num}</span>
      <GoldLabel>{`${num} — ${title}`}</GoldLabel>
    </div>
  );

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg2, padding: 'clamp(72px, 10vh, 120px) 0 clamp(80px, 12vh, 130px)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 48px)' }}>
        <div className="rv-chapter" style={{ textAlign: 'center', marginBottom: 'clamp(48px, 8vh, 80px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel center>The Booking Ledger</GoldLabel>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 7.5vw, 4rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: C.cream, margin: 'clamp(18px, 3vh, 26px) 0 0' }}>
            Three lines and<br />
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '0.94em' }}>the table is yours.</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate={false}>
          {/* ── 01 · When ─────────────────────────────── */}
          <fieldset className="rv-chapter" style={{ border: 'none', margin: 0, padding: '0 0 clamp(44px, 7vh, 72px)', borderBottom: `1px solid ${C.hairline}`, opacity: reduced ? 1 : 0 }}>
            {chapterHead('01', 'When')}
            <label htmlFor="rv-date" style={fieldWrap}>
              <span style={fieldLabel}>Date</span>
              <input id="rv-date" name="date" type="date" required
                value={formState.date} onChange={set('date')}
                onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch { /* older Safari */ } }}
                style={{ ...fieldInput, cursor: 'pointer' }} onFocus={onFieldFocus} onBlur={onFieldBlur} />
            </label>

            <span style={{ ...fieldLabel, display: 'block', marginTop: 'clamp(28px, 4vh, 40px)' }}>Time</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(10px, 3vw, 16px)' }}>
              <label htmlFor="rv-hour" style={{ ...fieldWrap, flex: '0 0 clamp(64px, 18vw, 84px)' }}>
                <input id="rv-hour" name="hour" inputMode="numeric" autoComplete="off"
                  placeholder="7" maxLength={2}
                  value={timeParts.hour}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                    const n = parseInt(digits, 10);
                    // clamp live: 1–12 only, keep typing flow natural
                    const next = digits === '' ? '' : (n > 12 ? '12' : String(n));
                    setTimeParts((p) => ({ ...p, hour: next }));
                    setTimeError(false);
                  }}
                  onFocus={onFieldFocus} onBlur={onFieldBlur}
                  aria-label="Hour (1 to 12)"
                  style={{ ...fieldInput, textAlign: 'center', fontSize: 'clamp(20px, 5.5vw, 26px)', fontWeight: 600 }} />
              </label>
              <span aria-hidden style={{ paddingBottom: '14px', fontFamily: DISPLAY, fontSize: 'clamp(20px, 5.5vw, 26px)', color: C.gold }}>:</span>
              <label htmlFor="rv-minute" style={{ ...fieldWrap, flex: '0 0 clamp(64px, 18vw, 84px)' }}>
                <input id="rv-minute" name="minute" inputMode="numeric" autoComplete="off"
                  placeholder="00" maxLength={2}
                  value={timeParts.minute}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                    const n = parseInt(digits, 10);
                    const next = digits === '' ? '' : (digits.length === 2 && n > 59 ? '59' : digits);
                    setTimeParts((p) => ({ ...p, minute: next }));
                    setTimeError(false);
                  }}
                  onBlur={(e) => {
                    // pad single digits → "5" becomes "05"
                    setTimeParts((p) => (p.minute && p.minute.length === 1 ? { ...p, minute: '0' + p.minute } : p));
                    onFieldBlur(e);
                  }}
                  onFocus={onFieldFocus}
                  aria-label="Minute (00 to 59)"
                  style={{ ...fieldInput, textAlign: 'center', fontSize: 'clamp(20px, 5.5vw, 26px)', fontWeight: 600 }} />
              </label>
              <label htmlFor="rv-ampm" style={{ ...fieldWrap, flex: '0 0 auto', position: 'relative' }}>
                <select id="rv-ampm" name="ampm"
                  value={timeParts.ampm}
                  onChange={(e) => { setTimeParts((p) => ({ ...p, ampm: e.target.value })); setTimeError(false); }}
                  onFocus={onFieldFocus} onBlur={onFieldBlur}
                  aria-label="AM or PM"
                  style={{
                    ...fieldInput, width: 'auto', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
                    paddingRight: '26px', fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 700, letterSpacing: '0.12em',
                  }}>
                  <option value="AM" style={{ background: C.bg2 }}>AM</option>
                  <option value="PM" style={{ background: C.bg2 }}>PM</option>
                </select>
                <span aria-hidden style={{ position: 'absolute', right: '2px', bottom: '16px', pointerEvents: 'none', color: C.gold, fontSize: '10px' }}>▾</span>
              </label>
              <span aria-hidden style={{ marginLeft: 'auto', paddingBottom: '16px', fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.9rem', color: C.faint, whiteSpace: 'nowrap' }}>
                kitchen 11 AM – 10 PM
              </span>
            </div>
            <input type="hidden" name="time" value={composedTime} />
            {timeError && (
              <p role="alert" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.95rem', color: C.goldBright, margin: '8px 0 0' }}>
                Tell us the hour — golden hour included.
              </p>
            )}
          </fieldset>

          {/* ── 02 · Who ──────────────────────────────── */}
          <fieldset className="rv-chapter" style={{ border: 'none', margin: 0, padding: 'clamp(44px, 7vh, 72px) 0', borderBottom: `1px solid ${C.hairline}`, opacity: reduced ? 1 : 0 }}>
            {chapterHead('02', 'Who')}

            <span style={fieldLabel}>Party size</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: largeGroup ? '18px' : 0 }}>
              {Array.from({ length: 8 }, (_, i) => String(i + 1)).map((size) => {
                const active = formState.size === size;
                return (
                  <button key={size} type="button"
                    onClick={() => setFormState((s) => ({ ...s, size }))}
                    aria-pressed={active}
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
                      border: active ? `1px solid ${C.gold}` : `1px solid ${C.hairline}`,
                      background: active ? C.gold : 'transparent',
                      color: active ? '#0B0906' : C.muted,
                      fontSize: '14px', fontWeight: active ? 800 : 600,
                      fontFamily: BODY, transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                    }}>
                    {size}
                  </button>
                );
              })}
              <button type="button"
                onClick={() => setFormState((s) => ({ ...s, size: '9' }))}
                aria-pressed={largeGroup}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
                  border: largeGroup ? `1px solid ${C.gold}` : `1px solid ${C.hairline}`,
                  background: largeGroup ? C.gold : 'transparent',
                  color: largeGroup ? '#0B0906' : C.muted,
                  fontSize: '13px', fontWeight: largeGroup ? 800 : 600,
                  fontFamily: BODY, transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                }}>
                9+
              </button>
            </div>
            {largeGroup && (
              <label htmlFor="rv-size" style={{ ...fieldWrap, marginBottom: '4px' }}>
                <span style={fieldLabel}>How many exactly?</span>
                <select id="rv-size" name="size" value={formState.size} onChange={set('size')}
                  style={{ ...fieldInput, appearance: 'none', cursor: 'pointer' }}
                  onFocus={onFieldFocus} onBlur={onFieldBlur}>
                  {Array.from({ length: 12 }, (_, i) => i + 9).map((n) => (
                    <option key={n} value={String(n)} style={{ background: C.bg2 }}>{n} people</option>
                  ))}
                  <option value="20+" style={{ background: C.bg2 }}>20+ people</option>
                </select>
              </label>
            )}
            {!largeGroup && <input type="hidden" name="size" value={formState.size} />}

            <div style={{ display: 'grid', gap: 'clamp(24px, 4vh, 36px)', marginTop: 'clamp(28px, 4vh, 40px)' }} className="rv-who-grid">
              <label htmlFor="rv-name" style={fieldWrap}>
                <span style={fieldLabel}>Name</span>
                <input id="rv-name" name="name" type="text" required autoComplete="name"
                  value={formState.name} onChange={set('name')} placeholder="Your name"
                  style={fieldInput} onFocus={onFieldFocus} onBlur={onFieldBlur} />
              </label>
              <label htmlFor="rv-phone" style={fieldWrap}>
                <span style={fieldLabel}>Phone</span>
                <input id="rv-phone" name="phone" type="tel" required autoComplete="tel"
                  value={formState.phone} onChange={set('phone')} placeholder="+91 9XXXXXXXXX"
                  style={fieldInput} onFocus={onFieldFocus} onBlur={onFieldBlur} />
              </label>
            </div>
          </fieldset>

          {/* ── 03 · Notes ────────────────────────────── */}
          <fieldset className="rv-chapter" style={{ border: 'none', margin: 0, padding: 'clamp(44px, 7vh, 72px) 0', opacity: reduced ? 1 : 0 }}>
            {chapterHead('03', 'Notes')}
            <label htmlFor="rv-requests" style={fieldWrap}>
              <span style={fieldLabel}>Special requests</span>
              <textarea id="rv-requests" name="requests" rows={4}
                value={formState.requests} onChange={set('requests')}
                placeholder="Any dietary notes or celebration details"
                style={{ ...fieldInput, resize: 'vertical', minHeight: '110px', lineHeight: 1.6 }}
                onFocus={onFieldFocus} onBlur={onFieldBlur} />
            </label>

            <button type="submit" style={{ ...pillGold, marginTop: 'clamp(32px, 5vh, 48px)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              Request Reservation <ArrowRight size={15} />
            </button>
            <p style={{ textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.95rem', color: C.faint, margin: '16px 0 0' }}>
              We confirm every request personally — usually within the hour.
            </p>
          </fieldset>
        </form>
      </div>

      {/* ── Confirmation moment ── */}
      {confirmOpen && (
        <div ref={confirmRef} role="status" aria-live="polite"
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setConfirmOpen(false)}>
          <div className="rv-confirm-scrim" style={{ position: 'absolute', inset: 0, background: 'rgba(11,9,6,0.88)' }} />
          <div className="rv-confirm-card"
            style={{
              position: 'relative', maxWidth: '400px', width: '100%', textAlign: 'center',
              background: C.bg2, border: `1px solid ${C.hairline}`,
              padding: 'clamp(36px, 7vh, 56px) clamp(24px, 6vw, 40px)',
            }}>
            <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin: '0 auto 22px', display: 'block' }} aria-hidden>
              <circle className="rv-check-circle" cx="36" cy="36" r="30" fill="none"
                stroke={C.gold} strokeWidth="1.5" pathLength="1" strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}
                transform="rotate(-90 36 36)" />
              <path className="rv-check-mark" d="M24 37 L33 46 L50 28" fill="none"
                stroke={C.goldBright} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                pathLength="1" strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1} />
            </svg>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 5vw, 2rem)', letterSpacing: '-0.02em', color: C.cream, margin: '0 0 12px' }}>
              Request received.
            </h3>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.05rem', color: C.muted, lineHeight: 1.6, margin: '0 0 20px' }}>
              We'll confirm via WhatsApp shortly.
            </p>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: C.faint, margin: 0, fontFamily: BODY }}>
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}

      <style>{`
        .rv-chip-row::-webkit-scrollbar { display: none; }
        .rv-chip-row { scrollbar-width: none; }
        @media (min-width: 720px) {
          .rv-who-grid { grid-template-columns: 1fr 1fr; }
        }
        #rv-date::-webkit-calendar-picker-indicator { filter: invert(0.8) sepia(0.4) saturate(3) hue-rotate(5deg); cursor: pointer; }
        .rv-confirm-card { box-shadow: 0 40px 100px rgba(0,0,0,0.6); }
      `}</style>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   3 · INTERLUDE — full-bleed parallax band
   ═════════════════════════════════════════════════════════════ */
const InterludeSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo(bgRef.current, { yPercent: -12 }, {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
      gsap.fromTo('.rv-interlude-text',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', minHeight: '70svh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: C.bg }}>
      <div ref={bgRef} style={{ position: 'absolute', inset: '-15%', willChange: reduced ? 'auto' : 'transform' }}>
        <img src={IMG.interlude} alt="The terrace at dusk" loading="lazy" decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0B0906 0%, rgba(11,9,6,0.55) 30%, rgba(11,9,6,0.55) 70%, #0B0906 100%)', pointerEvents: 'none' }} />
      <p className="rv-interlude-text" style={{
        position: 'relative', zIndex: 2, textAlign: 'center', margin: 0,
        padding: '0 clamp(22px, 6vw, 60px)', maxWidth: '900px',
        fontFamily: BODY, fontWeight: 600, fontSize: 'clamp(1.5rem, 5.5vw, 3rem)',
        lineHeight: 1.3, letterSpacing: '-0.015em', color: C.cream,
        opacity: reduced ? 1 : 0,
      }}>
        Golden hour waits for no one.{' '}
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '1.05em' }}>Reserve yours.</span>
      </p>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   4 · DETAILS — editorial numbered rows
   ═════════════════════════════════════════════════════════════ */
const DetailsSection = ({ reduced }) => {
  const sectionRef = useRef(null);

  const details = [
    { title: 'Private bookings', desc: 'The full terrace, closed just for your people — birthdays, proposals, quiet celebrations.' },
    { title: 'Group tables up to 20', desc: 'Long tables under open sky. Bring the whole family; that is rather the point.' },
    { title: 'Special occasions', desc: 'Cakes, candles, flowers, a song at the right moment — tell us in the notes and we arrange it.' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray('.rv-detail-row').forEach((row) => {
        gsap.fromTo(row,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 84%', once: true } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg, padding: 'clamp(72px, 10vh, 120px) 0 clamp(64px, 9vh, 100px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 96px)' }}>
        <div style={{ marginBottom: 'clamp(36px, 6vh, 56px)' }}>
          <GoldLabel>Good to Know</GoldLabel>
        </div>
        {details.map((d, i) => (
          <div key={d.title} className="rv-detail-row"
            style={{
              position: 'relative', borderTop: `1px solid ${C.hairline}`,
              padding: 'clamp(36px, 6vh, 64px) 0',
              opacity: reduced ? 1 : 0,
            }}>
            <span aria-hidden style={{
              position: 'absolute', top: 'clamp(20px, 4vh, 36px)', right: 0,
              fontFamily: DISPLAY, fontSize: 'clamp(3.6rem, 12vw, 7rem)', lineHeight: 1,
              color: 'transparent', WebkitTextStroke: '1.5px rgba(242,231,208,0.2)',
              pointerEvents: 'none', userSelect: 'none',
            }}>{String(i + 1).padStart(2, '0')}</span>
            <h3 style={{
              position: 'relative', zIndex: 1,
              fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 5.5vw, 3rem)', lineHeight: 0.95,
              letterSpacing: '-0.03em', color: C.cream, margin: '0 0 14px', maxWidth: '70%',
            }}>{d.title}</h3>
            <p style={{ fontSize: 'clamp(0.9rem, 2.4vw, 1rem)', color: C.muted, lineHeight: 1.7, margin: 0, maxWidth: '460px', fontFamily: BODY }}>{d.desc}</p>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${C.hairline}` }} />
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   5 · CALL ROW — prefer to talk?
   ═════════════════════════════════════════════════════════════ */
const CallSection = ({ reduced }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo('.rv-call-reveal',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg3, padding: 'clamp(80px, 12vh, 130px) 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 60px)', textAlign: 'center' }}>
        <div className="rv-call-reveal" style={{ marginBottom: 'clamp(20px, 3vh, 28px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel center>Prefer to Talk?</GoldLabel>
        </div>
        <a href="tel:+919999999999" className="rv-call-reveal"
          style={{
            display: 'inline-block', textDecoration: 'none',
            fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(2rem, 8.5vw, 4.5rem)', lineHeight: 1.05, color: C.goldBright,
            opacity: reduced ? 1 : 0,
          }}>
          +91 99999 99999
        </a>
        <p className="rv-call-reveal" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', color: C.muted, margin: '18px 0 0', opacity: reduced ? 1 : 0 }}>
          Or call us directly — a real person answers.
        </p>

        <div className="rv-call-reveal" style={{ marginTop: 'clamp(48px, 8vh, 72px)', opacity: reduced ? 1 : 0 }}>
          <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: '20px' }}>
            <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.faint, margin: 0, fontFamily: BODY }}>
              Gar-Ali · Jorhat, Assam — Above KFC · Open every day till 10 PM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   RESERVATIONS — composition + Lenis (this page only)
   ═════════════════════════════════════════════════════════════ */
const Reservations = () => {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    document.body.style.backgroundColor = C.bg;
    document.documentElement.style.backgroundColor = C.bg;

    let lenis = null;
    let rafCb = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,
        touchMultiplier: 2,
      });
      lenis.on('scroll', ScrollTrigger.update);
      rafCb = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(rafCb);
      gsap.ticker.lagSmoothing(0);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener('load', refresh);
      if (rafCb) gsap.ticker.remove(rafCb);
      if (lenis) lenis.destroy();
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [reduced]);

  return (
    <main style={{ position: 'relative', background: C.bg, overflowX: 'clip' }}>
      <HeroSection reduced={reduced} />
      <LedgerSection reduced={reduced} />
      <InterludeSection reduced={reduced} />
      <DetailsSection reduced={reduced} />
      <CallSection reduced={reduced} />

      <style>{`
        @keyframes rvHintDot {
          0%   { transform: translateY(0); opacity: 0; }
          18%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { transform: translateY(52px); opacity: 0; }
        }
        .rv-hint-dot { animation: rvHintDot 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rv-hint-dot { animation: none !important; }
        }
      `}</style>
    </main>
  );
};

export default Reservations;
