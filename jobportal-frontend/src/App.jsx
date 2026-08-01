
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App
