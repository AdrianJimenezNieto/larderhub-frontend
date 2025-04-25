import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import AppLayout from '../components/AppLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import HouseholdsPage from '../pages/HouseholdsPage';
import ShoppingListPage from '../pages/ShoppingListPage';
import RecipesPage from '../pages/RecipesPage';
import ProfilePage from '../pages/ProfilePage';

export const router = createBrowserRouter([
  // --- Public routes ---
  { path: '/', element: <LandingPage /> },

  // --- Guest-only routes ---
  {
    element: <GuestRoute />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // --- Protected routes with shared AppLayout (BottomNav) ---
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard',     element: <DashboardPage /> },
          { path: '/shopping-list', element: <ShoppingListPage /> },
          { path: '/recipes',       element: <RecipesPage /> },
          { path: '/households',    element: <HouseholdsPage /> },
          { path: '/profile',       element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
