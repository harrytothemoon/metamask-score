import React, { useState } from 'react';
import PriceImpactCalculator from './components/PriceImpactCalculator';

function App() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            交易對價格影響查詢
          </h1>
          <p className="text-white/80 text-lg">
            查看不同金額下的價格影響
          </p>
        </div>
        
        <PriceImpactCalculator />
        
        <footer className="mt-12 text-center text-white/60 text-sm">
          <p>數據來源：1inch API</p>
          <p className="mt-2">僅供參考，實際價格可能有所不同</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

