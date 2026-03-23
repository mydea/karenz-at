import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import TimelinePage from './pages/TimelinePage';
import CalculatorPage from './pages/CalculatorPage';
import FaqPage from './pages/FaqPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="einstellungen" element={<SettingsPage />} />
          <Route path="zeitplan" element={<TimelinePage />} />
          <Route path="rechner" element={<CalculatorPage />} />
          <Route path="faq" element={<FaqPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
