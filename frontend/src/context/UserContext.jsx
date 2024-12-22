import React, { createContext, useState } from "react";

export const UserDataContext = createContext();

const userContext = ({ children }) => {
  const [user, setUser] = useState({});

  const updateUser = (user) => {
    setUser(user);
  };

  return (
    <UserDataContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default userContext;
