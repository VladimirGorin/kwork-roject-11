import { 
    FETCH_LANGUAGE,
    FETCH_LANGUAGE_SUCCESS,
    FETCH_LANGUAGE_FAILED
  } from "../store/types";
  
  export const INITIAL_STATE = {
    json:null,
    loading: false,
    error:{
      flag:false,
      msg: null
    }
  }
  
  export const languagereducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case FETCH_LANGUAGE:
        return {
          ...state,
          loading:true
        };
      case FETCH_LANGUAGE_SUCCESS:
        return {
          ...state,
          json: action.payload.json,
          defaultLanguage: action.payload.defaultLanguage,
          loading:false
        };
      case FETCH_LANGUAGE_FAILED:
        return {
          ...state,
          json:null,
          loading:false,
          error:{
            flag:true,
            msg:action.payload
          }
        };
      default:
        return state;
    }
  };