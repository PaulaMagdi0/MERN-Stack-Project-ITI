import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contact from "./components/Contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Footer from "./components/footer/Footer";
import Navbar from "./components/nav/Navbar";
import SingleAuthor from "./pages/singleAuthor/SingleAuthor";
import SingleBook from "./pages/singlebook/SingleBooks";
import Books from "./pages/books/Books";
import AboutAs from "./components/aboutas/About";
import NotFound from "./pages/notFound/NotFound";
import SignUp from "./pages/signUp/SignUp";
import SignIn from "./pages/login/Login";
import  Dashboard from "./pages/dashBoard/DashBoard"
import  Wishlist from "./pages/wishlist/WishList"
import RequireAuth from "./utils/WithGuard"
import ProfilePage from "./pages/Profile/Profile"
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/about" element={<AboutAs />} />
        <Route path="/wishlist" element={<Wishlist />} />
        
        {/* Protect Dashboard route with RequireAuth */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/books/:id" element={<SingleBook />} />
        <Route path="/books" element={<Books />} />
        <Route path="/author/:id" element={<SingleAuthor />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
