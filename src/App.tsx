import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Track from "./components/Track";
import { Toaster } from "sonner";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track" element={<Track />} />
      </Routes>
      <Navbar />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
