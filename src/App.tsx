import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { Landing } from './pages/Landing';
import { EventsList } from './pages/EventsList';
import { EventDetail } from './pages/EventDetail';
import { Qualifying } from './pages/Qualifying';
import { Checkout } from './pages/Checkout';
import { Success } from './pages/Success';
import { MyOrders } from './pages/MyOrders';
import { Admin } from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-f1-black flex flex-col carbon-texture">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/event/:eventId" element={<EventDetail />} />
            <Route path="/qualifying" element={<Qualifying />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;