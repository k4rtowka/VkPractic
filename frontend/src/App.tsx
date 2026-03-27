import './App.css';
import { Header } from './components/Header/Header';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { AuthPage } from './pages/AuthPage/AuthPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { SnackbarProvider } from './contexts/SnackbarProvider';
import { QuizLibraryPage } from './pages/QuizLibraryPage/QuizLibraryPage';
import { QuizCreatePage } from './pages/QuizCreatePage/QuizCreatePage';
import { SessionLobbyPage } from './pages/SessionLobbyPage/SessionLobbyPage';
import { QuizJoinPage } from './pages/QuizJoinPage/QuizJoinPage';
import { PlayerWaitingPage } from './pages/PlayerWaitingPage/PlayerWaitingPage';
import { HostGamePage } from './pages/HostGamePage/HostGamePage';
import { PlayerGamePage } from './pages/PlayerGamePage/PlayerGamePage';
import { SessionResultsPage } from './pages/SessionResultsPage/SessionResultsPage';

function App() {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-library"
            element={
              <ProtectedRoute>
                <QuizLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-create"
            element={
              <ProtectedRoute>
                <QuizCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/join"
            element={
              <ProtectedRoute>
                <QuizJoinPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/session/:sessionId/waiting"
            element={
              <ProtectedRoute>
                <PlayerWaitingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/session/:sessionId/lobby"
            element={
              <ProtectedRoute>
                <SessionLobbyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/session/:sessionId/host-game"
            element={
              <ProtectedRoute>
                <HostGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/session/:sessionId/play"
            element={
              <ProtectedRoute>
                <PlayerGamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/session/:sessionId/results"
            element={
              <ProtectedRoute>
                <SessionResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/home" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
