'use client';

import { useState } from 'react';
import HotelScene from './components/HotelScene';
import ThreeBodyScene from './components/ThreeBodyScene';

export default function Home() {
  const [activeTab, setActiveTab] = useState('hotel');

  return (
    <main className="w-screen h-screen">
      {/* Tab Navigation */}
      <nav className="absolute top-0 left-0 z-10 p-4">
        <button
          className={`px-4 py-2 mr-2 rounded ${activeTab === 'hotel' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('hotel')}
        >
          Solar Hotel
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'threebody' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('threebody')}
        >
          Three Body
        </button>
      </nav>

      {/* Scene Container */}
      {activeTab === 'hotel' ? <HotelScene /> : <ThreeBodyScene />}
    </main>
  );
}