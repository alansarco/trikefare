import { useState } from "react";

// @mui material components
import Checkbox from "@mui/material/Checkbox";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import logo from "assets/images/logotransparent.png";

// react-router-dom components
import { Link, useNavigate, Navigate  } from "react-router-dom";
import { useStateContext } from "context/ContextProvider";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import FixedLoading from "components/General/FixedLoading";
import { useSignInData } from "./data/signinRedux";
import MainLoading from "components/General/MainLoading";
import { passToSuccessLogs, passToErrorLogs } from "components/Api/Gateway";
import { isEmpty } from "components/General/Utils"; 
import { messages } from "components/General/Messages";
import { apiRoutes } from "components/Api/ApiRoutes";

function SignIn() {
  const currentFileName = "layouts/authentication/sign-in/index.js";
  const {token,  setUser, setRole, setAccess, setToken} = useStateContext(); 
  const [submitLogin, setSubmitLogin] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    access_level: 999,
  });

  const navigate = useNavigate(); 

  if (token) {
    return <Navigate to="/dashboard" />
  }
  
  const { isLoading, status} = useSignInData();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    toast.dismiss();
    if(isEmpty(formData.username) || isEmpty(formData.password)) {
      toast.warning(messages.required, { autoClose: true });
    }
    else {
      setSubmitLogin(true);
      try {
        const response = await axios.post(apiRoutes.login, formData);
        let token = response.data.access_token;
        passToSuccessLogs(response.data.message, currentFileName);
        if (token) {
          setToken(token);
          setUser(response.data.user);
          setRole(response.data.role);
          setAccess(response.data.access);
          navigate("/dashboard");
        }
        else {  
          toast.error(`${response.data.message}`, { autoClose: true });
        }
      } catch (error) {
          toast.error(`Login Failed! ${error}`, { autoClose: true });
          passToErrorLogs(error, currentFileName);
      }
      setSubmitLogin(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const HandleShowPassword = () => setShowPassword(!showPassword);

  return (
    <>
    {status == 1 && !isLoading ? 
    <>
    {submitLogin && <FixedLoading />}
    <CoverLayout
      title="TRIKEFARE"
      description="Login Account"
      image={logo}
    >
      <SoftBox component="form" role="form" onSubmit={handleSubmit}>
        <SoftBox mb={1} mt={2}>
          <SoftInput placeholder="Email" disabled={submitLogin} size="medium" type="text"  name="username" value={formData.username} onChange={handleChange} className="rounded-pill"/>
        </SoftBox>
        <SoftBox mb={1}>         
          <SoftInput placeholder="Password" disabled={submitLogin} size="medium" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="rounded-pill"/>
        </SoftBox>
        <SoftBox mt={2} mb={1}>
          <SoftButton type="submit" size="medium" variant="gradient" color="error" fullWidth className="rounded-pill">
            Login
          </SoftButton>
        </SoftBox>
        <SoftBox display="flex" className="justify-content-center">
          <SoftTypography 
              py={1}
              className="text-nowrap text-xxs  text-decoration-underline text-center"
              component={Link}
              to="/authentication/forgot-password"
              color="info"
              fontWeight="bold"
              // textGradient
            >
              Forgot Password?
          </SoftTypography> 
        </SoftBox>
        
        <SoftBox display={{ sm: "flex" }} justifyContent="space-between" textAlign={{ xs: "start", sm: "end" }}>
          <SoftBox display="flex" alignItems="center" py={1}>
              <Checkbox checked={showPassword} onChange={HandleShowPassword} />
              <SoftTypography 
                variant="button"
                className="text-xxs text-nowrap"
                color="dark"
                fontWeight="regular"
                onClick={HandleShowPassword}
                sx={{ cursor: "poiner", userSelect: "none" }}
              >
                &nbsp;Show Password
              </SoftTypography>
          </SoftBox>
        </SoftBox>
        <SoftBox mb={1}>
          
        </SoftBox>
      </SoftBox>
      
    </CoverLayout> 
    </> : <MainLoading />
    }
    <ToastContainer
        position="bottom-right"
        autoClose={5000}
        limit={5}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme="light"
      />
    </>
  );
}

export default SignIn;
