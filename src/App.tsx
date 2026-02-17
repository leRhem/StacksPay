import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Companies } from './pages/Companies';
import { CompanyDetails } from './pages/Dashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { Settings } from './pages/Settings';
import { StacksProvider } from './components/StacksProvider';
import { NavBar } from './components/NavBar';
import { Overview } from './pages/Overview';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <StacksProvider>
      <ToastProvider>
        <Router>
          <NavBar />
          <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId" element={<CompanyDetails />} />
          <Route path="/claim/:companyId" element={<EmployeeDashboard />} />
          
          <Route path="/settings" element={<Settings />} />
          
          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </ToastProvider>
    </StacksProvider>
  );
}

export default App;
