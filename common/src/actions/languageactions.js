import {
    FETCH_LANGUAGE,
    FETCH_LANGUAGE_SUCCESS,
    FETCH_LANGUAGE_FAILED
} from "../store/types";

export const fetchLanguageFiles = () => (dispatch) => async (firebase) => {
    const {
        config
    } = firebase;

    dispatch({
        type: FETCH_LANGUAGE,
        payload: null
    });

    const response = await fetch(`https://${config.projectId}.web.app/get_languages`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const json = await response.json();
    if (json) {
        dispatch({
            type: FETCH_LANGUAGE_SUCCESS,
            payload: {
                json: json,
                defaultLanguage: Object.values(json)[0]
            }
        });
    } else {
        dispatch({
            type: FETCH_LANGUAGE_FAILED,
            payload: "Language fetch failed"
        });
    }
};
