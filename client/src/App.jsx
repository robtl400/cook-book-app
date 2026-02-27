import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import PostDetailPage from './pages/PostDetailPage';
import RecipeFormPage from './pages/RecipeFormPage';
import UserProfilePage from './pages/UserProfilePage';
import RecipeBoxDetailPage from './pages/RecipeBoxDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <main className="min-h-screen bg-cream pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route path="/explore" element={<ExplorePage />} />
            <Route
              path="/posts/new"
              element={
                <ProtectedRoute>
                  <RecipeFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route
              path="/posts/:id/edit"
              element={
                <ProtectedRoute>
                  <RecipeFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/:id/cook"
              element={
                <ProtectedRoute>
                  <RecipeFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/users/:id" element={<UserProfilePage />} />
            <Route path="/boxes/:id" element={<RecipeBoxDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
