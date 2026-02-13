import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Connection from './pages/Connection.jsx';

function Home() {
  return <h1>Home</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connection" element={<Connection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
