// src/store.ts

import { createStore } from 'redux';

export type AppState = {
  userId: string;
  userId2: string
};

const getInitialState = () => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {
    userId: '',
    userId2: ''
  };
};

const rootReducer = (state: AppState = getInitialState(), action: any) => {
  switch (action.type) {
    case 'SET_USER_ID':
      const newUserIdState = {
        ...state,
        userId: action.payload,
      };
      localStorage.setItem('userIdState', JSON.stringify(newUserIdState));
      return newUserIdState;
    case 'SET_USER_ID_2':
      const newUserId2State = {
        ...state,
        userId2: action.payload,
      };
      localStorage.setItem('userId2State', JSON.stringify(newUserId2State));
      return newUserId2State;
    default:
      return state;
  }
};

export const store = createStore(rootReducer);
