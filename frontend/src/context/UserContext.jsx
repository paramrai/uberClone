import React, { createContext, useState } from "react";

export const UserDataContext = createContext();

const userContext = ({ children }) => {
  const [user, setUser] = useState({});

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default userContext;