import React, { useEffect, useState } from "react";
import "./ResetPassword.css"; 
import { useLocation } from "react-router";
import queryString from "query-string"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(
    {
      password:'',
      confirmpassword:''
    }
  );
  const location = useLocation();
  console.log(location);
  const[inValiduser , setinValiduser]=useState('')
  const[busy , setBusy]=useState(true);
  const[error , setError]=useState('');
  const [success , setSuccess]=useState(false);
  const navigate = useNavigate();


  
  const {token , id}=queryString.parse(location.search);

  const verfyToken= async()=>{
    try {
      const {data}= await axios(`http://localhost:5000/users/verify-token?token=${token}&id=${id}`);
      console.log(data);
      setBusy(false);
      
    } catch (error) {
      if(error?.response?.data){
        const {data}=error.response
        if(!data.success) return setinValiduser(data.error);

        return console.log(error.response.data);
        
      }
      console.log(error);
      
    }
  };
  useEffect(()=>{
    verfyToken();
  },[]);


  if (success) 
    return <div className="reset-container">
      <div className="reset-box success-message message-box">
        <h1>password reset successfully !</h1>
      </div>
    </div>;

if (inValiduser) 
  return <div className="reset-container">
    <div className="reset-box error-message message-box">
      <h1>{inValiduser}</h1>
    </div>
  </div>;

if (busy) 
  return <div className="reset-container">
    <div className="reset-box loading-message message-box">
      <h1>Wait for a moment verfiying reset token...</h1>
    </div>
  </div>;
  const handleOnChang = ({target}) => {
    const {name , value}=target;
    setNewPassword({...newPassword, [name]:value})

  };
  const handleReset =async e => {
    e.preventDefault();
    const {password , confirmpassword}=newPassword;
    if(password.trim().length <8 || password.trim().length  > 20){
      return setError('Password must be 8 to 20 chars')

    }
    if(password !==confirmpassword){
      return setError('Password does not match')
    }
    try {
      setBusy(true);
      const {data}= await axios.post(`http://localhost:5000/users/reset-password?token=${token}&id=${id}` , {password});
      console.log(data);
      setBusy(false);
      if(data.success) {
        navigate('/reset-password');
        setSuccess(true);
      }
      
    } catch (error) {
      if(error?.response?.data){
        const {data}=error.response
        if(!data.success) return setinValiduser(data.error);

        return console.log(error.response.data);
        
      }
      console.log(error);
      
    }

  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2 className="reset-title">Reset Password</h2>
<form onSubmit={handleReset}>
        <div>
          <label className="reset-label">New Password</label>
          <input
            type="password"
            className="reset-input"
            name="password"
            value={newPassword.password}
            onChange={handleOnChang}
          />
         {error && <p>{error}</p>}
        </div>

        <div>
          <label className="reset-label">Confirm New Password</label>
          <input
            type="password"
            className="reset-input"
            value={newPassword.confirmpassword}
            name="confirmpassword"
            onChange={handleOnChang}
          />
        </div>

        <button className="reset-button" onClick={handleReset} type="submit">
          Reset
        </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
