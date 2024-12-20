import React from "react";
import { Route, Routes } from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainSignup from "./pages/CaptainSignup";
import UserProtectWrapper from "./pages/UserProtectWrapper";
import UserLogout from "./pages/UserLogout";
import CaptainLogout from "./pages/CaptainLogout";
import CaptainHome from "./pages/CaptainHome";
import "remixicon/fonts/remixicon.css";
import CaptainProtectWrappper from "./pages/CaptainProtectWrappper";
import CaptainRiding from "./pages/CaptainRiding";
import Riding from "./pages/Riding";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Start />} />

        {/* // user routes  */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          }
        />
        <Route path="/riding" element={<Riding />} />

        {/* captain routes  */}
        <Route path="/captain-login" element={<CaptainLogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrappper>
              <CaptainHome />
            </CaptainProtectWrappper>
          }
        />
        <Route
          path="/captain-logout"
          element={
            <CaptainProtectWrappper>
              <CaptainLogout />
            </CaptainProtectWrappper>
          }
        />

        <Route path="/captain-riding" element={<CaptainRiding />} />
      </Routes>
    </>
  );
};

export default App;
