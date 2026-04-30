import { useState, useRef } from 'react';
import { Heart, Share2, ShoppingCart, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from '../lib/dateUtils.js';
import { useLike } from '../hooks/useLike.js';
import { useShare } from '../hooks/useShare.js';
import useStore from '../store/useStore.js';

export default function VideoCard({ post, isDuplicate = false }) {
  const setActivePost = useStore((s) => s.setActivePost);
  const { liked, count, toggleLike } = useLike(post);
  const { share, copied } = useShare();
  const [heartAnim, setHeartAnim] = useState(false);
  const heartRef = useRef(null);

  const handleLike = (e) => {
    e.stopPropagation();
    setHeartAnim(false);
    requestAnimationFrame(() => setHeartAnim(true));
    toggleLike();
  };

  const handleShare = (e) => {
    e.stopPropagation();
    share(post);
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    setActivePost(post); // open modal which has the WhatsApp button
  };

  const dateLabel = post.created_at
    ? formatDistanceToNow(new Date(post.created_at))
    : null;

  // Determine thumbnail — use embed_url for YouTube poster, else placeholder
  const thumbnailStyle = {
    position: 'absolute',
    top:      0,
    left:     0,
    width:    '100%',
    height:   '100%',
    objectFit: 'cover',
    objectPosition: 'top center',
    background: '#E5E5EA',
  };

  return (
    <motion.div
      layoutId={isDuplicate ? undefined : `card-${post.id}`}
      onClick={() => setActivePost(post)}
      style={styles.card}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* ── Thumbnail zone ─────────────────────────────── */}
      <div style={styles.thumbZone}>
        {/* Actual image / iframe thumbnail */}
        <EmbedThumbnail post={post} style={thumbnailStyle} />

        {/* NEW ARRIVAL badge */}
        {post.is_new && (
          <div style={{ ...styles.frosted, top: 6, left: 6 }}>
            <span style={styles.badgeText}>NEW ARRIVAL</span>
          </div>
        )}

        {/* Heart button */}
        <button
          ref={heartRef}
          onClick={handleLike}
          aria-label="Like"
          className={heartAnim ? 'heart-pop' : ''}
          onAnimationEnd={() => setHeartAnim(false)}
          style={{ ...styles.frosted, ...styles.likeBtn, top: 6, right: 6 }}
        >
          <Heart
            size={12}
            fill={liked ? '#FF3B30' : 'transparent'}
            color={liked ? '#FF3B30' : '#fff'}
            strokeWidth={2}
          />
          <span style={styles.likeCount}>{count > 0 ? count : ''}</span>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          aria-label="Share"
          style={{ ...styles.frosted, ...styles.iconBtn, bottom: 6, right: 6 }}
        >
          {copied
            ? <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>✓</span>
            : <Share2 size={10} color="#fff" strokeWidth={2} />
          }
        </button>

        {/* Date badge */}
        {dateLabel && (
          <div style={{ ...styles.frosted, bottom: 6, left: 6, padding: '2px 4px' }}>
            <span style={{ fontSize: 7, color: '#fff', fontWeight: 600 }}>{dateLabel}</span>
          </div>
        )}
      </div>

      {/* ── Product info strip ──────────────────────────── */}
      <div style={styles.infoStrip}>
        <div style={styles.infoLeft}>
          <p style={styles.productName} title={post.product_name}>
            {post.product_name ?? 'Shop29 Item'}
          </p>
          <p style={styles.productMeta}>
            {[post.product_brand, post.product_sizes?.join(', ')].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div style={styles.infoRight}>
          {post.product_price && (
            <p style={styles.price}>KWD {Number(post.product_price).toFixed(2)}</p>
          )}
          <button onClick={handleCartClick} style={styles.cartBtn} aria-label="Add to cart">
            <ShoppingCart size={10} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** Renders a thumbnail image or coloured placeholder based on platform */
function EmbedThumbnail({ post, style }) {
  const [imgError, setImgError] = useState(false);

  // For YouTube, derive thumbnail from embed URL
  const ytMatch = post.embed_url?.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  
  const platformColors = { instagram: '#E1306C', tiktok: '#010101', other: '#1D1D1F' };
  const color = platformColors[post.platform] ?? '#1D1D1F';

  return (
    <>
      {ytMatch && !imgError ? (
        <img
          src={`https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`}
          alt={post.product_name ?? 'Video thumbnail'}
          style={style}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{ ...style, background: color }} />
      )}

      {/* Unified Overlay with Play Button and Product Name */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '12px 8px',
        background: ytMatch && !imgError ? 'rgba(0,0,0,0.2)' : 'transparent',
        zIndex: 1,
        boxSizing: 'border-box'
      }}>
        <div style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}>
          <p style={{ 
            fontSize: 13,
            textAlign: 'center', 
            fontWeight: 900,
            lineHeight: 1.2,
            margin: '0 0 10px 0',
            background: 'linear-gradient(90deg, #00d2ff, #ff007a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {post.product_name || 'SHOP29 ITEM'}
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ 
            width: 28, 
            height: 28, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.4)'
          }}>
            <Play size={14} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
          </div>
          <span style={{ 
            fontSize: 7, 
            color: '#fff', 
            fontWeight: 800, 
            letterSpacing: '0.5px', 
            textAlign: 'center', 
            textShadow: '0px 1px 2px rgba(0,0,0,0.8)' 
          }}>
            PLAY
          </span>
        </div>
      </div>
    </>
  );
}

function PlatformIcon({ platform, size = 24 }) {
  const icons = { 
    youtube: 'YOUTUBE', 
    instagram: 'INSTAGRAM', 
    tiktok: 'TIKTOK', 
    other: 'VIDEO' 
  };
  return (
    <span style={{ 
      fontSize: platform === 'other' ? size : 12, 
      fontWeight: 800, 
      letterSpacing: '1px', 
      opacity: 0.8,
      color: '#fff',
      textAlign: 'center',
      padding: '0 8px'
    }}>
      {icons[platform] ?? 'VIDEO'}
    </span>
  );
}

const styles = {
  card: {
    borderRadius:   16,
    overflow:       'hidden',
    background:     '#ffffff',
    border:         '2px solid transparent',
    backgroundImage: 'linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #ff007a, #7a00ff, #00d2ff)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    cursor:         'pointer',
    width:          '100%',
    height:         '100%',
    maxWidth:       '100%',
    boxSizing:      'border-box',
    WebkitTapHighlightColor: 'transparent',
    display:        'flex',
    flexDirection:  'column',
  },
  thumbZone: {
    width:        '100%',
    aspectRatio:  '3/4',
    position:     'relative',
    overflow:     'hidden',
    background:   '#F5F5F7',
    display:      'block',
    flexShrink:   0,
  },
  frosted: {
    position:       'absolute',
    background:     'rgba(0,0,0,0.42)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border:         '1px solid rgba(255,255,255,0.12)',
    borderRadius:   8,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         2,
  },
  badgeText: {
    color:         '#fff',
    fontSize:      7,
    fontWeight:    700,
    letterSpacing: '0.2px',
    textTransform: 'uppercase',
    padding:       '2px 4px',
    display:       'block',
  },
  iconBtn: {
    width:  20,
    height: 20,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    WebkitTapHighlightColor: 'transparent',
  },
  likeBtn: {
    width:          24,
    height:         30,
    borderRadius:   8,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            2,
    padding:        '2px 0',
    cursor:         'pointer',
    border:         'none',
  },
  likeCount: {
    fontSize:      8,
    fontWeight:    700,
    color:         '#fff',
    lineHeight:    1,
  },
  infoStrip: {
    padding:        '6px 8px',
    display:        'flex',
    alignItems:     'center',
    gap:            4,
    justifyContent: 'space-between',
    minHeight:      38,
    flexGrow:       1,
    boxSizing:      'border-box',
  },
  infoLeft: { flex: 1, minWidth: 0 },
  productName: {
    fontSize:    9,
    fontWeight:  800,
    background:  'linear-gradient(90deg, #ff007a, #7a00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textTransform: 'uppercase',
    letterSpacing: '0.2px',
    overflow:    'hidden',
    whiteSpace:  'nowrap',
    textOverflow:'ellipsis',
    marginBottom: 2,
  },
  productMeta: {
    fontSize:  7,
    color:     '#6E6E73',
    overflow:  'hidden',
    whiteSpace:'nowrap',
    textOverflow:'ellipsis',
    minHeight: 10,
  },
  infoRight: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'flex-end',
    gap:            2,
    flexShrink:     0,
  },
  price: {
    fontSize:   9,
    fontWeight: 700,
    color:      '#25D366',
  },
  cartBtn: {
    width:          18,
    height:         18,
    borderRadius:   999,
    background:     '#25D366',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    border:         'none',
    cursor:         'pointer',
    padding:        0,
    WebkitTapHighlightColor: 'transparent',
  },
};
