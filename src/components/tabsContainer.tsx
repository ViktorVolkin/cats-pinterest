import {TabNavigation} from './tabNavigation/tabNavigation.tsx';
import {TabContent} from './tabContent/tabContent.tsx';

export const TabsContainer = () => {
  
  return (
    <div className="tabs-container">
    <TabNavigation />
    <TabContent />
    </div>
  );
};