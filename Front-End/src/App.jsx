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
import { useEffect , useState } from "react";
import ResetPassword from "./pages/restartpassword/ResetPassword";
import ForgetPassword from "./pages/forgetpassword/ForgetPassword";
import  Dashboard from "./pages/dashBoard/DashBoard"
import  Wishlist from "./pages/wishlist/WishList"
import RequireAuth from "./utils/WithGuard"
import ProfilePage from "./pages/Profile/Profile"
import axios from "axios";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  

  useEffect(() => {
      const checkToken = async () => {
          const token = localStorage.getItem("token");
          if (!token) {
              setIsAuthenticated(false);
              return;
          }

          try {
              const response = await axios.post("http://localhost:5000/auth/validate-token", {}, {
                  headers: { Authorization: `Bearer ${token}` }
              });

              if (response.data.valid) {
                  setIsAuthenticated(true);
              } else {
                  setIsAuthenticated(false);
                  localStorage.removeItem("token"); 
              }
          } catch (error) {
              console.error("there is error when check on token", error);
              setIsAuthenticated(false);
              localStorage.removeItem("token");
          }
      };

      checkToken();
  }, []);

  if (isAuthenticated === null) {
      return <h2>check token .....</h2>;
  }


  return (
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
