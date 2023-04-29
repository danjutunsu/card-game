const Reducers = () => {

const initialState = {
    userId: 0
  };
  
  function rootReducer(state = initialState, action: { type: any; payload: any; }) {
    switch (action.type) {
      case 'INCREMENT_COUNTER':
        return {
          ...state,
          counter: state.userId + 1
        };
      default:
        return state;
    }
  }
}
  export default Reducers
  