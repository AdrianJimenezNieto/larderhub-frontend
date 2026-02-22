import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HouseholdsPage from '../pages/HouseholdsPage';
import ShoppingListPage from '../pages/ShoppingListPage';

export const router = createBrowserRouter([
  // --- Public routes ---
  { path: '/', element: <LandingPage /> },

  // --- Guest-only routes ---
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // --- Protected routes (requires JWT) ---
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/households', element: <HouseholdsPage /> },
      { path: '/shopping-list', element: <ShoppingListPage /> },
    ],
  },
]);


