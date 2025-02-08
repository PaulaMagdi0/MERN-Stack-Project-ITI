import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/Footer";
import Contact from "./components/contact/Contact";
import MainPage from "./pages/mainPage/MainPage";
import Navbar from "./components/nav/Navbar";
import "./App.css";
import NotFound from "./pages/notFound/NotFound";
import SignUp from "./pages/signUp/SignUp";
import SignIn from "./pages/login/Login";
import { useDispatch, useSelector } from "react-redux";
import { useEffect , useState } from "react";
import { authAction } from "./store/auth";
import ResetPassword from "./pages/restartpassword/ResetPassword";
import ForgetPassword from "./pages/forgetpassword/ForgetPassword";

function App() {
  const dispatch = useDispatch();
  const role= useSelector((state)=>state.auth.role);
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
