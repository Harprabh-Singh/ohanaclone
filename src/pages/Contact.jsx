import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Lenis from 'lenis';
import { ArrowUpRight, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Design tokens (shared with About / Reservations) ──────── */
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
  hero: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1600&q=80',
};

const SUBJECTS = ['General Inquiry', 'Reservation', 'Event Booking', 'Feedback'];

const GoldLabel = ({ children, center = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: center ? 'center' : 'flex-start' }}>
    <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />
    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: C.gold, whiteSpace: 'nowrap' }}>{children}</span>
    {center && <span style={{ width: 'clamp(32px, 8vw, 48px)', height: '1px', background: C.gold, flexShrink: 0 }} />}
  </div>
);

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
  fontFamily: BODY, outline: 'none',
  transition: 'border-color 0.3s ease',
};
const onFieldFocus = (e) => { e.currentTarget.style.borderBottomColor = C.gold; };
const onFieldBlur = (e) => { e.currentTarget.style.borderBottomColor = C.hairline; };

/* Live open-status against 11:00 – 22:00 local time */
const getOpenStatus = () => {
  const now = new Date();
  const t = now.getHours() + now.getMinutes() / 60;
  if (t >= 11 && t < 22) return { open: true, text: 'Open now — kitchen till 10 PM' };
  if (t < 11) return { open: false, text: 'Opens at 11 AM' };
  return { open: false, text: 'Closed — opens 11 AM' };
};

/* ═════════════════════════════════════════════════════════════
   1 · HERO — full-bleed night photo, char reveal
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
            stagger: 0.02, delay: 0.25 + li * 0.13,
          });
        });
        gsap.fromTo('.ct-hero-fade',
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.95 }
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
        <img src={IMG.hero} alt="Warm night lights at Ohana" fetchpriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,9,6,0.72) 0%, rgba(11,9,6,0.18) 26%, rgba(11,9,6,0.12) 55%, rgba(11,9,6,0.82) 84%, #0B0906 100%)', pointerEvents: 'none' }} />

      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(22px, 6vw, 96px) clamp(84px, 13vh, 130px)', paddingTop: '80px', maxWidth: '1500px', margin: '0 auto', width: '100%' }}>
        <div className="ct-hero-fade" style={{ marginBottom: 'clamp(20px, 3vh, 34px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel>Contact</GoldLabel>
        </div>

        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.7rem, 12vw, 8.5rem)', lineHeight: 0.9, letterSpacing: '-0.03em', margin: 0, color: C.cream }}>
          <span style={lineWrap}><span ref={el => { lineRefs.current[0] = el; }} style={{ display: 'inline-block' }}>Let's Talk.</span></span>
          <span style={lineWrap}>
            <span ref={el => { lineRefs.current[1] = el; }} style={{ display: 'inline-block' }}>
              We Don't{' '}
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, letterSpacing: '0' }}>Bite</span>
            </span>
          </span>
          <span style={lineWrap}><span ref={el => { lineRefs.current[2] = el; }} style={{ display: 'inline-block' }}>(Much).</span></span>
        </h1>
      </div>

      <div ref={hintRef} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 3, pointerEvents: 'none' }}>
        <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.42em', textTransform: 'uppercase', color: C.faint, fontFamily: BODY }}>Scroll</span>
        <div style={{ position: 'relative', width: '1px', height: '56px', background: 'rgba(182,145,46,0.28)', overflow: 'hidden' }}>
          <span className="ct-hint-dot" style={{ position: 'absolute', top: 0, left: '-1.5px', width: '4px', height: '4px', borderRadius: '50%', background: C.goldBright }} />
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   2 · FIND US — editorial numbered info rows
   ═════════════════════════════════════════════════════════════ */
const InfoSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const [status, setStatus] = useState(getOpenStatus);

  useEffect(() => {
    const id = setInterval(() => setStatus(getOpenStatus()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray('.ct-info-row').forEach((row) => {
        gsap.fromTo(row,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 84%', once: true } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  const ghostNum = (num) => (
    <span aria-hidden style={{
      position: 'absolute', top: 'clamp(20px, 4vh, 36px)', right: 0,
      fontFamily: DISPLAY, fontSize: 'clamp(3.6rem, 12vw, 7rem)', lineHeight: 1,
      color: 'transparent', WebkitTextStroke: '1.5px rgba(242,231,208,0.2)',
      pointerEvents: 'none', userSelect: 'none',
    }}>{num}</span>
  );

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg, padding: 'clamp(72px, 10vh, 120px) 0 clamp(64px, 9vh, 100px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 96px)' }}>
        <div style={{ marginBottom: 'clamp(36px, 6vh, 56px)' }}>
          <GoldLabel>The Essentials</GoldLabel>
        </div>

        {/* 01 — Find Us */}
        <div className="ct-info-row" style={{ position: 'relative', borderTop: `1px solid ${C.hairline}`, padding: 'clamp(36px, 6vh, 64px) 0', opacity: reduced ? 1 : 0 }}>
          {ghostNum('01')}
          <span style={fieldLabel}>Find Us</span>
          <p style={{ position: 'relative', zIndex: 1, fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 5.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: C.cream, margin: 0, maxWidth: '80%' }}>
            Above KFC, Gar-Ali,<br />Jorhat, Assam 785001
          </p>
        </div>

        {/* 02 — Hours (live) */}
        <div className="ct-info-row" style={{ position: 'relative', borderTop: `1px solid ${C.hairline}`, padding: 'clamp(36px, 6vh, 64px) 0', opacity: reduced ? 1 : 0 }}>
          {ghostNum('02')}
          <span style={fieldLabel}>Hours</span>
          <p style={{ position: 'relative', zIndex: 1, fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 5.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: C.cream, margin: '0 0 18px', maxWidth: '80%' }}>
            Monday–Sunday<br />11:00 AM – 10:00 PM
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(1rem, 2.4vw, 1.2rem)', color: status.open ? C.goldBright : C.muted }}>
            <span className={status.open && !reduced ? 'ct-open-dot' : undefined}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.open ? C.goldBright : C.faint, flexShrink: 0 }} />
            {status.text}
          </p>
        </div>

        {/* 03 — Reach Out */}
        <div className="ct-info-row" style={{ position: 'relative', borderTop: `1px solid ${C.hairline}`, padding: 'clamp(36px, 6vh, 64px) 0', opacity: reduced ? 1 : 0 }}>
          {ghostNum('03')}
          <span style={fieldLabel}>Reach Out</span>
          <a href="tel:+919999999999" style={{
            position: 'relative', zIndex: 1, display: 'inline-block', textDecoration: 'none',
            fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(1.9rem, 7.5vw, 4rem)', lineHeight: 1.05, color: C.goldBright,
          }}>
            +91 99999 99999
          </a>
          <p style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', color: C.muted, lineHeight: 1.7, margin: '14px 0 0', fontFamily: BODY, maxWidth: '420px' }}>
            Click to call or chat on WhatsApp — a real person answers.
          </p>
        </div>
        <div style={{ borderTop: `1px solid ${C.hairline}` }} />
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   3 · MAP — real Google Maps embed, hairline framed
   ═════════════════════════════════════════════════════════════ */
const MapSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo(frameRef.current,
        { opacity: 0, y: 50, clipPath: 'inset(6% 3% 6% 3%)' },
        { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: frameRef.current, start: 'top 82%', once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg2, padding: 'clamp(72px, 10vh, 120px) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 64px)' }}>
        <div style={{ marginBottom: 'clamp(28px, 5vh, 44px)', padding: '0 clamp(6px, 2vw, 32px)' }}>
          <GoldLabel>The Way In</GoldLabel>
        </div>
        <div ref={frameRef} style={{
          position: 'relative',
          borderTop: '1px solid rgba(182,145,46,0.35)', borderBottom: '1px solid rgba(182,145,46,0.35)',
          opacity: reduced ? 1 : 0,
        }}>
          <iframe
            title="Ohana Cafe — Gar-Ali, Jorhat on Google Maps"
            src="https://www.google.com/maps?q=Ohana+Cafe+Gar-Ali+Jorhat+Assam&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ display: 'block', width: '100%', height: 'clamp(60vh, 70vh, 70vh)', border: 0, filter: 'grayscale(0.35) contrast(1.05)' }}
            allowFullScreen
          />
          {/* Address chip — solid bg, no backdrop-filter */}
          <div style={{
            position: 'absolute', left: 'clamp(12px, 3vw, 28px)', bottom: 'clamp(12px, 3vw, 28px)',
            background: C.bg2, border: `1px solid ${C.hairline}`,
            padding: '12px 18px', pointerEvents: 'none',
          }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.gold, fontFamily: BODY }}>
              Above KFC, Gar-Ali — Jorhat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   4 · MESSAGE FORM — ledger style + confirmation moment
   ═════════════════════════════════════════════════════════════ */
const MessageSection = ({ reduced }) => {
  const sectionRef = useRef(null);
  const confirmRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [formState, setFormState] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });

  const set = (key) => (e) => setFormState((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.subject) { setSubjectError(true); return; }
    setSubjectError(false);
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray('.ct-chapter').forEach((ch) => {
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
      gsap.fromTo('.ct-confirm-scrim', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' });
      gsap.fromTo('.ct-confirm-card',
        { opacity: 0, y: 36, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', delay: 0.08 }
      );
      gsap.fromTo('.ct-check-circle', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.35 });
      gsap.fromTo('.ct-check-mark', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', delay: 0.85 });
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
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg3, padding: 'clamp(72px, 10vh, 120px) 0 clamp(80px, 12vh, 130px)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 48px)' }}>
        <div className="ct-chapter" style={{ textAlign: 'center', marginBottom: 'clamp(48px, 8vh, 80px)', opacity: reduced ? 1 : 0 }}>
          <GoldLabel center>Send a Message</GoldLabel>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 7.5vw, 4rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: C.cream, margin: 'clamp(18px, 3vh, 26px) 0 0' }}>
            Say hello.<br />
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.goldBright, fontSize: '0.94em' }}>We reply fast.</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── 01 · Who ──────────────────────────────── */}
          <fieldset className="ct-chapter" style={{ border: 'none', margin: 0, padding: '0 0 clamp(44px, 7vh, 72px)', borderBottom: `1px solid ${C.hairline}`, opacity: reduced ? 1 : 0 }}>
            {chapterHead('01', 'Who')}
            <div style={{ display: 'grid', gap: 'clamp(24px, 4vh, 36px)' }} className="ct-who-grid">
              <label htmlFor="ct-first" style={fieldWrap}>
                <span style={fieldLabel}>First name</span>
                <input id="ct-first" name="firstName" type="text" required autoComplete="given-name"
                  value={formState.firstName} onChange={set('firstName')} placeholder="First name"
                  style={fieldInput} onFocus={onFieldFocus} onBlur={onFieldBlur} />
              </label>
              <label htmlFor="ct-last" style={fieldWrap}>
                <span style={fieldLabel}>Last name</span>
                <input id="ct-last" name="lastName" type="text" required autoComplete="family-name"
                  value={formState.lastName} onChange={set('lastName')} placeholder="Last name"
                  style={fieldInput} onFocus={onFieldFocus} onBlur={onFieldBlur} />
              </label>
            </div>
            <label htmlFor="ct-email" style={{ ...fieldWrap, display: 'block', marginTop: 'clamp(24px, 4vh, 36px)' }}>
              <span style={fieldLabel}>Email</span>
              <input id="ct-email" name="email" type="email" required autoComplete="email"
                value={formState.email} onChange={set('email')} placeholder="you@example.com"
                style={fieldInput} onFocus={onFieldFocus} onBlur={onFieldBlur} />
            </label>
          </fieldset>

          {/* ── 02 · What's it about ──────────────────── */}
          <fieldset className="ct-chapter" style={{ border: 'none', margin: 0, padding: 'clamp(44px, 7vh, 72px) 0', borderBottom: `1px solid ${C.hairline}`, opacity: reduced ? 1 : 0 }}>
            {chapterHead('02', "What's It About")}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {SUBJECTS.map((subject) => {
                const active = formState.subject === subject;
                return (
                  <button key={subject} type="button"
                    onClick={() => { setFormState((s) => ({ ...s, subject })); setSubjectError(false); }}
                    aria-pressed={active}
                    style={{
                      cursor: 'pointer', padding: '12px 22px', borderRadius: '100px',
                      border: active ? `1px solid ${C.gold}` : `1px solid ${C.hairline}`,
                      background: active ? C.gold : 'transparent',
                      color: active ? '#0B0906' : C.muted,
                      fontSize: '12px', fontWeight: active ? 800 : 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase', fontFamily: BODY,
                      transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}>
                    {subject}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="subject" value={formState.subject} />
            {subjectError && (
              <p role="alert" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.95rem', color: C.goldBright, margin: '14px 0 0' }}>
                Pick a subject — it helps us route you faster.
              </p>
            )}
          </fieldset>

          {/* ── 03 · Your message ─────────────────────── */}
          <fieldset className="ct-chapter" style={{ border: 'none', margin: 0, padding: 'clamp(44px, 7vh, 72px) 0', opacity: reduced ? 1 : 0 }}>
            {chapterHead('03', 'Your Message')}
            <label htmlFor="ct-message" style={fieldWrap}>
              <span style={fieldLabel}>Message</span>
              <textarea id="ct-message" name="message" rows={5} required
                value={formState.message} onChange={set('message')}
                placeholder="Tell us what you'd like"
                style={{ ...fieldInput, resize: 'vertical', minHeight: '130px', lineHeight: 1.6 }}
                onFocus={onFieldFocus} onBlur={onFieldBlur} />
            </label>

            <button type="submit"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: C.gold, color: '#0B0906', border: 'none', cursor: 'pointer',
                padding: '17px 34px', borderRadius: '100px', width: '100%',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
                fontFamily: BODY, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                marginTop: 'clamp(32px, 5vh, 48px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              Send Message <Send size={15} />
            </button>
          </fieldset>
        </form>
      </div>

      {/* ── Confirmation moment ── */}
      {confirmOpen && (
        <div ref={confirmRef} role="status" aria-live="polite"
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setConfirmOpen(false)}>
          <div className="ct-confirm-scrim" style={{ position: 'absolute', inset: 0, background: 'rgba(11,9,6,0.88)' }} />
          <div className="ct-confirm-card"
            style={{
              position: 'relative', maxWidth: '400px', width: '100%', textAlign: 'center',
              background: C.bg2, border: `1px solid ${C.hairline}`,
              padding: 'clamp(36px, 7vh, 56px) clamp(24px, 6vw, 40px)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            }}>
            <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin: '0 auto 22px', display: 'block' }} aria-hidden>
              <circle className="ct-check-circle" cx="36" cy="36" r="30" fill="none"
                stroke={C.gold} strokeWidth="1.5" pathLength="1" strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}
                transform="rotate(-90 36 36)" />
              <path className="ct-check-mark" d="M24 37 L33 46 L50 28" fill="none"
                stroke={C.goldBright} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                pathLength="1" strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1} />
            </svg>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 5vw, 2rem)', letterSpacing: '-0.02em', color: C.cream, margin: '0 0 12px' }}>
              Message sent.
            </h3>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.05rem', color: C.muted, lineHeight: 1.6, margin: '0 0 20px' }}>
              Thanks! Your message is on its way.
            </p>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: C.faint, margin: 0, fontFamily: BODY }}>
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   5 · SOCIAL ROWS — hairline rows, not cards
   ═════════════════════════════════════════════════════════════ */
const SocialSection = ({ reduced }) => {
  const sectionRef = useRef(null);

  const links = [
    { label: 'Instagram', handle: '@ohana.jrt', href: 'https://instagram.com/ohana.jrt' },
    { label: 'WhatsApp', handle: '+91 99999 99999', href: 'https://wa.me/919999999999' },
    { label: 'Facebook', handle: 'Ohana Cafe', href: 'https://facebook.com' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray('.ct-social-row').forEach((row, i) => {
        gsap.fromTo(row,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.95, ease: 'expo.out', delay: i * 0.08, scrollTrigger: { trigger: row, start: 'top 88%', once: true } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: C.bg, padding: 'clamp(64px, 9vh, 110px) 0 clamp(80px, 11vh, 120px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(22px, 6vw, 96px)' }}>
        <div style={{ marginBottom: 'clamp(28px, 5vh, 44px)' }}>
          <GoldLabel>Elsewhere</GoldLabel>
        </div>
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
            className="ct-social-row"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              borderTop: `1px solid ${C.hairline}`,
              padding: 'clamp(22px, 4vh, 34px) 0', textDecoration: 'none',
              opacity: reduced ? 1 : 0,
            }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(12px, 3vw, 24px)', minWidth: 0 }}>
              <span className="ct-social-label" style={{
                fontFamily: DISPLAY, fontSize: 'clamp(1.4rem, 5vw, 2.6rem)', letterSpacing: '-0.02em',
                color: C.cream, transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), color 0.35s ease',
                display: 'inline-block',
              }}>{l.label}</span>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', color: C.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.handle}</span>
            </span>
            <span className="ct-social-arrow" style={{ color: C.muted, flexShrink: 0, transition: 'color 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)', display: 'inline-flex' }}>
              <ArrowUpRight size={26} />
            </span>
          </a>
        ))}
        <div style={{ borderTop: `1px solid ${C.hairline}` }} />

        <div style={{ marginTop: 'clamp(48px, 8vh, 72px)' }}>
          <p style={{ textAlign: 'center', fontSize: '9px', fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.faint, margin: 0, fontFamily: BODY }}>
            Gar-Ali · Jorhat, Assam — Above KFC · Open every day till 10 PM
          </p>
        </div>
      </div>

      <style>{`
        @media (hover: hover) {
          .ct-social-row:hover .ct-social-label { transform: translateX(10px); color: ${C.goldBright}; }
          .ct-social-row:hover .ct-social-arrow { color: ${C.gold}; transform: translate(4px, -4px); }
        }
        .ct-social-row:active .ct-social-label { transform: translateX(10px); color: ${C.goldBright}; }
        .ct-social-row:active .ct-social-arrow { color: ${C.gold}; transform: translate(4px, -4px); }
        @keyframes ctOpenPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.55); opacity: 0.55; }
        }
        .ct-open-dot { animation: ctOpenPulse 2.4s ease-in-out infinite; }
        @media (min-width: 720px) {
          .ct-who-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
};

/* ═════════════════════════════════════════════════════════════
   CONTACT — composition + Lenis (this page only)
   ═════════════════════════════════════════════════════════════ */
const Contact = () => {
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
      <InfoSection reduced={reduced} />
      <MapSection reduced={reduced} />
      <MessageSection reduced={reduced} />
      <SocialSection reduced={reduced} />

      <style>{`
        @keyframes ctHintDot {
          0%   { transform: translateY(0); opacity: 0; }
          18%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { transform: translateY(52px); opacity: 0; }
        }
        .ct-hint-dot { animation: ctHintDot 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ct-hint-dot, .ct-open-dot { animation: none !important; }
        }
      `}</style>
    </main>
  );
};

export default Contact;
