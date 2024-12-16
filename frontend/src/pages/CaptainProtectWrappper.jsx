import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainProtectWrappper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState();

  useEffect(() => {
    if (!token) {
      navigate("/captain-login");
    }

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captain/profile`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 200) {
          setCaptain(response.data.captain);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        localStorage.removeItem("token");
        navigate("/captain-login");
        setIsLoading(false);
      });

    if (isLoading) {
      return <div>Loading...</div>; // Show loading indicator here while waiting for user data.
    }
  }, [token]);

  isLoading ? <div>Loading...</div> : <div>{children}</div>;
};

export default CaptainProtectWrappper;
