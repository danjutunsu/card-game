// src/store.ts

import { createStore } from 'redux';

export type AppState = {
  userId: string;
};

const getInitialState = () => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {
    userId: '',
  };
};

const rootReducer = (state: AppState = getInitialState(), action: any) => {
  switch (action.type) {
    case 'SET_USER_ID':
      const newState = {
        ...state,
        userId: action.payload,
      };
      localStorage.setItem('appState', JSON.stringify(newState));
      return newState;
    default:
      return state;
  }
};

export const store = createStore(rootReducer);
