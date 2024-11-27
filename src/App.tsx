import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import AuthForm from './components/AuthForm';
import FriendsList from './components/FriendsList';
import ChatRoom from './components/ChatRoom';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/friends" /> : <AuthForm />}
        />
        <Route
          path="/friends"
          element={user ? <FriendsList /> : <Navigate to="/" />}
        />
        <Route
          path="/chat/:friendId"
          element={user ? <ChatRoom /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;