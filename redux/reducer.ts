import {
  FETCH_SCHEMA_REQUEST,
  FETCH_SCHEMA_SUCCESS,
  FETCH_SCHEMA_FAILURE,
} from "./types";

const initialState = {

  schemaSummary: {
    cards: null,
    loading: false,
    error: null,
  },

};

export const mepramReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FETCH_SCHEMA_REQUEST:
          console.log(state.schemaSummary, "state");
      return {
        ...state,
        schemaSummary: {
          ...state.schemaSummary,
          loading: true,
          error: null,
        },
        
      };
    case FETCH_SCHEMA_SUCCESS:
      return {
        ...state,
        schemaSummary: {
          ...state.schemaSummary,
          loading: false,
          cards: action.payload,
        },
      };
    case FETCH_SCHEMA_FAILURE:
      return {
        ...state,
        schemaSummary: {
          ...state.schemaSummary,
          loading: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
};
