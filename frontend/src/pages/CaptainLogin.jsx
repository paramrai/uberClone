import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";
("../context/CapatainContext");

const Captainlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    // clear the error afer 10 seconds
    setTimeout(() => {
      setError(null);
    }, 10000);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    const captain = {
      email: email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        captain
      );

      if (response.status === 200) {
        const data = response.data;

        setCaptain(data.captain);
        localStorage.setItem("captain-token", data.token);
        navigate("/captain-home");
      }
    } catch (error) {
      // set the error
      if (
        error.status === 400 ||
        error.status === 401 ||
        error.status === 404
      ) {
        setError("Invalid email or password");
      } else {
        setError(error.message);
      }
    }
  };
  return (
    <div className="max-w-96 mx-auto">
      <div className="p-7 h-screen flex flex-col justify-between">
        <div>
          <img
            className="w-20 mb-3"
            src="https://www.svgrepo.com/show/505031/uber-driver.svg"
            alt=""
          />

          <form
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <h3 className="text-lg font-medium mb-2">What's your email</h3>
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
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
            {error && (
              <span className="text-red-500 bg-white inline-block w-full text-left py-1">
                {error}
              </span>
            )}
            <button className="bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base">
              Login
            </button>
          </form>
          <p className="text-center">
            Join a fleet?{" "}
            <Link to="/captain-signup" className="text-blue-600">
              Register as a Captain
            </Link>
          </p>
        </div>
        <div>
          <Link
            to="/login"
            className="bg-[#d5622d] flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base"
          >
            Sign in as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Captainlogin;
