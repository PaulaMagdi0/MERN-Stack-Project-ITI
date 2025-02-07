import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthContextProvider from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/footer/Footer";
import Contact from "./components/Contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Navbar from "./components/nav/Navbar";
import store from "./store/store";
import { Provider } from "react-redux";
import SubscriptionPlans from "./pages/subscriptionPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import SingleAuthor from "./pages/singleAuthor/SingleAuthor";
import SingleBook from "./pages/singlebook/SingleBooks";
import Books from "./pages/books/Books";
import AboutAs from "./components/aboutas/About";
import Payment from "./pages/payment/paymentPage"
import "./App.css";
import NotFound from "./pages/notFound/NotFound";
import SignUp from "./pages/signUp/SignUp";
import SignIn from "./pages/login/Login";
import  Dashboard from "./pages/dashBoard/DashBoard"
import  Wishlist from "./pages/wishlist/WishList"

function App() {
  return (
    
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={< SignUp/>} />
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<MainPage/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/subscriptions" element={<SubscriptionPlans />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<PaymentSuccess />} />
      </Routes>
      <Footer />
    </BrowserRouter>
    
  );
}

export default App;
