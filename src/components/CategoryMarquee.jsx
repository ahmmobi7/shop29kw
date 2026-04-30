import { useMemo } from 'react';
import { usePosts } from '../hooks/usePosts.js';
import VideoCard from './VideoCard.jsx';

export default function CategoryMarquee({ title, categoryId, isGlitter = false }) {
  const { data, isLoading } = usePosts(categoryId);
  const rawPosts = data?.pages.flat().slice(0, 8) ?? [];

  if (rawPosts.length === 0 && !isLoading) return null;

  return (
    <div style={styles.section}>
      <h2 
        className={isGlitter ? "glitter-text" : ""} 
        style={{...styles.title, color: isGlitter ? undefined : '#1D1D1F'}}
      >
        {title}
      </h2>
      
      <div style={styles.marqueeWrapper} className="hide-scroll">
        <div style={styles.marqueeContent} className="marquee-animation">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={styles.slide}>
                <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 16 }} />
              </div>
            ))
          ) : (
            // Render the list multiple times for seamless looping
            [...rawPosts, ...rawPosts, ...rawPosts].map((post, idx) => (
              <div key={`${post.id}-${idx}`} style={styles.slide}>
                <VideoCard post={post} />
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .marquee-animation {
          animation: marquee 60s linear infinite;
        }
        .marquee-animation:hover {
          animation-play-state: paused;
        }
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

const styles = {
  section: {
    padding: '0 0 28px 0',
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
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  marqueeContent: {
    display: 'flex',
    width: 'fit-content',
    willChange: 'transform',
    paddingLeft: 16,
  },
  slide: {
    flex: '0 0 80px',
    marginRight: 10,
    scrollSnapAlign: 'start',
  },
};
