import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Connection from './pages/Connection.jsx';
import './App.css';
import Home from './pages/Home.jsx';
import LogIn from './pages/LogIn.jsx';
import Register from './pages/Register.jsx';
import CreateListing from './pages/CreateListing.jsx';
import MyAccount from './pages/MyAccount.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LogIn />} />
          <Route path='/register' element={<Register />} />
          <Route path="/connection" element={<Connection />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/myaccount" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
