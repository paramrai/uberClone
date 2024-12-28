import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("captain-token");
  const navigate = useNavigate();
  const location = useLocation(); // Use location to check the current path

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCaptain() {
      if (!token) {
        navigate("/captain-login");
        setIsLoading(false); // Set loading to false even if there's no token
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captains/profile`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          setCaptain(response.data.captain);
          if (location.pathname !== "/captain-home") {
            navigate("/captain-home");
          }
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem("captain-token");
        navigate("/captain-login");
      } finally {
        setIsLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    }

    fetchCaptain();
  }, [token]);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator here while waiting for captain data.
  }

  return children;
};

export default CaptainProtectWrapper;
