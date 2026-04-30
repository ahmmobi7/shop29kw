import { useCallback } from 'react';
import { usePosts } from '../hooks/usePosts.js';
import { useIntersection } from '../hooks/useIntersection.js';
import useStore from '../store/useStore.js';
import VideoCard from './VideoCard.jsx';

export default function VideoGrid() {
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePosts(activeCategoryId);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersection(loadMore, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  const posts = data?.pages.flat() ?? [];

  if (isError) {
    return (
      <div style={styles.message}>
        <p style={{ fontSize: 17, fontWeight: 600, color: '#1D1D1F' }}>Something went wrong</p>
        <p style={{ fontSize: 15, color: '#6E6E73', marginTop: 4 }}>
          Check your Supabase connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.grid}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : posts.map((post) => <VideoCard key={post.id} post={post} />)
        }
      </div>

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <div style={styles.message}>
          <p style={{ fontSize: 17, fontWeight: 600 }}>No videos yet</p>
          <p style={{ fontSize: 15, color: '#6E6E73', marginTop: 4 }}>
            Use LinkBridge to post your first video.
          </p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />

      {/* Loading spinner for next page */}
      {isFetchingNextPage && (
        <div style={styles.spinner}>
          <Spinner />
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div style={{ padding: '10px 12px' }}>
        <div className="skeleton" style={{ height: 13, borderRadius: 6, marginBottom: 6, width: '70%' }} />
        <div className="skeleton" style={{ height: 11, borderRadius: 6, width: '50%' }} />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      border: '2px solid #E5E5EA',
      borderTopColor: '#1D1D1F',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

const styles = {
  wrapper: { padding: '12px 16px 80px' },
  grid: {
    display:               'grid',
    gridTemplateColumns:   'repeat(auto-fill, minmax(75px, 1fr))',
    gap:                   12,
    marginBottom:          12,
  },
  message: {
    textAlign:  'center',
    padding:    '48px 24px',
    color:      '#1D1D1F',
  },
  spinner: {
    display:        'flex',
    justifyContent: 'center',
    padding:        '16px 0',
  },
};

// Inject keyframe for spinner (once)
if (!document.getElementById('spin-style')) {
  const s = document.createElement('style');
  s.id = 'spin-style';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}
