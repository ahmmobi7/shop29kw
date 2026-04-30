import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { usePosts } from '../hooks/usePosts.js';
import VideoCard from './VideoCard.jsx';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryMarquee({ title, categoryId, isGlitter = false }) {
  const { data, isLoading } = usePosts(categoryId);
  const rawPosts = data?.pages.flat().slice(0, 8) ?? [];

  // Embla Setup: No loop, no auto-scroll. Pure manual sliding.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true });
  
  // Smart Hint State
  const [showHint, setShowHint] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(2);
    }
  }, [emblaApi]);

  // FLICKER-FREE WAVE EFFECT
  const TWEEN_FACTOR_BASE = 0.15;

  const tweenScale = useCallback((api) => {
    const engine = api.internalEngine();
    const scrollProgress = api.scrollProgress();

    api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR_BASE);
        const scale = Math.max(0.85, Math.min(1, tweenValue));
        
        const slideNode = api.slideNodes()[slideIndex];
        if (slideNode) {
          const innerNode = slideNode.querySelector('.embla-slide-inner');
          if (innerNode) {
            innerNode.style.transform = `scale(${scale})`;
          }
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    
    tweenScale(emblaApi);
    emblaApi.on('scroll', () => {
      tweenScale(emblaApi);
      // Auto-hide the hint as soon as the user starts scrolling
      if (showHint) setShowHint(false);
    });
    emblaApi.on('reInit', () => tweenScale(emblaApi));

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', tweenScale);
      emblaApi.off('reInit', tweenScale);
    };
  }, [emblaApi, onSelect, tweenScale, showHint]);

  // Auto-hide the hint after 4.5 seconds if they don't scroll
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  if (rawPosts.length === 0 && !isLoading) return null;

  return (
    <div style={styles.section}>
      <h2 
        className={isGlitter ? "glitter-text" : ""} 
        style={{...styles.title, color: isGlitter ? undefined : '#1D1D1F'}}
      >
        {title}
      </h2>
      
      <div style={styles.marqueeWrapper}>
        <div style={styles.embla} ref={emblaRef}>
          <div style={styles.emblaContainer}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={styles.emblaSlide}>
                  <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 16 }} />
                </div>
              ))
            ) : (
              rawPosts.map((post, idx) => (
                <div key={`${post.id}-${idx}`} style={styles.emblaSlide}>
                  <div 
                    className="embla-slide-inner"
                    style={{ height: '100%', padding: '4px 0', transformOrigin: 'center center' }}
                  >
                    <VideoCard post={post} disableLayoutAnimation />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Smart Slide Arrow Indicator */}
        <AnimatePresence>
          {showHint && rawPosts.length > 2 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={styles.hintContainer}
            >
              <div style={styles.hintBox}>
                <ChevronRight size={22} color="#fff" strokeWidth={3.5} className="swipe-arrow" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes swipeHint {
          0% { transform: translateX(0); }
          50% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .swipe-arrow {
          animation: swipeHint 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  section: {
    padding: '0 0 24px 0',
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: 800,
    margin: '0 16px 10px',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  marqueeWrapper: {
    position: 'relative', // Allows absolute positioning of the hint arrow
  },
  embla: {
    overflow: 'hidden',
    padding: '0 8px',
  },
  emblaContainer: {
    display: 'flex',
    touchAction: 'pan-y pinch-zoom',
    marginLeft: 8,
  },
  emblaSlide: {
    flex: '0 0 105px', 
    minWidth: 0,
    paddingRight: 10,
    transform: 'translate3d(0, 0, 0)',
  },
  hintContainer: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  hintBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
};
