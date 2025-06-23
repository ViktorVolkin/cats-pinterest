import { TabsContainer } from './components/tabsContainer';
import { TabProvider } from './components/tabContext';

function App() {
  return (
    <div className="app">
      <TabProvider>
        <TabsContainer />
      </TabProvider>
    </div>
  );
}

export default App;
