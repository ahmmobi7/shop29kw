import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, X, ChevronLeft } from 'lucide-react';
import useStore from '../store/useStore.js';
import { useLike } from '../hooks/useLike.js';
import { useShare } from '../hooks/useShare.js';
import { buildWhatsAppUrl } from '../lib/whatsapp.js';

export default function VideoModal() {
  const activePost  = useStore((s) => s.activePost);
  const clearActive = useStore((s) => s.clearActive);
  const [showCard, setShowCard] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activePost) {
      document.body.style.overflow = 'hidden';
      setShowCard(true); // Start immediately
      
      // Hide description card after 10 seconds
      const timer = setTimeout(() => {
        setShowCard(false);
      }, 10000);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [activePost]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') clearActive(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clearActive]);

  const waUrl = activePost ? buildWhatsAppUrl(activePost) : '';

  return (
    <AnimatePresence>
      {activePost && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={clearActive}
            style={styles.backdrop}
          />

          {/* Modal container */}
          <motion.div
            key="modal"
            layoutId={`card-${activePost.id}`}
            style={styles.modal}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {/* Video / embed player */}
            <EmbedPlayer post={activePost} />

            {/* Back button (top left) */}
            <button onClick={clearActive} style={styles.backBtn} aria-label="Go back">
              <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
              <span style={styles.backText}>Back</span>
            </button>

            {/* Close button (top right of screen) */}
            <button onClick={clearActive} style={styles.closeModalBtn} aria-label="Close">
              <X size={24} color="#fff" />
            </button>

            {/* Right-side action buttons */}
            <SideActions post={activePost} />

            {/* Permanent WhatsApp Button at the bottom */}
            <div style={styles.whatsappSticky} className="safe-bottom">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.ctaBtn}
              >
                <WhatsAppIcon />
                <span style={styles.ctaText}>ORDER ON WHATSAPP</span>
              </a>
            </div>

            {/* Delayed Product Description Card */}
            <AnimatePresence>
              {showCard && (
                <motion.div
                  initial={{ y: 100, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 50, opacity: 0, scale: 0.95 }}
                  style={styles.productCard}
                >
                  <button 
                    onClick={() => setShowCard(false)} 
                    style={styles.cardCancelBtn}
                  >
                    <X size={18} color="#6E6E73" />
                  </button>
                  
                  <div style={styles.cardContent}>
                    <p style={styles.cardTitle}>{activePost.product_name}</p>
                    <p style={styles.cardPrice}>KWD {Number(activePost.product_price).toFixed(2)}</p>
                    <p style={styles.cardDesc}>{activePost.description}</p>
                    {activePost.categories?.name && (
                      <span style={styles.cardTag}>{activePost.categories.name}</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmbedPlayer({ post }) {
  const isSrc = getEmbedSrc(post);

  return (
    <div style={styles.playerWrap}>
      {isSrc ? (
        <iframe
          src={isSrc}
          title={post.product_name ?? 'Video'}
          // ✅ FIX 1: Added storage-access and fullscreen to allow attribute
          allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture; web-share; storage-access"
          allowFullScreen
          // ✅ FIX 2: Changed from strict-origin-when-cross-origin — TikTok's
          //    embed server rejects requests with that strict policy.
          referrerPolicy="no-referrer-when-downgrade"
          // ✅ FIX 3: Removed sandbox entirely. The sandbox attribute was
          //    overriding the allow attribute and blocking TikTok's player
          //    scripts from accessing storage and autoplay mechanisms,
          //    causing a silent blank/broken iframe.
          style={styles.iframe}
        />
      ) : (
        <div style={styles.playerFallback}>
          <span style={{ fontSize: 48 }}>🎬</span>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 14 }}>
            Video preview unavailable
          </p>
        </div>
      )}
    </div>
  );
}

function SideActions({ post }) {
  const { liked, count, toggleLike } = useLike(post);
  const { share, copied }     = useShare();

  return (
    <div style={styles.sideActions}>
      {/* Like */}
      <button onClick={toggleLike} style={styles.sideBtn} aria-label="Like">
        <Heart
          size={24}
          fill={liked ? '#FF3B30' : 'transparent'}
          color={liked ? '#FF3B30' : '#fff'}
          strokeWidth={2}
        />
        <span style={styles.sideLabel}>{count > 0 ? count : ''}</span>
      </button>

      {/* Share */}
      <button onClick={() => share(post)} style={styles.sideBtn} aria-label="Share">
        {copied
          ? <span style={{ color: '#25D366', fontSize: 16, fontWeight: 700 }}>✓</span>
          : <Share2 size={24} color="#fff" strokeWidth={2} />
        }
        <span style={styles.sideLabel}>Share</span>
      </button>
    </div>
  );
}

// ✅ FIX 4: Added TikTok autoplay params (was only being done for YouTube before)
function getEmbedSrc(post) {
  if (!post?.embed_url) return null;
  let url = post.embed_url;

  if (url.includes('youtube.com/embed')) {
    url += (url.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
  }

  // TikTok: append autoplay. music_volume=0 mutes audio on autoplay
  // so browsers don't block it (browsers block audible autoplay).
  // embed/v2/ is TikTok's official iframe-safe endpoint — do NOT use
  // /player/v1/ which sends X-Frame-Options: DENY headers.
  if (url.includes('tiktok.com/embed')) {
    url += (url.includes('?') ? '&' : '?') + 'autoplay=1&music_volume=0';
  }

  return url;
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
  backdrop: {
    position:   'fixed',
    inset:       0,
    background: 'rgba(0,0,0,0.85)',
    zIndex:     300,
  },
  modal: {
    position:   'fixed',
    inset:       0,
    zIndex:     400,
    background: '#000',
    display:    'flex',
    flexDirection: 'column',
    overflow:   'hidden',
    maxWidth:   430,
    margin:     '0 auto',
  },
  playerWrap: {
    flex:       1,
    position:   'relative',
    overflow:   'hidden',
    display:    'flex',
    alignItems: 'center',
    background: '#000',
  },
  iframe: {
    width:   '100%',
    height:  '100%',
    border:  'none',
  },
  playerFallback: {
    width:          '100%',
    height:         '100%',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    background:     '#111',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 50,
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',
    borderRadius: 999,
    padding: '0 16px 0 8px',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  backText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '-0.3px',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 50,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '50%',
    padding: 8,
    display: 'none',
  },
  sideActions: {
    position:      'absolute',
    right:         12,
    bottom:        240, 
    display:       'flex',
    flexDirection: 'column',
    gap:           20,
    zIndex:        10,
  },
  sideBtn: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            4,
    background:     'none',
    border:         'none',
    cursor:         'pointer',
    padding:        0,
    WebkitTapHighlightColor: 'transparent',
  },
  sideLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  whatsappSticky: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 35,
    pointerEvents: 'none',
  },
  ctaBtn: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    width:          'auto',
    minWidth:       200,
    height:         48,
    padding:        '0 24px',
    background:     '#25D366',
    borderRadius:   999,
    textDecoration: 'none',
    boxShadow:      '0 8px 24px rgba(37,211,102,0.40)',
    WebkitTapHighlightColor: 'transparent',
    cursor:         'pointer',
    pointerEvents:  'auto',
  },
  ctaText: {
    fontSize:      15,
    fontWeight:    700,
    color:         '#ffffff',
    letterSpacing: '0.2px',
  },
  productCard: {
    position: 'absolute',
    bottom: 88, 
    left: 16,
    right: 16,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 20,
    padding: '20px 16px 16px',
    zIndex: 30,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  cardCancelBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1D1D1F',
    paddingRight: 24, 
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: 600,
    color: '#25D366',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6E6E73',
    lineHeight: 1.4,
    marginTop: 4,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardTag: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: 700,
    color: '#6E6E73',
    background: '#F5F5F7',
    padding: '4px 8px',
    borderRadius: 4,
    width: 'fit-content',
    textTransform: 'uppercase',
  }
};
