import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Connection from './pages/Connection.jsx';
import './App.css';
import Home from './pages/Home.jsx';
import LogIn from './pages/LogIn.jsx';
import Register from './pages/Register.jsx';
import CreateListing from './pages/CreateListing.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path='/signup' element={<Register />} />
        <Route path="/connection" element={<Connection />} />
        <Route path="/create" element={<CreateListing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
