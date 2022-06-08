import React, { useEffect, useState, useRef, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    Platform,
    Alert,
    ScrollView,
    StatusBar
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon, Tooltip, Button } from 'react-native-elements';
import { colors } from '../common/theme';
import * as Location from 'expo-location';
var { height, width } = Dimensions.get('window');
import i18n from 'i18n-js';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector, useDispatch } from 'react-redux';
import { NavigationEvents } from 'react-navigation';
import { FirebaseContext } from 'common/src';
import { OptionModal } from '../components/OptionModal';
import { LoadingModal } from '../components/LoadingModal';
import BookingModal from '../components/BookingModal';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';  

const hasNotch = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((height === 780 || width === 780) || (height === 812 || width === 812) || (height === 844 || width === 844) || (height === 896 || width === 896) || (height === 926 || width === 926))

export default function MapScreen(props) {
    const { api, appcat } = useContext(FirebaseContext);
    const {
        fetchAddressfromCoords,
        fetchDrivers,
        updateTripPickup,
        updateTripDrop,
        updatSelPointType,
        getDriveTime,
        GetDistance,
        MinutesPassed,
        updateTripCar,
        getEstimate,
        getRouteDetails,
        clearEstimate,
        addBooking,
        clearBooking,
        clearTripPoints
    } = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const cars = useSelector(state => state.cartypes.cars);
    const tripdata = useSelector(state => state.tripdata);
    const drivers = useSelector(state => state.usersdata.users);
    const estimatedata = useSelector(state => state.estimatedata);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const gps = useSelector(state => state.gpsdata);

    const latitudeDelta = 0.0922;
    const longitudeDelta = 0.0421;

    const [allCarTypes, setAllCarTypes] = useState([]);
    const [freeCars, setFreeCars] = useState([]);
    const [pickerConfig, setPickerConfig] = useState({
        selectedDateTime: new Date(),
        dateModalOpen: false,
        dateMode: 'date'
    });
    const [loadingModal, setLoadingModal] = useState(false);
    const [region, setRegion] = useState(null);
    const pageActive = useRef(false);
    const [optionModalStatus, setOptionModalStatus] = useState(false);
    const [bookingDate, setBookingDate] = useState(null);
    const [bookingModalStatus, setBookingModalStatus] = useState(false);
    const [bookLoading, setBookLoading] = useState(false);
    const [bookLaterLoading, setBookLaterLoading] = useState(false);

    const instructionInitData = {
        deliveryPerson: "",
        deliveryPersonPhone: "",
        pickUpInstructions: "",
        deliveryInstructions: "",
        parcelTypeIndex: 0,
        optionIndex: 0,
        parcelTypeSelected: null,
        optionSelected: null
    };
    const [instructionData, setInstructionData] = useState(instructionInitData);
    const bookingdata = useSelector(state => state.bookingdata);
    const [locationRejected, setLocationRejected] = useState(false);
    const mapRef = useRef();
    const [dragging,setDragging] = useState(0);

    useEffect(() => {
        if (cars) {
            resetCars();
        }
    }, [cars]);

    useEffect(() => {
        if (tripdata.pickup && drivers) {
            getDrivers();
        }
        if (tripdata.pickup && !drivers) {
            resetCars();
            setFreeCars([]);
        }
    }, [drivers, tripdata.pickup]);

    useEffect(() => {
        if (estimatedata.estimate) {
            setBookingModalStatus(true);
            setBookLoading(false);
            setBookLaterLoading(false);
        }
        if (estimatedata.error && estimatedata.error.flag) {
            setBookLoading(false);
            setBookLaterLoading(false);
            Alert.alert(estimatedata.error.msg);
            dispatch(clearEstimate());
        }
    }, [estimatedata.estimate, estimatedata.error, estimatedata.error.flag]);

    useEffect(() => {
        if (tripdata.selected && tripdata.selected == 'pickup' && tripdata.pickup && tripdata.pickup.source == 'search') {
            mapRef.current.animateToRegion(
            {
                latitude: tripdata.pickup.lat,
                longitude: tripdata.pickup.lng,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta
            });
        }
        if (tripdata.selected && tripdata.selected == 'drop' && tripdata.drop && tripdata.drop.source == 'search') {
             mapRef.current.animateToRegion({
                latitude: tripdata.drop.lat,
                longitude: tripdata.drop.lng,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta
            });
        }
    }, [tripdata.selected, tripdata.pickup, tripdata.drop]);

    useEffect(() => {
        if (bookingdata.booking) {
            const bookingStatus = bookingdata.booking.mainData.status;
            if (bookingStatus == 'PAYMENT_PENDING') {
                props.navigation.navigate('PaymentDetails', { booking: bookingdata.booking.mainData });
            } else {
                props.navigation.navigate('BookedCab', { bookingId: bookingdata.booking.booking_id });
            }
            dispatch(clearEstimate());
            dispatch(clearBooking());
        }
        if (bookingdata.error && bookingdata.error.flag) {
            Alert.alert(bookingdata.error.msg);
            dispatch(clearBooking());
        }
    }, [bookingdata.booking, bookingdata.error, bookingdata.error.flag]);

    useEffect(() => {
        setInterval(() => {
            if (pageActive.current) {
                dispatch(fetchDrivers());
            }
        }, 30000);
    }, [])

    useEffect(() => {
        if (gps.location) {
            if (gps.location.lat && gps.location.lng) {
                setDragging(0);
                if(region){
                    mapRef.current.animateToRegion({
                        latitude: gps.location.lat,
                        longitude: gps.location.lng,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    });
                }
                else{
                    setRegion({
                        latitude: gps.location.lat,
                        longitude: gps.location.lng,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    });
                }
                updateAddresses({
                    latitude: gps.location.lat,
                    longitude: gps.location.lng
                }, region?'gps': 'init');
            } else {
                setLocationRejected(true);
                setLoadingModal(false);
            }
        }
    }, [gps.location]);

    const resetCars = () => {
        let carWiseArr = [];
        for (let i = 0; i < cars.length; i++) {
            let temp = { ...cars[i], minTime: '', available: false, active: false };
            carWiseArr.push(temp);
        }
        setAllCarTypes(carWiseArr);
    }

    const resetActiveCar = () => {
        let carWiseArr = [];
        for (let i = 0; i < allCarTypes.length; i++) {
            let temp = { ...allCarTypes[i], active: false };
            carWiseArr.push(temp);
        }
        setAllCarTypes(carWiseArr);
    }

    const locateUser = async () => {
        if (tripdata.selected == 'pickup') {
            let tempWatcher = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.Balanced
            }, location => {
                dispatch({
                  type: 'UPDATE_GPS_LOCATION',
                  payload: {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                  }
                });
                tempWatcher.remove();
            })
        }
    }

    const updateAddresses = async (pos, source) => {
        let latlng = pos.latitude + ',' + pos.longitude;
        setLoadingModal(true);
        fetchAddressfromCoords(latlng).then((res) => {
            if (res) {
                if (tripdata.selected == 'pickup') {
                    dispatch(updateTripPickup({
                        lat: pos.latitude,
                        lng: pos.longitude,
                        add: res,
                        source: source
                    }));
                    if (source == 'init') {
                        dispatch(updateTripDrop({
                            lat: pos.latitude,
                            lng: pos.longitude,
                            add: null,
                            source: source
                        }));
                    }
                } else {
                    dispatch(updateTripDrop({
                        lat: pos.latitude,
                        lng: pos.longitude,
                        add: res,
                        source: source
                    }));
                }
            }
            setLoadingModal(false);
        });
    }



    const onRegionChangeComplete = (newregion, gesture) => {
        if (gesture && gesture.isGesture)  {
            updateAddresses({
                latitude: newregion.latitude,
                longitude: newregion.longitude
            }, 'region-change');
        }
    }

    const selectCarType = (value, key) => {
        let carTypes = allCarTypes;
        for (let i = 0; i < carTypes.length; i++) {
            carTypes[i].active = false;
            if (carTypes[i].name == value.name) {
                carTypes[i].active = true;
                let instObj = { ...instructionData };
                if (Array.isArray(carTypes[i].parcelTypes)) {
                    instObj.parcelTypeSelected = carTypes[i].parcelTypes[0];
                    instObj.parcelTypeIndex = 0;
                }
                if (Array.isArray(carTypes[i].options)) {
                    instObj.optionSelected = carTypes[i].options[0];
                    instObj.optionIndex = 0;
                }
                setInstructionData(instObj);
            } else {
                carTypes[i].active = false;
            }
        }
        dispatch(updateTripCar(value));
    }

    const getDrivers = async () => {
        if (tripdata.pickup) {
            let availableDrivers = [];
            let arr = {};
            let startLoc = '"' + tripdata.pickup.lat + ', ' + tripdata.pickup.lng + '"';
            for (let i = 0; i < drivers.length; i++) {
                let driver = { ...drivers[i] };
                if ((driver.usertype) && (driver.usertype == 'driver') && (driver.approved == true) && (driver.queue == false) && (driver.driverActiveStatus == true)) {
                    if (driver.location) {
                        let distance = GetDistance(tripdata.pickup.lat, tripdata.pickup.lng, driver.location.lat, driver.location.lng);
                        if (settings.convert_to_mile) {
                            distance = distance / 1.609344;
                        }
                        if (distance < ((settings && settings.driverRadius) ? settings.driverRadius : 10)) {
                            let destLoc = '"' + driver.location.lat + ', ' + driver.location.lng + '"';
                            driver.arriveDistance = distance;
                            driver.arriveTime = settings.AllowCriticalEditsAdmin ? await getDriveTime(startLoc, destLoc) : { timein_text: ((distance * 2) + 1).toFixed(0) + ' min'}
                            for (let i = 0; i < cars.length; i++) {
                                if (cars[i].name == driver.carType) {
                                    driver.carImage = cars[i].image;
                                }
                            }
                            let carType = driver.carType;
                            if (arr[carType] && arr[carType].drivers) {
                                arr[carType].drivers.push(driver);
                                if (arr[carType].minDistance > distance) {
                                    arr[carType].minDistance = distance;
                                    arr[carType].minTime = driver.arriveTime.timein_text;
                                }
                            } else {
                                arr[carType] = {};
                                arr[carType].drivers = [];
                                arr[carType].drivers.push(driver);
                                arr[carType].minDistance = distance;
                                arr[carType].minTime = driver.arriveTime.timein_text;
                            }
                            availableDrivers.push(driver);

                        }
                    }
                }
            }
            let carWiseArr = [];

            for (let i = 0; i < cars.length; i++) {
                let temp = { ...cars[i] };
                if (arr[cars[i].name]) {
                    temp['nearbyData'] = arr[cars[i].name].drivers;
                    temp['minTime'] = arr[cars[i].name].minTime;
                    temp['available'] = true;
                } else {
                    temp['minTime'] = '';
                    temp['available'] = false;
                }
                temp['active'] = (tripdata.carType && (tripdata.carType.name == cars[i].name)) ? true : false;
                carWiseArr.push(temp);
            }

            setFreeCars(availableDrivers);
            setAllCarTypes(carWiseArr);
            setLoadingModal(false);
        }
    }

    const tapAddress = (selection) => {
        if (selection === tripdata.selected) {
            let savedAddresses = [];
            let allAddresses = auth.info.profile.savedAddresses;
            for (let key in allAddresses) {
                savedAddresses.push(allAddresses[key]);
            }
            if (selection == 'drop') {
                props.navigation.navigate('Search', { locationType: "drop", savedAddresses: savedAddresses });
            } else {
                props.navigation.navigate('Search', { locationType: "pickup", savedAddresses: savedAddresses });
            }
        } else {
            setDragging(0)
            if (selection == 'drop') {
                 mapRef.current.animateToRegion({
                    latitude: tripdata.drop.lat,
                    longitude: tripdata.drop.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            } else {
                 mapRef.current.animateToRegion({
                    latitude: tripdata.pickup.lat,
                    longitude: tripdata.pickup.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
            dispatch(updatSelPointType(selection));
        }

    };

    //Go to confirm booking page
    const onPressBook = async () => {
        setBookLoading(true);
        if (tripdata.pickup && tripdata.drop && tripdata.drop.add) {
            if (!tripdata.carType) {
                setBookLoading(false);
                Alert.alert(t('alert'), t('car_type_blank_error'))
            } else {
                let driver_available = false;
                for (let i = 0; i < allCarTypes.length; i++) {
                    let car = allCarTypes[i];
                    if (car.name == tripdata.carType.name && car.minTime) {
                        driver_available = true;
                        break;
                    }
                }
                if (driver_available) {
                    setBookingDate(null);
                    if ((Array.isArray(tripdata.carType.options) || Array.isArray(tripdata.carType.parcelTypes)) && appcat == 'delivery') {
                        setOptionModalStatus(true);
                        setBookLoading(false);
                    } else {
                        const startLoc = '"' + tripdata.pickup.lat + ',' + tripdata.pickup.lng + '"';
                        const destLoc = '"' + tripdata.drop.lat + ',' + tripdata.drop.lng + '"';
                        const routeDetails = await getRouteDetails(startLoc, destLoc);
                        const estimateObject = {
                            bookLater: false,
                            bookingDate: bookingDate,
                            pickup: { coords: { lat: tripdata.pickup.lat, lng: tripdata.pickup.lng }, description: tripdata.pickup.add },
                            drop: { coords: { lat: tripdata.drop.lat, lng: tripdata.drop.lng }, description: tripdata.drop.add },
                            carDetails: tripdata.carType,
                            platform: Platform.OS,
                            routeDetails: routeDetails
                        };
                        if (appcat == 'delivery') {
                            estimateObject['instructionData'] = instructionData;
                        }
                        dispatch(getEstimate(estimateObject));
                    }
                } else {
                    Alert.alert(t('alert'), t('no_driver_found_alert_messege'));
                    setBookLoading(false);
                }
            }
        } else {
            Alert.alert(t('alert'), t('drop_location_blank_error'));
            setBookLoading(false);
        }
    }


    const onPressBookLater = () => {
        if (tripdata.pickup && tripdata.drop && tripdata.drop.add) {
            if (tripdata.carType) {
                setPickerConfig({
                    dateMode: 'date',
                    dateModalOpen: true,
                    selectedDateTime: pickerConfig.selectedDateTime
                });
            } else {
                Alert.alert(t('alert'), t('car_type_blank_error'))
            }
        } else {
            Alert.alert(t('alert'), t('drop_location_blank_error'))
        }
    }

    const hideDatePicker = () => {
        setPickerConfig({
            dateModalOpen: false,
            selectedDateTime: pickerConfig.selectedDateTime,
            dateMode: 'date'
        })
    };

    const handleDateConfirm = (date) => {
        if (pickerConfig.dateMode === 'date') {
            setPickerConfig({
                dateModalOpen: false,
                selectedDateTime: date,
                dateMode: pickerConfig.dateMode
            })
            setTimeout(() => {
                setPickerConfig({
                    dateModalOpen: true,
                    selectedDateTime: date,
                    dateMode: 'time'
                })
            }, 1000);
        } else {
            setPickerConfig({
                dateModalOpen: false,
                selectedDateTime: date,
                dateMode: 'date'
            });
            setBookLaterLoading(true);
            setTimeout(async () => {
                const diffMins = MinutesPassed(date);
                if (diffMins < 15) {
                    setBookLaterLoading(false);
                    Alert.alert(
                        t('alert'),
                        t('past_booking_error'),
                        [
                            { text: "OK", onPress: () => { } }
                        ],
                        { cancelable: true }
                    );
                } else {
                    setBookingDate(date);
                    if ((Array.isArray(tripdata.carType.options) || Array.isArray(tripdata.carType.parcelTypes)) && appcat == 'delivery') {
                        setOptionModalStatus(true);
                        setBookLaterLoading(false);
                    } else {
                        const startLoc = '"' + tripdata.pickup.lat + ',' + tripdata.pickup.lng + '"';
                        const destLoc = '"' + tripdata.drop.lat + ',' + tripdata.drop.lng + '"';
                        const routeDetails = await getRouteDetails(startLoc, destLoc);
                        const estimateObject = {
                            bookLater: true,
                            bookingDate: bookingDate,
                            pickup: { coords: { lat: tripdata.pickup.lat, lng: tripdata.pickup.lng }, description: tripdata.pickup.add },
                            drop: { coords: { lat: tripdata.drop.lat, lng: tripdata.drop.lng }, description: tripdata.drop.add },
                            carDetails: tripdata.carType,
                            platform: Platform.OS,
                            routeDetails: routeDetails
                        };
                        if (appcat == 'delivery') {
                            estimateObject['instructionData'] = instructionData;
                        }
                        dispatch(getEstimate(estimateObject));
                    }
                }
            }, 1000);
        }
    };

    const handleGetEstimate = async () => {
        setOptionModalStatus(false);
        const startLoc = '"' + tripdata.pickup.lat + ',' + tripdata.pickup.lng + '"';
        const destLoc = '"' + tripdata.drop.lat + ',' + tripdata.drop.lng + '"';
        const routeDetails = await getRouteDetails(startLoc, destLoc);
        const estimateObject = {
            bookLater: bookingDate ? true : false,
            bookingDate: bookingDate,
            pickup: { coords: { lat: tripdata.pickup.lat, lng: tripdata.pickup.lng }, description: tripdata.pickup.add },
            drop: { coords: { lat: tripdata.drop.lat, lng: tripdata.drop.lng }, description: tripdata.drop.add },
            carDetails: tripdata.carType,
            instructionData: instructionData,
            platform: Platform.OS,
            routeDetails: routeDetails
        };
        dispatch(getEstimate(estimateObject));
    }

    const handleParcelTypeSelection = (value) => {
        setInstructionData({
            ...instructionData,
            parcelTypeIndex: value,
            parcelTypeSelected: tripdata.carType.parcelTypes[value]
        });
    }

    const handleOptionSelection = (value) => {
        setInstructionData({
            ...instructionData,
            optionIndex: value,
            optionSelected: tripdata.carType.options[value]
        });
    }

    const onModalCancel = () => {
        setInstructionData(instructionInitData);
        dispatch(updateTripCar(null));
        setBookingModalStatus(false);
        setOptionModalStatus(false);
        resetActiveCar();
    }

    const bookNow = () => {
        if (appcat == 'delivery') {
            const regx1 = /([0-9\s-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
            if (/\S/.test(instructionData.deliveryPerson) && regx1.test(instructionData.deliveryPersonPhone) && instructionData.deliveryPersonPhone && instructionData.deliveryPersonPhone.length > 6) {
                dispatch(addBooking({
                    pickup: estimatedata.estimate.pickup,
                    drop: estimatedata.estimate.drop,
                    carDetails: estimatedata.estimate.carDetails,
                    userDetails: auth.info,
                    estimate: estimatedata.estimate,
                    instructionData: instructionData,
                    tripdate: estimatedata.estimate.bookLater ? new Date(estimatedata.estimate.bookingDate).getTime() : new Date().getTime(),
                    bookLater: estimatedata.estimate.bookLater,
                    settings: settings,
                    booking_type_admin: false
                }));
                setInstructionData(instructionInitData);
                dispatch(clearTripPoints());
                setBookingModalStatus(false);
                setOptionModalStatus(false);
                resetCars();
            } else {
                Alert.alert(t('alert'), t('deliveryDetailMissing'));
            }
        } else {
            dispatch(addBooking({
                pickup: estimatedata.estimate.pickup,
                drop: estimatedata.estimate.drop,
                carDetails: estimatedata.estimate.carDetails,
                userDetails: auth.info,
                estimate: estimatedata.estimate,
                tripdate: estimatedata.estimate.bookLater ? new Date(estimatedata.estimate.bookingDate).getTime() : new Date().getTime(),
                bookLater: estimatedata.estimate.bookLater,
                settings: settings,
                booking_type_admin: false
            }));
            dispatch(clearTripPoints());
            setBookingModalStatus(false);
            resetCars();
        }
    };

    return (
        <View style={styles.container}>
            <NavigationEvents
                onDidFocus={payload => {
                    pageActive.current = true;
                }}
                onWillBlur={payload => {
                    pageActive.current = false;
                }}
            />
            <StatusBar hidden={true} />
            <View style={styles.mapcontainer}>
                {region ?
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation={true}
                        loadingEnabled
                        showsMyLocationButton={false}
                        style={styles.mapViewStyle}
                        initialRegion={region}
                        onRegionChangeComplete={onRegionChangeComplete}
                        onPanDrag={()=>setDragging(30)}
                    >
                        {freeCars ? freeCars.map((item, index) => {
                            return (
                                <Marker.Animated
                                    coordinate={{ latitude: item.location ? item.location.lat : 0.00, longitude: item.location ? item.location.lng : 0.00 }}
                                    key={index}
                                >
                                    <Image
                                        key={index}
                                        source={{ uri: item.carImage }}
                                        style={{ height: 40, width: 40, resizeMode: 'contain' }}
                                    />
                                </Marker.Animated>

                            )
                        })
                        : null}
                    </MapView>
                    : null}
                {region ?
                    tripdata.selected == 'pickup' ?
                        <View pointerEvents="none" style={styles.mapFloatingPinView}>
                            <Image pointerEvents="none" style={[styles.mapFloatingPin,{ marginBottom: Platform.OS =='ios'? (hasNotch? (-10 + dragging) :33): 40}]} resizeMode="contain" source={require('../../assets/images/green_pin.png')} />
                        </View>
                        :
                        <View pointerEvents="none" style={styles.mapFloatingPinView}>
                            <Image pointerEvents="none" style={[styles.mapFloatingPin,{ marginBottom: Platform.OS =='ios'? (hasNotch? (-10 + dragging) :33): 40}]} resizeMode="contain" source={require('../../assets/images/rsz_2red_pin.png')} />
                        </View>
                    : null}
                {tripdata.selected == 'pickup' ?
                    <View style={styles.locationButtonView}>
                        <TouchableOpacity onPress={locateUser} style={styles.locateButtonStyle}>
                            <Icon
                                name='gps-fixed'
                                color={"#666699"}
                                size={26}
                            />
                        </TouchableOpacity>
                    </View>
                    : null}
                {locationRejected ?
                    <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                        <Text>{t('location_permission_error')}</Text>
                    </View>
                    : null}
            </View>
            <View style={styles.buttonBar}>
                <Button
                    title={t('book_later_button')}
                    loading={bookLaterLoading}
                    loadingProps={{ size: "large", color: colors.WHITE }}
                    titleStyle={styles.buttonTitleStyle}
                    onPress={onPressBookLater}
                    buttonStyle={[styles.buttonStyle, { backgroundColor: colors.BUTTON_BACKGROUND }]}
                    containerStyle={styles.buttonContainer}
                />
                <Button
                    title={t('book_now_button')}
                    loading={bookLoading}
                    loadingProps={{ size: "large", color: colors.WHITE }}
                    titleStyle={styles.buttonTitleStyle}
                    onPress={onPressBook}
                    buttonStyle={[styles.buttonStyle, { backgroundColor: appcat == 'taxi' ? colors.BUTTON_YELLOW : colors.BUTTON_ORANGE }]}
                    containerStyle={styles.buttonContainer}
                />
            </View>
            <View style={[styles.menuIcon, isRTL ? {right:20}:{left:20}]}>
                <TouchableOpacity onPress={() => { props.navigation.toggleDrawer() }} style={styles.menuIconButton} >
                    <Icon
                        name='menu'
                        type='ionicon'
                        color='#517fa4'
                        size={32}
                    />
                </TouchableOpacity>
            </View>
            {activeBookings && activeBookings.length >= 1 ?
                <View style={isRTL ? styles.topTitle1 : styles.topTitle}>
                    <TouchableOpacity onPress={() => {
                        props.navigation.navigate('RideList');
                    }}>
                        <Text style={{ marginHorizontal: 7, textAlign: 'center', color: '#517fa4', fontFamily: 'Roboto-Bold', fontSize: 14 }}>{t('active_booking')} - {activeBookings.length} </Text>

                    </TouchableOpacity>
                </View>
                :
                <View style={[isRTL ? styles.topTitle1 : styles.topTitle, { width: 110 }]}>
                    <Text style={{ marginHorizontal: 7, textAlign: 'center', color: '#517fa4', fontFamily: 'Roboto-Bold', fontSize: 18, }}>{t('home')}</Text>
                </View>
            }
            <View style={[styles.addressBar,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                <View style={styles.ballandsquare}>
                    <View style={styles.hbox1} /><View style={styles.hbox2} /><View style={styles.hbox3} />
                </View>
                <View style={styles.contentStyle, isRTL? {paddingRight: 10} : {paddingLeft: 10}}>
                    <TouchableOpacity onPress={() => tapAddress('pickup')} style={styles.addressStyle1}>
                        <Text numberOfLines={1} style={[styles.textStyle, tripdata.selected == 'pickup' ? { fontSize: 18 }:{ fontSize: 14 },{textAlign:isRTL? "right":"left"} ]}>{tripdata.pickup && tripdata.pickup.add ? tripdata.pickup.add : t('map_screen_where_input_text')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => tapAddress('drop')} style={styles.addressStyle2}>
                        <Text numberOfLines={1} style={[styles.textStyle, tripdata.selected == 'drop' ? { fontSize: 18 }:{ fontSize: 14 },{textAlign:isRTL? "right":"left"} ]}>{tripdata.drop && tripdata.drop.add ? tripdata.drop.add : t('map_screen_drop_input_text')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.fullCarView}>
                <ScrollView horizontal={true} style={styles.fullCarScroller} showsHorizontalScrollIndicator={false}>
                    {allCarTypes.map((prop, key) => {
                        return (
                            <View key={key} style={[styles.cabDivStyle, { backgroundColor: prop.active == true ? colors.BOX_BG : colors.WHITE }]}>
                                <TouchableOpacity onPress={() => { selectCarType(prop, key) }} style={styles.imageStyle}>
                                    <Image resizeMode="contain" source={prop.image ? { uri: prop.image } : require('../../assets/images/microBlackCar.png')} style={styles.imageStyle1} />
                                </TouchableOpacity>
                                <View style={styles.textViewStyle}>
                                    <Text style={styles.text1}>{prop.name.toUpperCase()}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                        {isRTL?
                                            null:
                                            <Text style={[styles.text2, { fontWeight: 'bold', color: colors.MAP_TEXT }]}>{settings.symbol}{prop.rate_per_unit_distance} / {settings.convert_to_mile ? t('mile') : t('km')} </Text>
                                        }
                                        {
                                            prop.extra_info && prop.extra_info != '' ?

                                                <Tooltip style={{ marginLeft: 3, marginRight: 3 }}
                                                    backgroundColor={"#fff"}
                                                    overlayColor={'rgba(50, 50, 50, 0.70)'}
                                                    height={10 + 30 * (prop.extra_info.split(',').length)}
                                                    width={180}
                                                    skipAndroidStatusBar={true}
                                                    popover={
                                                        <View style={{ justifyContent: 'space-around', flexDirection: 'column' }}>
                                                            {
                                                                prop.extra_info.split(',').map((ln) => <Text key={ln} >{ln}</Text>)
                                                            }
                                                        </View>
                                                    }>
                                                    <Icon
                                                        name='information-circle-outline'
                                                        type='ionicon'
                                                        color='#517fa4'
                                                        size={28}
                                                    />
                                                </Tooltip>

                                                : null
                                        }
                                        {isRTL?
                                            <Text style={[styles.text2, { fontWeight: 'bold', color: colors.MAP_TEXT }]}>{settings.symbol}{prop.rate_per_unit_distance} / {settings.convert_to_mile ? t('mile') : t('km')} </Text>
                                            :null
                                        }
                                    </View>
                                    <View style={{ flexDirection: 'row', }}>
                                        <Text style={styles.text2}>({prop.minTime != '' ? prop.minTime : t('not_available')})</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
            <LoadingModal loadingModal={loadingModal} />
            {appcat == 'delivery' ?
                <OptionModal
                    settings={settings}
                    tripdata={tripdata}
                    instructionData={instructionData}
                    optionModalStatus={optionModalStatus}
                    onPressCancel={onModalCancel}
                    handleGetEstimate={handleGetEstimate}
                    handleParcelTypeSelection={handleParcelTypeSelection}
                    handleOptionSelection={handleOptionSelection}
                />
                : null}
            <BookingModal
                settings={settings}
                tripdata={tripdata}
                estimate={estimatedata.estimate}
                instructionData={instructionData}
                setInstructionData={setInstructionData}
                bookingModalStatus={bookingModalStatus}
                bookNow={bookNow}
                onPressCancel={onModalCancel}
            />
            <DateTimePickerModal
                date={pickerConfig.selectedDateTime}
                minimumDate={new Date()}
                isVisible={pickerConfig.dateModalOpen}
                mode={pickerConfig.dateMode}
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    menuIcon: {
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: colors.WHITE,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: hasNotch ? 40 : 20
    },
    menuIconButton: {
        flex: 1,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topTitle: {
        height: 50,
        width: 180,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
        justifyContent: 'center',
        position: 'absolute',
        right: 0,
        top: hasNotch ? 40 : 20
    },
    topTitle1: {
        height: 50,
        width: 180,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'center',
        position: 'absolute',
        left:0,
        top: hasNotch ? 40 : 20
    },
    mapcontainer: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapViewStyle: {
        flex:1,
        ...StyleSheet.absoluteFillObject,
    },
    mapFloatingPinView:{ 
        position: 'absolute', 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    mapFloatingPin:{
        height: 40
    },
    buttonBar: {
        height: 60,
        width: width,
        flexDirection: 'row'
    },
    buttonContainer: {
        width: width / 2,
        height: 60
    },
    buttonStyle: {
        width: width / 2,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 18
    },
    locationButtonView: {
        position: 'absolute',
        height: Platform.OS == 'ios' ? 55 : 42,
        width: Platform.OS == 'ios' ? 55 : 42,
        bottom: 180,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: Platform.OS == 'ios' ? 30 : 3,
        elevation: 2,
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: {
            height: 0,
            width: 0
        },
    },
    locateButtonStyle:{
        height: Platform.OS == 'ios' ? 55 : 42,
        width: Platform.OS == 'ios' ? 55 : 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressBar: {
        position: 'absolute',
        marginHorizontal: 20,
        top: hasNotch ? 100 : 80,
        height: 100,
        width: width - 40,
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        paddingLeft: 10,
        paddingRight: 10,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 3
    },
    ballandsquare: {
        width: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    hbox1: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.GREEN_DOT
    },
    hbox2: {
        height: 36,
        width: 1,
        backgroundColor: colors.MAP_TEXT
    },
    hbox3: {
        height: 12,
        width: 12,
        backgroundColor: colors.DULL_RED
    },
    contentStyle: {
        justifyContent: 'center',
        width: width - 74,
        height: 100
    },
    addressStyle1: {
        borderBottomColor: colors.BLACK,
        borderBottomWidth: 1,
        height: 48,
        width: width - 84,
        justifyContent: 'center',
        paddingTop: 2
    },
    addressStyle2: {
        height: 48,
        width: width - 84,
        justifyContent: 'center',
    },
    textStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        color: '#000'
    },
    fullCarView: {
        position: 'absolute',
        bottom: 60,
        width: width - 10,
        height: 170,
        marginLeft: 5,
        marginRight: 5,
        alignItems: 'center',
    },
    fullCarScroller: {
        width: width - 10,
        height: 160,
        flexDirection: 'row'
    },
    cabDivStyle: {
        backgroundColor: colors.WHITE,
        width: (width - 40) / 3,
        height: '95%',
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        borderRadius: 8,
        elevation: 3,
    },
    imageStyle: {
        height: 50,
        width: 50 * 1.8,
        marginVertical: 20,
        padding: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 5
    },
    imageStyle1: {
        height: 40,
        width: 50 * 1.8
    },
    textViewStyle: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text1: {
        fontFamily: 'Roboto-Bold',
        fontSize: 14,
        fontWeight: '900',
        color: colors.BLACK
    },
    text2: {
        fontFamily: 'Roboto-Regular',
        fontSize: 11,
        fontWeight: '900',
        color: colors.BORDER_TEXT
    },
});
