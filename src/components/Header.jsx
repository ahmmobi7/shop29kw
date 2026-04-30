import { useState, useEffect } from 'react';
import { X, Menu, Home } from 'lucide-react';
import useStore from '../store/useStore.js';
import CategoryDrawer from './CategoryDrawer.jsx';

export default function Header() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const activePost                 = useStore((s) => s.activePost);
  const clearActive                = useStore((s) => s.clearActive);
  const activeCategoryId           = useStore((s) => s.activeCategoryId);
  const setCategory                = useStore((s) => s.setCategory);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header style={styles.header(scrolled)}>
        {/* Left: Logo Avatar */}
        <div onClick={() => setMenuOpen(true)} style={styles.avatarWrap}>
          <img src="/logo.png" alt="Shop29" style={styles.avatarImg} />
        </div>

        {/* Centre: logo */}
        <div 
          onClick={() => setCategory(null)} 
          style={{ ...styles.logoWrapper, cursor: 'pointer' }}
        >
          <span className="glitter-text" style={styles.logo}>
            SHOP29 (ALHAMRA PHONES)
          </span>
        </div>

        {/* Right: close (modal open) or Home button */}
        {activePost ? (
          <button onClick={clearActive} style={styles.iconBtn} aria-label="Close">
            <X size={18} color="#1D1D1F" strokeWidth={2.5} />
          </button>
        ) : activeCategoryId ? (
          <button onClick={() => setCategory(null)} style={styles.iconBtn} aria-label="Home">
            <Home size={18} color="#1D1D1F" strokeWidth={2.5} />
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </header>

      <CategoryDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = {
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  header: (scrolled) => ({
    position:          'sticky',
    top:               0,
    zIndex:            200,
    height:            56,
    display:           'flex',
    alignItems:        'center',
    justifyContent:    'space-between',
    padding:           '0 16px',
    background:        'rgba(255,255,255,0.85)',
    backdropFilter:    'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom:      scrolled ? '1px solid rgba(0,0,0,0.10)' : '1px solid transparent',
    transition:        'border-bottom 0.25s ease',
  }),
  logoWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '0 8px',
  },
  logo: {
    fontSize:      13,
    fontWeight:    900,
    letterSpacing: '-0.01em',
    textAlign:     'center',
    whiteSpace:    'nowrap',
  },
  avatarWrap: {
    width:          40,
    height:         40,
    borderRadius:   '50%',
    overflow:       'hidden',
    border:         '1.5px solid #FF0000',
    cursor:         'pointer',
    background:     '#fff',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  avatarImg: {
    width:  '100%',
    height: '100%',
    objectFit: 'cover',
  },
};
