import useStore from '../store/useStore.js';
import { useCategories } from '../hooks/useCategories.js';

export default function CategoryBar() {
  const { data: categories = [] }  = useCategories();
  const activeCategoryId           = useStore((s) => s.activeCategoryId);
  const setCategory                = useStore((s) => s.setCategory);

  const all = [{ id: null, name: 'ALL' }, ...categories];

  return (
    <div style={styles.bar} className="hide-scrollbar" role="list">
      {all.map((cat) => {
        const active = activeCategoryId === cat.id;
        return (
          <button
            key={cat.id ?? 'all'}
            role="listitem"
            onClick={() => setCategory(cat.id)}
            aria-pressed={active}
            style={styles.pill(active)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  bar: {
    display:        'flex',
    gap:            8,
    padding:        '12px 16px',
    overflowX:      'auto',
    scrollSnapType: 'x mandatory',
    background:     '#F5F5F7',
  },
  pill: (active) => ({
    flexShrink:     0,
    height:         36,
    padding:        '0 16px',
    borderRadius:   999,
    border:         active ? '1px solid transparent' : '1px solid rgba(0,0,0,0.12)',
    background:     active ? '#1D1D1F' : '#ffffff',
    color:          active ? '#ffffff' : '#1D1D1F',
    fontSize:       15,
    fontWeight:     active ? 600 : 500,
    cursor:         'pointer',
    scrollSnapAlign:'start',
    transition:     'background 0.18s ease, color 0.18s ease',
    whiteSpace:     'nowrap',
    WebkitTapHighlightColor: 'transparent',
  }),
};
