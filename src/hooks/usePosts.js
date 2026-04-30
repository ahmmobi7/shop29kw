import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts, PAGE_SIZE } from '../lib/supabase.js';

export function usePosts(categoryId) {
  return useInfiniteQuery({
    queryKey:           ['posts', categoryId],
    queryFn:            ({ pageParam = 0 }) => fetchPosts({ pageParam, categoryId }),
    getNextPageParam:   (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
    keepPreviousData:   true,
  });
}
