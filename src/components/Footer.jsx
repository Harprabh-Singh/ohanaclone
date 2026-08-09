import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) return null;

  return (
    <footer style={{
      background: '#07050A',
      padding: 'clamp(40px, 8vh, 80px) clamp(24px, 6vw, 80px) 40px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      position: 'relative', zIndex: 10,
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '40px',
        marginBottom: '60px',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B6912E', display: 'block' }} />
            <p style={{
              fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
              fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF',
              letterSpacing: '0.02em', margin: 0,
            }}>OHANA</p>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 8px' }}>
            Cafe Kitchen & Terraces, Jorhat
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, letterSpacing: '0.05em' }}>
            Above KFC, Gar-Ali, Jorhat, Assam
          </p>
        </div>

        {/* Links */}
        <div>
          <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#B6912E', margin: '0 0 20px' }}>
            Explore
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {['Home', 'Menu', 'Gallery', 'About', 'Reservations', 'Contact'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                  transition: 'color 0.2s ease', width: 'fit-content',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#B6912E'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Socials & CTA */}
        <div>
          <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#B6912E', margin: '0 0 20px' }}>
            Connect
          </p>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '28px' }}>
            <a
              href="https://instagram.com/ohana.jrt" target="_blank" rel="noreferrer"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C42D78'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              Instagram @ohana.jrt
            </a>
            <a
              href="https://wa.me/919999999999" target="_blank" rel="noreferrer"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#4aad6e'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              WhatsApp Us
            </a>
          </div>
          
          <Link
            to="/reservations"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              border: '1px solid rgba(182,145,46,0.3)', color: '#B6912E', textDecoration: 'none',
              padding: '10px 24px', borderRadius: '100px',
              fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(182,145,46,0.1)'; e.currentTarget.style.borderColor = 'rgba(182,145,46,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(182,145,46,0.3)'; }}
          >
            Reserve Table <span style={{ fontSize: '12px' }}>→</span>
          </Link>
        </div>
      </div>

      {/* Bottom mark */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.04)',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', margin: 0, letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} Ohana Kitchen & Café.
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0, letterSpacing: '0.08em' }}>
          Made with ♥ in Jorhat
        </p>
      </div>
    </footer>
  );
};

export default Footer;
