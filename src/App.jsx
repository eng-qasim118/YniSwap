import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import ConnectButton from "./components/ConnectButton";
import AddLiquidity from "./components/AddLiquidity";
import SwapPage from "./components/SwapPage";
import TransferToken from "./components/TransferToken";
import LPTokenPage from "./components/LPTokenPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <NavBar>
          <ConnectButton />
        </NavBar>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<SwapPage />} />
            <Route path="/add-liquidity" element={<AddLiquidity />} />
            <Route path="/pools" element={<div>Pools Page (Coming Soon)</div>} />
            <Route path="/transfer" element={<TransferToken />} />
            <Route path="/lp-token" element={<LPTokenPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
