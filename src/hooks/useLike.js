import { useCallback, useRef } from 'react';
import useStore from '../store/useStore.js';
import { incrementLike, decrementLike } from '../lib/supabase.js';

export function useLike(post) {
  const { initLike, toggleLike, getLike } = useStore();
  const syncingRef = useRef(false);

  // Initialise this post's like state from server data
  if (post) initLike(post.id, post.likes ?? 0);

  const likeState = post ? getLike(post.id) : { liked: false, count: 0 };

  const handleToggle = useCallback(async () => {
    if (!post || syncingRef.current) return;
    syncingRef.current = true;

    // 1. Optimistic update
    const wasLiked = getLike(post.id).liked;
    toggleLike(post.id);

    // 2. Sync to Supabase in background (best-effort)
    try {
      if (wasLiked) {
        await decrementLike(post.id, post.likes ?? 0);
      } else {
        await incrementLike(post.id, post.likes ?? 0);
      }
    } catch (err) {
      // Revert on failure
      toggleLike(post.id);
      console.error('Like sync failed:', err);
    } finally {
      syncingRef.current = false;
    }
  }, [post, toggleLike, getLike]);

  return { ...likeState, toggleLike: handleToggle };
}
