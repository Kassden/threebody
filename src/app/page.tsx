'use client';

import { useState, useEffect } from 'react';
import HotelScene from './components/HotelScene';
import ThreeBodyScene from './components/ThreeBodyScene';
import Button from './components/Button';

export default function Home() {
  const [activeTab, setActiveTab] = useState('hotel');
  const [key, setKey] = useState(0);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setKey(prev => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen">
      {/* Scene Container */}
      <div id="canvas-container" className="absolute inset-0">
        {activeTab === 'hotel' ? (
          <HotelScene key={`hotel-${key}`} containerId="canvas-container" />
        ) : (
          <ThreeBodyScene key={`threebody-${key}`} containerId="canvas-container" />
        )}
      </div>

      {/* Tab Navigation */}
      <nav className="relative z-50 p-4">
        <Button
          active={activeTab === 'hotel'}
          onClick={() => handleTabChange('hotel')}
        >
          Solar Hotel
        </Button>
        <Button
          active={activeTab === 'threebody'}
          onClick={() => handleTabChange('threebody')}
        >
          Three Body
        </Button>
      </nav>
    </div>
  );
}