// src/store.ts

import { createStore } from 'redux';

export type AppState = {
  userId: string;
};

const initialState: AppState = {
  userId: '',
};

const rootReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'SET_USER_ID':
      return {
        ...state,
        userId: action.payload,
      };
    default:
      return state;
  }
};

export const store = createStore(rootReducer);
