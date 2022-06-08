const fetch = require("node-fetch");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const GOOGLE_MAP_SERVER_KEY = require('./googlemapapiconfig');

const validateFirebaseIdToken = async (authorization) => {
    if(authorization && authorization.startsWith('Bearer ')){
        token = authorization.split('Bearer ')[1];
        try {
            const user = await admin.auth().verifyIdToken(token);
            return user;
          } catch (error) {
            return false;
          }
    }else{
        return false;
    }
};

exports.autocomplete = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateFirebaseIdToken(request.headers.authorization);
    if(user){
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${request.body.searchKeyword}&key=${GOOGLE_MAP_SERVER_KEY}`;
        let res = await fetch(url);
        let json = await res.json();
        if (json.predictions) {
            response.send({searchResults: json.predictions});
        }else{
            response.send({ error: 'Places API : No predictions found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getcoords = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateFirebaseIdToken(request.headers.authorization);
    if(user){
        let url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${request.body.place_id}&key=${GOOGLE_MAP_SERVER_KEY}`;
        let res = await fetch(url);
        let json = await res.json();
        if (json.results && json.results.length > 0 && json.results[0].geometry) {
            response.send({coords:json.results[0].geometry.location});
        }else{
            response.send({ error: 'Geocode API : Place to Coordinate Error' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getaddress = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateFirebaseIdToken(request.headers.authorization);
    if(user){
        let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${request.body.latlng}&key=${GOOGLE_MAP_SERVER_KEY}`;
        let res = await fetch(url);
        let json = await res.json();
        if (json.results && json.results.length > 0 && json.results[0].formatted_address) {
            response.send({
                address:json.results[0].formatted_address
            });
        }else{
            response.send({ error: 'Geocode API : Coordinates to Address Error' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getroute = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateFirebaseIdToken(request.headers.authorization);
    if(user){
        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${request.body.start}&destination=${request.body.dest}&key=${GOOGLE_MAP_SERVER_KEY}`;
        let res = await fetch(url);
        let json = await res.json();
        if (json.routes && json.routes.length > 0) {
            response.send({
                distance:(json.routes[0].legs[0].distance.value / 1000),
                duration:json.routes[0].legs[0].duration.value,
                polylinePoints:json.routes[0].overview_polyline.points
            });
        }else{
            response.send({ error: 'Directions API : No Route Found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getdrivetime = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateFirebaseIdToken(request.headers.authorization);
    if(user){
        let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${request.body.start}&destinations=${request.body.dest}&key=${GOOGLE_MAP_SERVER_KEY}`;
        let res = await fetch(url);
        let json = await res.json();
        if (json.rows && json.rows.length > 0 && json.rows[0].elements.length > 0 && json.rows[0].elements[0] && json.rows[0].elements[0].distance) {
            response.send({
                distance_in_km: json.rows[0].elements[0].distance.value / 1000,
                time_in_secs: json.rows[0].elements[0].duration.value,
                timein_text: json.rows[0].elements[0].duration.text
            });
        }else{
            response.send({ error: 'Distance MAtrix API : No Route Found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getmultiloctime = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateFirebaseIdToken(request.headers.authorization);
    if(user){
        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${request.body.start}&destination=${request.body.dest}&waypoints=${request.body.waypoints}&key=${GOOGLE_MAP_SERVER_KEY}`;
        let res = await fetch(url);
        let json = await res.json();
        if (json.routes && json.routes.length > 0) {
            const legs =  json.routes[0].legs;
            let distance = 0;
            let duration = 0;
            for(let i = 0; i<legs.length; i++){
                distance = distance + legs[i].distance.value;
                duration = duration + legs[i].duration.value;
            }
            response.send({
                distance_in_km:(distance / 1000),
                time_in_secs:duration.value,
                polylinePoints:json.routes[0].overview_polyline.points
            });
        }else{
            response.send({ error: 'Directions API : No Route Found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});
