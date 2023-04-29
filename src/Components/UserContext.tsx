import React, { createContext } from 'react';

export type UserContextType = {
    user: string;
    setUser: (c: string) => void
  }

const UserContext = createContext<UserContextType>({
    user: '1',
    setUser: () => {}
});

export default UserContext;
