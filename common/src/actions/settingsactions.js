import {
  FETCH_SETTINGS,
  FETCH_SETTINGS_SUCCESS,
  FETCH_SETTINGS_FAILED,
  EDIT_SETTINGS,
  CLEAR_SETTINGS_ERROR
} from "../store/types";

import store from '../store/store';

export const fetchSettings= () => (dispatch) => (firebase) => {

  const {
    settingsRef
  } = firebase;

  dispatch({
    type: FETCH_SETTINGS,
    payload: null,
  });
  settingsRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        payload: snapshot.val(),
      });
    } else {
      dispatch({
        type: FETCH_SETTINGS_FAILED,
        payload: store.getState().languagedata.defaultLanguage.settings_error,
      });
    }
  });
};

export const editSettings = (settings) => (dispatch) => (firebase) => {

  const {
    config,
    settingsRef
  } = firebase;

  if(settings.license){
    try {
      fetch(`https://us-central1-seradd.cloudfunctions.net/baseset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license: settings.license,
          projectId: config.projectId,
          createTime: new Date().toISOString(),
          reqType: 'settings'
        })
      }).then(response => response.json())
        .then((res) => {
          if (res.success) {
            dispatch({
              type: EDIT_SETTINGS,
              payload: settings
            });
            settingsRef.set(settings);
            alert(store.getState().languagedata.defaultLanguage.updated);
          }else{
            alert(store.getState().languagedata.defaultLanguage.wrong_code);
          }
        }).catch(error=>{
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  }else{
    dispatch({
      type: EDIT_SETTINGS,
      payload: settings
    });
    settingsRef.set(settings);
    alert(store.getState().languagedata.defaultLanguage.updated);
  }
};

export const clearSettingsViewError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_SETTINGS_ERROR,
    payload: null
  });
};