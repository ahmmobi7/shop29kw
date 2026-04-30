import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState } from 'react';

const BANNERS = [
  { id: 1, title: 'SUMMER COLLECTION', sub: 'New arrivals every week', bg: '#1D1D1F',     textColor: '#fff' },
  { id: 2, title: 'FLASH SALE — 30% OFF',sub: 'Limited time offer',  bg: '#25D366',     textColor: '#fff' },
  { id: 3, title: 'PREMIUM GADGETS',    sub: 'Top brands, best price', bg: '#0A0A2E',   textColor: '#fff' },
];

export default function PromoBannerSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelected(emblaApi.selectedScrollSnap()));
    return () => emblaApi.off('select', () => {});
  }, [emblaApi]);

  return (
    <div style={styles.wrapper}>
      <div ref={emblaRef} style={styles.viewport}>
        <div style={styles.container}>
          {BANNERS.map((b) => (
            <div key={b.id} style={styles.slide(b.bg)}>
              <div style={styles.overlay} />
              <div style={styles.content}>
                <p style={{ ...styles.title, color: b.textColor }}>{b.title}</p>
                <p style={{ ...styles.sub, color: b.textColor }}>{b.sub}</p>
                <button style={styles.shopBtn}>Shop now →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={styles.dots}>
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            style={styles.dot(i === selected)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative', margin: '0 16px 4px', borderRadius: 16, overflow: 'hidden' },
  viewport: { overflow: 'hidden', borderRadius: 16 },
  container: { display: 'flex' },
  slide: (bg) => ({
    flexShrink:  0,
    minWidth:    '100%',
    height:      180,
    background:  bg,
    position:    'relative',
    display:     'flex',
    alignItems:  'flex-end',
  }),
  overlay: {
    position:   'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
  },
  content: {
    position:  'relative',
    zIndex:    1,
    padding:   '0 20px 20px',
  },
  title: {
    fontSize:      20,
    fontWeight:    700,
    letterSpacing: '-0.02em',
    marginBottom:  4,
  },
  sub: {
    fontSize:   13,
    fontWeight: 400,
    opacity:    0.85,
    marginBottom: 10,
  },
  shopBtn: {
    background:   'rgba(255,255,255,0.20)',
    border:       '1px solid rgba(255,255,255,0.35)',
    backdropFilter: 'blur(8px)',
    color:        '#fff',
    fontSize:     13,
    fontWeight:   600,
    padding:      '6px 14px',
    borderRadius: 999,
    cursor:       'pointer',
  },
  dots: {
    position:       'absolute',
    bottom:         10,
    right:          16,
    display:        'flex',
    gap:            5,
    alignItems:     'center',
  },
  dot: (active) => ({
    height:       6,
    width:        active ? 18 : 6,
    borderRadius: 999,
    background:   active ? '#fff' : 'rgba(255,255,255,0.5)',
    border:       'none',
    cursor:       'pointer',
    padding:      0,
    transition:   'width 0.25s ease, background 0.25s ease',
  }),
};
