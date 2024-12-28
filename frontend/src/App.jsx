import React from "react";
import { Route, Routes } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import Start from "./pages/Start";
import UserLogin from "./pages/user/UserLogin";
import UserSignup from "./pages/user/UserSignup";
import UserProtectWrapper from "./pages/user/UserProtectWrapper";
import Home from "./pages/user/Home";
import Riding from "./pages/user/Riding";
import Captainlogin from "./pages/captain/CaptainLogin";
import CaptainSignup from "./pages/captain/CaptainSignup";
import CaptainProtectWrapper from "./pages/captain/CaptainProtectWrappper";
import CaptainHome from "./pages/captain/CaptainHome";
import CaptainLogout from "./pages/captain/CaptainLogout";
import CaptainRiding from "./pages/captain/CaptainRiding";
import UserLogout from "./pages/user/UserLogout";

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
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captain-logout"
          element={
            <CaptainProtectWrapper>
              <CaptainLogout />
            </CaptainProtectWrapper>
          }
        />

        <Route
          path="/captain-riding"
          element={
            <CaptainProtectWrapper>
              <CaptainRiding />
            </CaptainProtectWrapper>
          }
        />
      </Routes>
    </>
  );
};

export default App;
