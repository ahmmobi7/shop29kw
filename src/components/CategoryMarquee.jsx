import { useCallback, useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { usePosts } from '../hooks/usePosts.js';
import VideoCard from './VideoCard.jsx';

export default function CategoryMarquee({ title, categoryId, isGlitter = false }) {
  const { data, isLoading } = usePosts(categoryId);
  
  const displayPosts = useMemo(() => {
    const rawPosts = data?.pages.flat().slice(0, 8) ?? [];
    if (rawPosts.length === 0) return [];
    // Ensure we have enough slides for Embla loop
    return [...rawPosts, ...rawPosts, ...rawPosts, ...rawPosts].slice(0, 16);
  }, [data]);

  // Embla Carousel with AutoScroll plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, containScroll: 'trimSnaps' },
    [AutoScroll({ playOnInit: true, speed: 0.4, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(3);
    }
  }, [emblaApi]);

  const TWEEN_FACTOR_BASE = 0.12;

  const tweenScale = useCallback((api, eventName) => {
    const engine = api.internalEngine();
    const scrollProgress = api.scrollProgress();
    const slidesInView = api.slidesInView();
    const isScrollEvent = eventName === 'scroll';

    api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }

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
    
    // Setup selection haptics
    emblaApi.on('select', onSelect);
    
    // Setup tween scale (wave effect)
    tweenScale(emblaApi);
    emblaApi
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', tweenScale);
      emblaApi.off('scroll', tweenScale);
      emblaApi.off('slideFocus', tweenScale);
    };
  }, [emblaApi, onSelect, tweenScale]);

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
                <div 
                  className="embla-slide-inner"
                  style={{ height: '100%', padding: '4px 0', transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)' }}
                >
                  <VideoCard post={post} disableLayoutAnimation />
                </div>
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
