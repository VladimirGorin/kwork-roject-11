export const fetchPlacesAutocomplete = (searchKeyword) => (firebase) => {
    return new Promise((resolve,reject)=>{
        const { auth, config } = firebase;
        auth.currentUser.getIdToken(true).then((token)=>{
            fetch(`https://${config.projectId}.web.app/googleapis-autocomplete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "searchKeyword": searchKeyword
                })
            }).then(response => {
                return response.json();
            })
            .then(json => {
                if(json && json.searchResults) {
                    resolve(json.searchResults);
                }else{
                    reject(json.error);
                }
            }).catch(error=>{
                console.log(error);
                reject("Fetch Call Error")
            })
        }).catch((error)=>{
            console.log(error);
            reject("Unable to get user token");
        });
    });
}

export const fetchCoordsfromPlace = (place_id) => (firebase) => {
    return new Promise((resolve,reject)=>{
        const { auth, config } = firebase;
        auth.currentUser.getIdToken(true).then((token)=>{
            fetch(`https://${config.projectId}.web.app/googleapis-getcoords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "place_id": place_id
                })
            }).then(response => {
                return response.json();
            })
            .then(json => {
                if(json && json.coords) {
                    resolve(json.coords);
                }else{
                    reject(json.error);
                }
            }).catch(error=>{
                console.log(error);
                reject("Fetch Call Error")
            })
        }).catch((error)=>{
            console.log(error);
            reject("Unable to get user token");
        });
    });
}


export const fetchAddressfromCoords = (latlng) => (firebase) => {
    return new Promise((resolve,reject)=>{
        const { auth, config } = firebase;
        auth.currentUser.getIdToken(true).then((token)=>{
            fetch(`https://${config.projectId}.web.app/googleapis-getaddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "latlng": latlng
                })
            }).then(response => {
                return response.json();
            })
            .then(json => {
                if(json && json.address) {
                    resolve(json.address);
                }else{
                    reject(json.error);
                }
            }).catch(error=>{
                console.log(error);
                reject("Fetch Call Error")
            })
        }).catch((error)=>{
            console.log(error);
            reject("Unable to get user token");
        });
    });
}

export const getRouteDetails = (startLoc, destLoc) => (firebase) => {
    return new Promise((resolve,reject)=>{
        const { auth, config } = firebase;
        auth.currentUser.getIdToken(true).then((token)=>{
            fetch(`https://${config.projectId}.web.app/googleapis-getroute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "start": startLoc,
                    "dest": destLoc
                })
            }).then(response => {
                return response.json();
            })
            .then(json => {
                if (json.hasOwnProperty('distance')) {
                    resolve(json);
                }else{
                    console.log(json.error);
                    reject(json.error);
                }
            }).catch(error=>{
                console.log(error);
                reject("Fetch Call Error")
            })
        }).catch((error)=>{
            console.log(error);
            reject("Unable to get user token");
        });
    });
}

export const getDriveTime = (startLoc, destLoc) => (firebase) => {
    return new Promise((resolve,reject)=>{
        const { auth, config } = firebase;
        auth.currentUser.getIdToken(true).then((token)=>{
            fetch(`https://${config.projectId}.web.app/googleapis-getdrivetime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "start": startLoc,
                    "dest": destLoc
                })
            }).then(response => {
                return response.json();
            })
            .then(json => {
                if (json.hasOwnProperty('distance_in_km')) {
                    resolve(json);
                }else{
                    console.log(json.error);
                    reject(json.error);
                }
            }).catch(error=>{
                console.log(error);
                reject("Fetch Call Error")
            })
        }).catch((error)=>{
            console.log(error);
            reject("Unable to get user token");
        });
    });
}

export const getMultiLocTime = (startLoc, destLoc, waypoints) => (firebase) => {
    return new Promise((resolve,reject)=>{
        const { auth, config } = firebase;
        auth.currentUser.getIdToken(true).then((token)=>{
            fetch(`https://${config.projectId}.web.app/googleapis-getmultiloctime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "start": startLoc,
                    "dest": destLoc,
                    "waypoints": waypoints
                })
            }).then(response => {
                return response.json();
            })
            .then(json => {
                if (json.hasOwnProperty('distance_in_km')) {
                    resolve(json);
                }else{
                    console.log(json.error);
                    reject(json.error);
                }
            }).catch(error=>{
                console.log(error);
                reject("Fetch Call Error")
            })
        }).catch((error)=>{
            console.log(error);
            reject("Unable to get user token");
        });
    });
}

