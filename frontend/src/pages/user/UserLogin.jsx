import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../../context/UserContext";
import ShowAlert from "../../components/ShowAlert";
import { updateHeight } from "./Home";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const screenRef = useRef(null);

  useEffect(() => {
    updateHeight(screenRef);
    // Add event listener to update height on window resize
    window.addEventListener("resize", () => {
      updateHeight(screenRef);
    });

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", () => {
        updateHeight(screenRef);
      });
    };
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        { email, password }
      );
      if (response.status === 200) {
        // Successful login
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        navigate("/home");
        setUser(user);
        setLoading(false);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      if (error.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong ! Check Network !!!");
      }
      setLoading(false);
    }
  };

  const dismissAlert = () => {
    setError(null);
  };

  return (
    <div className="relative">
      {error && <ShowAlert error={error} dismissAlert={dismissAlert} />}

      <div
        ref={screenRef}
        className="p-7 h-screen flex flex-col justify-between"
      >
        <div>
          <img
            className="w-16 mb-10"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
            alt=""
          />

          <form onSubmit={submitHandler}>
            <h3 className="text-lg font-medium mb-2">What's your email</h3>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
              type="email"
              placeholder="email@example.com"
            />

            <h3 className="text-lg font-medium mb-2">Enter Password</h3>

            <input
              className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
              type="password"
              placeholder="password"
            />

            <button className="bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base">
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
          <p className="text-center">
            New here?{" "}
            <Link to="/signup" className="text-blue-600">
              Create new Account
            </Link>
          </p>
        </div>
        <div>
          <Link
            to="/captain-login"
            className="bg-[#10b461] flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base"
          >
            Sign in as Captain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
