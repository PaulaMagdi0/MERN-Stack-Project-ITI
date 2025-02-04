import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/Footer";
import Contact from "./components/contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Navbar from "./components/nav/Navbar";
import NotFound from "./pages/notFound/NotFound";
import DashBoard from "./pages/dashBoard/DashBoard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
