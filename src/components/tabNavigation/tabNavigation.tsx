import { useTabs } from '../tabContext';
import './tabNavigation.scss'
const tabs = [
  { id: 'all-cats', label: 'Все котики' },
  { id: 'favourite-cats', label: 'Любимые котики' },
];

export const TabNavigation = () => {
  const { activeTab, changeTab } = useTabs();

  return (
    <nav className="tab-nav">
      <div className="tab-container">
      {tabs.map((tab) => (
        <div className="tab-wrapper">

        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => changeTab(tab.id)}
          aria-current={activeTab === tab.id}
        >
          {tab.label}
        </button>
        </div>
      ))}</div>
    </nav>
  );
};