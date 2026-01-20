import React, { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Visualizer } from './pages/Visualizer';
import { DataUpload } from './pages/DataUpload';
import { Reports } from './pages/Reports';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'visualizer':
        return <Visualizer />;
      case 'upload':
        return <DataUpload />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
