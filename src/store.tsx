// src/store.ts

import { createStore } from 'redux';

export type AppState = {
  userId: string;
  userId2: string;
  genre: string;
  uuid: string;
  gameId: number;
};

const getInitialState = () => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {
    userId: localStorage.getItem('userId') || '', // Retrieve userId from localStorage
    userId2: localStorage.getItem('userId2') || '', // Retrieve userId2 from localStorage
    genre: localStorage.getItem('genre') || '', // Retrieve genre from localStorage
    uuid: localStorage.getItem('uuid') || '', // Retrieve uuid from localStorage
    gameId: localStorage.getItem('gameId') || '' // Retrieve gameId from localStorage
  };
};


const rootReducer = (state: AppState = getInitialState(), action: any) => {
  switch (action.type) {
    case 'SET_USER_ID':
      const newUserIdState = {
        ...state,
        userId: action.payload,
      };
      localStorage.setItem('appState', JSON.stringify(newUserIdState)); // Update localStorage
      return newUserIdState;
    case 'SET_USER_ID_2':
      const newUserId2State = {
        ...state,
        userId2: action.payload,
      };
      localStorage.setItem('appState', JSON.stringify(newUserId2State)); // Update localStorage
      return newUserId2State;
    case 'SET_GENRE':
      const newUserGenre = {
        ...state,
        genre: action.payload,
      };
      localStorage.setItem('appState', JSON.stringify(newUserGenre)); // Update localStorage
      return newUserGenre;
    case 'SET_UUID':
      const newUserUUID = {
        ...state,
        uuid: action.payload,
      };
      localStorage.setItem('appState', JSON.stringify(newUserUUID)); // Update localStorage
      return newUserUUID;
    case 'SET_GAMEID':
      const newUserGameId = {
        ...state,
        gameId: action.payload,
      };
      localStorage.setItem('appState', JSON.stringify(newUserGameId)); // Update localStorage
      return newUserGameId;
    default:
      return state;
  }
};
// 
export const store = createStore(rootReducer);
