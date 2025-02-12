import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SubscriptionPlans from './components/subscription/subscriptionPlan';
import Payment from './pages/payment/payment';
import PaymentSuccess from './pages/payment/paymentSuccess';
import Footer from "./components/footer/Footer";
import Contact from "./components/Contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Navbar from "./components/nav/Navbar";
import SingleAuthor from "./pages/singleAuthor/SingleAuthor";
import SingleBook from "./pages/singlebook/SingleBooks";
import Books from "./pages/books/Books";
import AboutAs from "./components/aboutas/About";
import NotFound from "./pages/notFound/NotFound";
import SignUp from "./pages/signUp/SignUp";
import SignIn from "./pages/login/Login";
import ResetPassword from "./pages/restartpassword/ResetPassword";
import ForgetPassword from "./pages/forgetpassword/ForgetPassword";
import Dashboard from "./pages/dashBoard/DashBoard";
import Wishlist from "./pages/wishlist/WishList";
import RequireAuth from "./utils/WithGuard";
import RequireLogged from "./utils/WithGuardForLogging";
import ProfilePage from "./pages/Profile/Profile";
import ChatBot from "./components/chat/Chat";

const stripePromise = loadStripe('pk_test_51QoOUWJabCknvdkPxNb7EyCRhTCMJsEZYxKY96rQN7pLfxQykWbk1dHhZCPmSfKLUUmfcZgUPeLWXyrItwpwwc6k00v1YWuxir');

function App() {
  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <Navbar />
        <ChatBot />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/about" element={<AboutAs />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Routes Restricted to Logged-In Users */}
          <Route path="/contact" element={<RequireLogged><Contact /></RequireLogged>} />
          <Route path="/wishlist" element={<RequireLogged><Wishlist /></RequireLogged>} />
          <Route path="/profile" element={<RequireLogged><ProfilePage /></RequireLogged>} />
          <Route path="/subscription-plans" element={<RequireLogged><SubscriptionPlans /></RequireLogged>} />
          <Route path="/payment/:planID" element={<RequireLogged><Payment /></RequireLogged>} />
          <Route path="/success" element={<RequireLogged><PaymentSuccess /></RequireLogged>} />

          {/* Authenticated Admin Only Routes */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

          {/* Catch-All Route */}
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<SingleBook />} />
          <Route path="/author/:id" element={<SingleAuthor />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </Elements>
  );
}

export default App;
