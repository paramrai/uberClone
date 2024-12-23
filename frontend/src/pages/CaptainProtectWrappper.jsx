import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainProtectWrappper = ({ children }) => {
  const token = localStorage.getItem("captain-token");
  const navigate = useNavigate();

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCaptain() {
      if (!token) {
        navigate("/captain-login");
      }

      await axios
        .get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
          headers: { authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.status === 200) {
            setCaptain(response.data.captain);
            navigate("/captain-home");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          localStorage.removeItem("captain-token");
          navigate("/captain-login");
          setIsLoading(false);
        });
    }

    fetchCaptain();
  }, [token, navigate, setCaptain]);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator here while waiting for user data.
  }

  return children;
};

export default CaptainProtectWrappper;
