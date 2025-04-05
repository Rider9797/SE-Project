import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes/:id/edit" element={<NoteEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
