import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Rides from './pages/Rides';
import AllRides from './pages/AllRides';
import Drivers from './pages/Drivers';
import Passengers from './pages/Passengers';
import Referrals from './pages/Referrals';
import Streams from './pages/Streams';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="rides" element={<Rides />} />
            <Route path="all-rides" element={<AllRides />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="passengers" element={<Passengers />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="streams" element={<Streams />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
