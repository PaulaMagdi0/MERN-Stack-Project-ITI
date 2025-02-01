import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/Footer";
import Contact from "./components/Contact/Contact";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/footer" element={<Footer />} />
        <Route path="/Contact" element={<Contact/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
