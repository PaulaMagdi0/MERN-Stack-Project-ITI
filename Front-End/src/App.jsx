import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/Footer";
import Contact from "./components/Contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Navbar from "./components/nav/Navbar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/contact" element={<Contact/>} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
