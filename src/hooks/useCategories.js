import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../lib/supabase.js';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
