import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        navigate("/login");
      }

      await axios
        .get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
          headers: { authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.status === 200) {
            setUser(response.data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          localStorage.removeItem("token");
          navigate("/login");
          setIsLoading(false);
        });
    }
    fetchUser();
  }, [token]);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator here while waiting for user data.
  }

  return <div>{children}</div>;
};

export default UserProtectWrapper;
