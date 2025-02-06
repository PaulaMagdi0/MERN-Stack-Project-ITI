import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contact from "./components/Contact/Contact"
import MainPage from "./pages/mainPage/MainPage";
import Footer from "./components/footer/Footer";
import Navbar from "./components/nav/Navbar";
import store from "./store/store";
import { Provider } from "react-redux";
import SingleAuthor from "./pages/singleAuthor/SingleAuthor";
import SingleBook from "./pages/singlebook/SingleBooks";
import Books from "./pages/books/Books";
import AboutAs from "./components/aboutas/About";
import "./App.css";
import  Dashboard from "./pages/dashBoard/DashBoard"

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/about" element={<AboutAs/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/books/:id" element= {<SingleBook/>}></Route>
        <Route path="/books" element= {<Books/>}></Route>
        <Route path="/author/:id" element={<SingleAuthor />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
      <Footer />
    </BrowserRouter>
    </Provider>
    
  );
}

export default App;
