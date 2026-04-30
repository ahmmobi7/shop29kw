import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LayoutGrid } from 'lucide-react';
import { useCategories } from '../hooks/useCategories.js';
import useStore from '../store/useStore.js';

export default function CategoryDrawer({ open, onClose }) {
  const { data: categories = [] } = useCategories();
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const setCategory = useStore((s) => s.setCategory);

  const handleSelect = (id) => {
    setCategory(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={styles.drawer}
          >
            <div style={styles.header}>
              <div style={styles.titleWrap}>
                <div style={styles.smallLogoWrap}>
                  <img src="/logo.png" alt="" style={styles.smallLogo} />
                </div>
                <span style={styles.title}>Categories</span>
              </div>
              <button onClick={onClose} style={styles.closeBtn}>
                <X size={20} color="#1D1D1F" />
              </button>
            </div>

            <div style={styles.list}>
              {/* All Category */}
              <CategoryItem
                label="All Products"
                active={activeCategoryId === null}
                onClick={() => handleSelect(null)}
              />

              {categories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  label={cat.name}
                  active={activeCategoryId === cat.id}
                  onClick={() => handleSelect(cat.id)}
                />
              ))}
            </div>

            <div style={styles.footer}>
              <p style={styles.footerText}>SHOP29 © 2026</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CategoryItem({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={styles.item(active)}>
      <span style={styles.itemLabel(active)}>{label}</span>
      {active ? (
        <div style={styles.activeDot} />
      ) : (
        <ChevronRight size={16} color="#AEAEB2" />
      )}
    </button>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    maxWidth: '85vw',
    background: '#ffffff',
    zIndex: 1001,
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  smallLogoWrap: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid #FF0000',
    overflow: 'hidden',
    background: '#fff',
  },
  smallLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1D1D1F',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.05)',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px',
  },
  item: (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: 12,
    marginBottom: 4,
    background: active ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
    transition: 'background 0.2s ease',
  }),
  itemLabel: (active) => ({
    fontSize: 16,
    fontWeight: active ? 600 : 500,
    color: active ? '#1DA851' : '#1D1D1F',
  }),
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#25D366',
  },
  footer: {
    padding: '24px 16px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: '#F5F5F7',
  },
  footerText: {
    fontSize: 12,
    color: '#AEAEB2',
    textAlign: 'center',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
};
