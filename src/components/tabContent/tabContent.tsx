import './tabContent.scss'
import { useTabs } from '../tabContext.tsx';
import AllCatsPage from '../../pages/allCatsPage/allCatsPage.tsx';
import FavouriteCatsPage from '../../pages/favouriteCatsPage/favouriteCatsPage.tsx';
export const TabContent = () => {
  const { activeTab } = useTabs();

  return (
    <div className="tab-content">
      {activeTab === 'all-cats' && <AllCatsPage />}
      {activeTab === 'favourite-cats' && <FavouriteCatsPage /> }
    </div>
  );
};
