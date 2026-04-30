import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ── Active video (modal) ──────────────────────────────────
  activePost:    null,
  setActivePost: (post) => set({ activePost: post }),
  clearActive:   ()     => set({ activePost: null }),

  // ── Category filter ───────────────────────────────────────
  activeCategoryId: null,
  setCategory: (id) => set({ activeCategoryId: id }),

  // ── Optimistic likes map: { [postId]: { liked: bool, count: number } } ──
  likes: {},

  initLike: (postId, serverCount) => {
    const existing = get().likes[postId];
    if (existing !== undefined) return; // already initialised
    set((state) => ({
      likes: { ...state.likes, [postId]: { liked: false, count: serverCount ?? 0 } },
    }));
  },

  toggleLike: (postId) =>
    set((state) => {
      const current = state.likes[postId] ?? { liked: false, count: 0 };
      return {
        likes: {
          ...state.likes,
          [postId]: {
            liked: !current.liked,
            count: current.liked ? current.count - 1 : current.count + 1,
          },
        },
      };
    }),

  getLike: (postId) => get().likes[postId] ?? { liked: false, count: 0 },
}));

export default useStore;
