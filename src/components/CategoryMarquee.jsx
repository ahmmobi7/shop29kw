import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { usePosts } from '../hooks/usePosts.js';
import VideoCard from './VideoCard.jsx';
import { motion } from 'framer-motion';

export default function CategoryMarquee({ title, categoryId, isGlitter = false }) {
  const { data, isLoading } = usePosts(categoryId);
  const rawPosts = data?.pages.flat().slice(0, 8) ?? [];

  // Embla requires enough slides to fill the viewport for loop to work smoothly.
  // We duplicate the posts to ensure there are always at least ~12 items.
  const displayPosts = rawPosts.length > 0 
    ? [...rawPosts, ...rawPosts, ...rawPosts, ...rawPosts].slice(0, 16)
    : [];

  // Embla Carousel with AutoScroll plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, containScroll: 'trimSnaps' },
    [AutoScroll({ playOnInit: true, speed: 0.6, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    // Haptic piano effect: light vibration when snapping to a new card
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(4);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (displayPosts.length === 0 && !isLoading) return null;

  return (
    <div style={styles.section}>
      <h2 
        className={isGlitter ? "glitter-text" : ""} 
        style={{...styles.title, color: isGlitter ? undefined : '#1D1D1F'}}
      >
        {title}
      </h2>
      
      {/* Embla Viewport */}
      <div style={styles.embla} ref={emblaRef}>
        <div style={styles.emblaContainer}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={styles.emblaSlide}>
                <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 16 }} />
              </div>
            ))
          ) : (
            displayPosts.map((post, idx) => (
              <div key={`${post.id}-${idx}`} style={styles.emblaSlide}>
                <motion.div
                  style={{ height: '100%', padding: '4px 0' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <VideoCard post={post} isDuplicate={idx >= rawPosts.length} />
                </motion.div>
              </div>
            ))
          )}
        </div>
      </div>
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
  embla: {
    overflow: 'hidden',
    padding: '0 8px', // offset container padding
  },
  emblaContainer: {
    display: 'flex',
    touchAction: 'pan-y pinch-zoom',
    marginLeft: 8,
  },
  emblaSlide: {
    flex: '0 0 105px', // slightly wider cards
    minWidth: 0,
    paddingRight: 10,
  },
};
