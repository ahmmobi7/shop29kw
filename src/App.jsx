import Header from './components/Header.jsx';
import CategoryMarquee from './components/CategoryMarquee.jsx';
import VideoModal from './components/VideoModal.jsx';
import { useCategories } from './hooks/useCategories.js';
import useStore from './store/useStore.js';
import VideoGrid from './components/VideoGrid.jsx';

export default function App() {
  const { data: categories = [] } = useCategories();
  const activeCategoryId = useStore((s) => s.activeCategoryId);

  const preferredOrder = ['Top Offers', 'Electronics', 'Toys', 'Torch', 'Massager'];
  const sortedCategories = [...categories].sort((a, b) => {
    const idxA = preferredOrder.findIndex(name => a.name?.toLowerCase() === name.toLowerCase());
    const idxB = preferredOrder.findIndex(name => b.name?.toLowerCase() === name.toLowerCase());
    if (idxA === -1 && idxB === -1) return a.name?.localeCompare(b.name);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <Header />
      
      {activeCategoryId ? (
        <VideoGrid />
      ) : (
        <div style={{ paddingTop: 12 }}>
          {/* Default view: Show all categories as marquees */}
          {sortedCategories.map((cat) => (
            <CategoryMarquee 
              key={cat.id} 
              title={cat.name} 
              categoryId={cat.id} 
              isGlitter={cat.name.toLowerCase().includes('top offers')}
            />
          ))}
        </div>
      )}

      <VideoModal />
    </div>
  );
}
