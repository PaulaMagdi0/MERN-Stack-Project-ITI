import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/Footer";
import Contact from "./components/Contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Navbar from "./components/nav/Navbar";
import "./App.css";
import store from "./store/store";
import { Provider } from "react-redux";
import SingleAuthor from "./pages/singleAuthor/SingleAuthor";
import SingleBook from "./pages/singlebook/SingleBooks";
import wishlist from "./pages/wishlist/wishlist";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/singlebook/:id" element= {<SingleBook/>}/>
        <Route path="/author/:id" element={<SingleAuthor />} />
        <Route path="/wishlist" element={<wishlist/>}> </Route>
      </Routes>
      <Footer/>
    </BrowserRouter>
    </Provider>
    
  );
}

export default App;
