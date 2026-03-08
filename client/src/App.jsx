import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

import HomePage from './pages/marketing/HomePage'
import AboutUsPage from './pages/marketing/AboutUsPage'

import DashboardPage from './pages/user/DashboardPage'
import FavoritesPage from './pages/user/FavoritesPage'
import MyEventsPage from './pages/user/MyEventsPage'
import MyAccountPage from './pages/user/MyAccountPage'
import OrganizerEventAnalyticsPage from './pages/user/OrganizerEventAnalyticsPage'
import OrganizerSignupPage from './pages/user/OrganizerSignupPage'

import BrowseEventsPage from './pages/events/BrowseEventsPage'
import EventsPage from './pages/events/EventsPage'
import EventDetailsPage from './pages/events/EventDetailsPage'
import CreateEventPage from './pages/events/CreateEventPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'

import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminProtectedRoute from './components/routing/AdminProtectedRoute'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <NotificationProvider>
    <Routes>
      <Route element={<AppLayout />}>
        
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/browse" element={<BrowseEventsPage />} />
        <Route path="/events/:id" element={<ErrorBoundary><EventDetailsPage /></ErrorBoundary>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute>
              <MyEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events/:eventId/analytics"
          element={
            <ProtectedRoute>
              <OrganizerEventAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer-signup"
          element={
            <ProtectedRoute>
              <OrganizerSignupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
      </Route>
    </Routes>
    </NotificationProvider>
  )
}

export default App