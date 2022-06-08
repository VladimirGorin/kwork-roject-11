import {
  FETCH_ESTIMATE,
  FETCH_ESTIMATE_SUCCESS,
  FETCH_ESTIMATE_FAILED,
  CLEAR_ESTIMATE
} from "../store/types";
import Polyline from '@mapbox/polyline';

import { FareCalculator } from '../other/FareCalculator';

export const getEstimate = (bookingData) => (dispatch) => async (firebase) => {
  const   {
      settingsRef
  } = firebase;

  dispatch({
    type: FETCH_ESTIMATE,
    payload: bookingData,
  });
          

  let res = bookingData.routeDetails;

  if(res){
    let points = Polyline.decode(res.polylinePoints);

    let waypoints = points.map((point) => {
        return {
            latitude: point[0],
            longitude: point[1]
        }
    });
    
    settingsRef.once("value", settingdata => {
      let settings = settingdata.val();
      let distance = settings.convert_to_mile? (res.distance / 1.609344) : res.distance;

      let fareCalculation = FareCalculator(distance, res.duration, bookingData.carDetails, bookingData.instructionData);

      dispatch({
        type: FETCH_ESTIMATE_SUCCESS,
        payload: {
          pickup:bookingData.pickup,
          drop:bookingData.drop,
          bookLater: bookingData.bookLater,
          bookingDate: bookingData.bookingDate,
          carDetails:bookingData.carDetails,
          instructionData: bookingData.instructionData,
          estimateDistance: parseFloat(distance).toFixed(2),
          fareCost: fareCalculation ? parseFloat(fareCalculation.totalCost).toFixed(2) : 0,
          estimateFare: fareCalculation ? parseFloat(fareCalculation.grandTotal).toFixed(2) : 0,
          estimateTime:res.duration,
          convenience_fees: fareCalculation ? parseFloat(fareCalculation.convenience_fees).toFixed(2) : 0,
          waypoints: waypoints
        },
      });
    });
  }else{
    dispatch({
      type: FETCH_ESTIMATE_FAILED,
      payload: "No Route Found",
    });
  }

}

export const clearEstimate = () => (dispatch) => (firebase) => {
    dispatch({
        type: CLEAR_ESTIMATE,
        payload: null,
    });    
}
