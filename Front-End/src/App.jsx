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
import  Dashboard from "./pages/dashBoard/DashBoard"
import  Wishlist from "./pages/wishlist/WishList"
import RequireAuth from "./utils/WithGuard"
import ProfilePage from "./pages/Profile/Profile"

const stripePromise = loadStripe('pk_test_51QoOUWJabCknvdkPxNb7EyCRhTCMJsEZYxKY96rQN7pLfxQykWbk1dHhZCPmSfKLUUmfcZgUPeLWXyrItwpwwc6k00v1YWuxir');
// App
function App() {
    
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
  

//   useEffect(() => {
//       const checkToken = async () => {
//           const token = localStorage.getItem("token");
//           if (!token) {
//               setIsAuthenticated(false);
//               return;
//           }

//           try {
//               const response = await axios.post(`${API_URL }/auth/validate-token`, {}, {
//                   headers: { Authorization: `Bearer ${token}` }
//               });

//               if (response.data.valid) {
//                   setIsAuthenticated(true);
//               } else {
//                   setIsAuthenticated(false);
//                   localStorage.removeItem("token"); 
//               }
//           } catch (error) {
//               console.error("there is error when check on token", error);
//               setIsAuthenticated(false);
//               localStorage.removeItem("token");
//           }
//       };

//       checkToken();
//   }, []);

//   if (isAuthenticated === null) {
//       return <h2>check token .....</h2>;
//   }


  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={< SignUp/>} />
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="reset-password" element={<ResetPassword/>}/>
        <Route path="forget-password" element={<ForgetPassword/>}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/about" element={<AboutAs />} />
        <Route path="/wishlist" element={<Wishlist />} />
        
        {/* Protect Dashboard route with RequireAuth */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/books/:id" element={<SingleBook />} />
        <Route path="/books" element={<Books />} />
        <Route path="/author/:id" element={<SingleAuthor />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
    </Elements>
  );
}

export default App;
