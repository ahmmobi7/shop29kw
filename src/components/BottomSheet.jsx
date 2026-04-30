import { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow, formatFullDate } from '../lib/dateUtils.js';
import { buildWhatsAppUrl } from '../lib/whatsapp.js';
import useStore from '../store/useStore.js';

const SHEET_HEIGHT_PERCENT = 0.65; // 65% of screen

export default function BottomSheet({ post }) {
  const clearActive  = useStore((s) => s.clearActive);
  const screenH      = window.innerHeight;
  const sheetH       = screenH * SHEET_HEIGHT_PERCENT;
  const y            = useMotionValue(0);
  const contentRef   = useRef(null);

  // Opacity of the content fades out as user drags down
  const contentOpacity = useTransform(y, [0, sheetH * 0.4], [1, 0.4]);

  const handleDragEnd = (_, info) => {
    if (info.offset.y > sheetH * 0.35 || info.velocity.y > 500) {
      // Dismiss
      animate(y, sheetH, { duration: 0.25 }).then(clearActive);
    } else {
      // Snap back
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  const dateStr = post.created_at
    ? formatDistanceToNow(new Date(post.created_at))
    : null;
  const fullDateStr = post.created_at
    ? formatFullDate(new Date(post.created_at))
    : null;

  const waUrl = buildWhatsAppUrl(post);

  return (
    <motion.div
      style={{ ...styles.sheet, y }}
      initial={{ y: sheetH }}
      animate={{ y: 0 }}
      exit={{ y: sheetH }}
      transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
      drag="y"
      dragConstraints={{ top: -(sheetH * 0.3), bottom: sheetH }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      {/* Drag handle */}
      <div style={styles.handle} />

      {/* Scrollable content area */}
      <motion.div
        ref={contentRef}
        style={{ ...styles.scrollArea, opacity: contentOpacity }}
      >
        {/* Creator section */}
        <div style={styles.creatorSection}>
          <div style={styles.avatar}>
            <img src="/logo.png" alt="Shop29" style={styles.avatarImg} />
          </div>
          <p style={styles.creatorName}>Shop29</p>
          <button style={styles.viewProfileBtn}>View Profile</button>
        </div>

        <div style={styles.divider} />

        {/* Date & description */}
        <div style={styles.contentBody}>
          {dateStr && (
            <p style={styles.dateLabel} title={fullDateStr}>
              Added {dateStr}
            </p>
          )}
          <p style={styles.description}>{post.description}</p>

          {/* Category badge */}
          {post.categories?.name && (
            <div style={styles.catBadge}>
              <span style={styles.catText}>{post.categories.name}</span>
            </div>
          )}
        </div>

        {/* Bottom spacer so content isn't hidden behind CTA */}
        <div style={{ height: 96 }} />
      </motion.div>

      {/* Sticky WhatsApp CTA */}
      <div style={styles.ctaWrapper} className="safe-bottom">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.ctaBtn}
          onClick={(e) => e.stopPropagation()}
        >
          <WhatsAppIcon />
          <span style={styles.ctaText}>ORDER ON WHATSAPP</span>
        </a>
      </div>
    </motion.div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.521 5.824L.057 23.576a.5.5 0 00.612.612l5.752-1.464A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.929 0-3.73-.518-5.274-1.421l-.378-.224-3.914.997.997-3.914-.224-.378A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

const styles = {
  sheet: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    height:        `${SHEET_HEIGHT_PERCENT * 100}%`,
    background:    '#ffffff',
    borderRadius:  '24px 24px 0 0',
    boxShadow:     '0 -2px 20px rgba(0,0,0,0.10)',
    zIndex:        20,
    display:       'flex',
    flexDirection: 'column',
    cursor:        'grab',
    willChange:    'transform',
    touchAction:   'none',
  },
  handle: {
    width:        36,
    height:       4,
    borderRadius: 999,
    background:   'rgba(0,0,0,0.18)',
    margin:       '12px auto 0',
    flexShrink:   0,
  },
  scrollArea: {
    flex:       1,
    overflowY:  'auto',
    WebkitOverflowScrolling: 'touch',
  },
  creatorSection: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    paddingTop:     20,
    paddingBottom:  16,
  },
  avatar: {
    width:          72,
    height:         72,
    borderRadius:   '50%',
    background:     '#fff',
    border:         '2px solid #FF0000',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   12,
    overflow:       'hidden',
  },
  avatarImg: {
    width:  '100%',
    height: '100%',
    objectFit: 'cover',
  },
  creatorName: {
    fontSize:      17,
    fontWeight:    700,
    color:         '#1D1D1F',
    marginBottom:  8,
  },
  viewProfileBtn: {
    height:        36,
    padding:       '0 20px',
    borderRadius:  999,
    border:        '1px solid rgba(0,0,0,0.15)',
    background:    'rgba(0,0,0,0.04)',
    fontSize:      15,
    fontWeight:    500,
    color:         '#1D1D1F',
    cursor:        'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  divider: {
    height:     1,
    background: 'rgba(0,0,0,0.08)',
    margin:     '0 16px',
  },
  contentBody: {
    padding:    '16px 20px',
  },
  dateLabel: {
    fontSize:     13,
    color:        '#6E6E73',
    marginBottom: 8,
  },
  description: {
    fontSize:   17,
    fontWeight: 400,
    color:      '#1D1D1F',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  catBadge: {
    display:        'inline-flex',
    alignItems:     'center',
    background:     '#F5F5F7',
    border:         '1px solid rgba(0,0,0,0.08)',
    borderRadius:   8,
    padding:        '4px 12px',
  },
  catText: {
    fontSize:      12,
    fontWeight:    600,
    color:         '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  ctaWrapper: {
    position:   'absolute',
    bottom:     0,
    left:       0,
    right:      0,
    padding:    '12px 16px',
    background: '#ffffff',
    borderTop:  '1px solid rgba(0,0,0,0.06)',
  },
  ctaBtn: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    width:          '100%',
    height:         56,
    background:     '#25D366',
    borderRadius:   14,
    textDecoration: 'none',
    boxShadow:      '0 4px 16px rgba(37,211,102,0.40)',
    transition:     'transform 0.1s ease, background 0.15s ease',
    WebkitTapHighlightColor: 'transparent',
    cursor:         'pointer',
  },
  ctaText: {
    fontSize:      17,
    fontWeight:    700,
    color:         '#ffffff',
    letterSpacing: '0.3px',
  },
};
