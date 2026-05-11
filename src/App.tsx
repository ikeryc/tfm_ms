import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './routes/Home';
import { Analisis } from './routes/Analisis';
import { Demo } from './routes/Demo';
import { TreasuryProvider } from './context/TreasuryContext';

export default function App() {
  return (
    <TreasuryProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analisis" element={<Analisis />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TreasuryProvider>
  );
}
