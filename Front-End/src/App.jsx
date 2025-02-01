import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/footer" element={<Footer />} />
      </Routes>
    </Router>
  );
}

export default App;
