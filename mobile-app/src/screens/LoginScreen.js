import React, { useState, useRef, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    Image,
    ActivityIndicator,
    Platform
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { TouchableOpacity } from "react-native-gesture-handler";
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../common/theme';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import RNPickerSelect from 'react-native-picker-select';

import i18n from 'i18n-js';

export default function EmailLoginScreen(props) {
    const { api, config } = useContext(FirebaseContext);
    const {
        signIn,
        sendResetMail,
        clearLoginError,
        requestPhoneOtpDevice,
        mobileSignIn,
        checkUserExists,
        countries
    } = api;
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }

    const [state, setState] = useState({
        email: '',
        password: '',
        customStyleIndex: 0,
        phoneNumber: null,
        verificationId: null,
        verificationCode: null,
        countryCodeList: formatCountries(),
        countryCode: null
    });

    const emailInput = useRef(null);
    const passInput = useRef(null);
    const pageActive = useRef(false);
    const [loading, setLoading] = useState(false);
    const recaptchaVerifier = useRef(null);

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setState({ ...state, countryCode: settings.country + " (+" + countries[i].phone + ")" })
                }
            }
        }
    }, [settings]);

    useEffect(() => {
        if (auth.info && pageActive.current) {
            pageActive.current = false;
            props.navigation.navigate('AuthLoading');
            setLoading(false);
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== t('not_logged_in')) {
            pageActive.current = false;
            setState({ ...state, verificationCode: '' });
            if (auth.error.msg.message === t('require_approval')){
                Alert.alert(t('alert'), t('require_approval'));
            } else if(auth.error.msg.message === t('reset_pass_msg')){
                Alert.alert(t('alert'), t('reset_pass_msg'));
            } else if(auth.error.msg.message === t('email_verify_message')){
                Alert.alert(t('alert'), t('email_verify_message'));
            } else{
                Alert.alert(t('alert'), t('login_error'));
            }
            dispatch(clearLoginError());
            setLoading(false);
        }
        if (auth.verificationId) {
            pageActive.current = false;
            setState({ ...state, verificationId: auth.verificationId });
            setLoading(false);
        }
    }, [auth.info, auth.error, auth.error.msg, auth.verificationId]);

    const onPressLogin = async () => {
        setLoading(true);
        if (state.countryCode && state.countryCode !== t('select_country')) {
            if (state.phoneNumber) {
                let formattedNum = state.phoneNumber.replace(/ /g, '');
                formattedNum = state.countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                if (formattedNum.length > 8) {
                    checkUserExists({ mobile: formattedNum }).then((res) => {
                        if (res.users && res.users.length > 0) {
                            pageActive.current = true;
                            dispatch(requestPhoneOtpDevice(formattedNum, recaptchaVerifier.current));
                        }
                        else {
                            setLoading(false);
                            Alert.alert(t('alert'), t('user_does_not_exists'));
                        }
                    });
                } else {
                    Alert.alert(t('alert'), t('mobile_no_blank_error'));
                    setLoading(false);
                }
            } else {
                Alert.alert(t('alert'), t('mobile_no_blank_error'));
                setLoading(false);
            }
        } else {
            Alert.alert(t('alert'), t('country_blank_error'));
            setLoading(false);
        }
    }

    const onSignIn = async () => {
        setLoading(true);
        pageActive.current = true;
        dispatch(mobileSignIn(
            state.verificationId,
            state.verificationCode
        ));
    }

    const CancelLogin = () => {
        setState({
            ...state,
            phoneNumber: null,
            verificationId: null,
            verificationCode: null
        });
    }

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email);
        if (!emailValid) {
            emailInput.current.focus();
            setLoading(false);
            Alert.alert(t('alert'), t('valid_email_check'));
        }
        return emailValid;
    }

    const onAction = async () => {
        setLoading(true);
        const { email, password } = state;
        if (validateEmail(email)) {
            if (password != '') {
                pageActive.current = true;
                dispatch(signIn(email, password));
                setState({
                    ...state,
                    email: '',
                    password: ''
                });
                emailInput.current.focus();
            } else {
                passInput.current.focus();
                setLoading(false);
                Alert.alert(t('alert'), t('password_blank_messege'));
            }
        }

    }

    const Forgot_Password = async (email) => {
        if (validateEmail(email)) {
            Alert.alert(
                t('forgot_password_link'),
                t('forgot_password_confirm'),
                [
                    { text: t('cancel'), onPress: () => { }, style: 'cancel', },
                    {
                        text: t('ok'),
                        onPress: () => {
                            pageActive.current = true;
                            dispatch(sendResetMail(email));
                        },
                    }
                ],
                { cancelable: true },
            )
        }
    }

    const handleCustomIndexSelect = (index) => {
        setState({ ...state, customStyleIndex: index });
    };


    return (

        <KeyboardAvoidingView behavior={"position"} style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/bg.jpg')}
                resizeMode="stretch"
                style={styles.imagebg}
            >
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={config}
                />
                <View style={styles.topBar}>
                    <TouchableOpacity style={[styles.backButton,{alignSelf: isRTL==true ? 'flex-end': 'flex-start'}]} onPress={() => { props.navigation.navigate('Intro') }}>
                    <Ionicons name = {isRTL ? "chevron-forward-outline":"chevron-back-outline"}  size={40} color="black" />
                    </TouchableOpacity>
                </View>
                <SegmentedControlTab
                    values={[t('email_login'), t('mobile_login_title')]}
                    selectedIndex={state.customStyleIndex}
                    onTabPress={handleCustomIndexSelect}
                    borderRadius={0}
                    tabsContainerStyle={styles.segmentcontrol}
                    tabStyle={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        borderColor: 'transparent',
                    }}
                    activeTabStyle={{ borderBottomColor: colors.BACKGROUND, backgroundColor: 'transparent', borderBottomWidth: 2, marginTop: 2 }}
                    tabTextStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                    activeTabTextStyle={{ color: colors.BACKGROUND }}
                />
                {state.customStyleIndex == 0 ?
                    <View style={styles.box1}>
                        <TextInput
                            ref={emailInput}
                            style={[styles.textInput,{textAlign:isRTL? "right":"left"}]}
                            placeholder={t('email_placeholder')}
                            onChangeText={(value) => setState({ ...state, email: value })}
                            value={state.email}
                        />
                    </View>
                    : null}
                {state.customStyleIndex == 0 ?
                    <View style={styles.box2}>
                        <TextInput
                            ref={passInput}
                            style={[styles.textInput,{textAlign:isRTL? "right":"left"}]}
                            placeholder={t('password_placeholder')}
                            onChangeText={(value) => setState({ ...state, password: value })}
                            value={state.password}
                            secureTextEntry={true}
                        />
                    </View>
                    : null}
                {state.customStyleIndex == 0 ?
                    <MaterialButtonDark
                        onPress={onAction}
                        style={styles.materialButtonDark}
                    >{t('login_button')}</MaterialButtonDark>
                    : null}
                {state.customStyleIndex == 0 ?
                    <View style={styles.linkBar}>
                        <TouchableOpacity style={styles.barLinks} onPress={() => Forgot_Password(state.email)}>
                            <Text style={styles.linkText}>{t('forgot_password_link')}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                {state.customStyleIndex != 0 ?
                    <View style={[styles.box1]}>
                        <RNPickerSelect
                            placeholder={{ label: t('select_country'), value: t('select_country') }}
                            value={state.countryCode}
                            useNativeAndroidPickerStyle={false}
                            style={{
                                inputIOS: [styles.pickerStyle,{textAlign:isRTL? "right":"left"}],
                                inputAndroid: [styles.pickerStyle,{textAlign:isRTL? "right":"left"}]
                            }}
                            onValueChange={(value) => setState({ ...state, countryCode: value })}
                            items={state.countryCodeList}
                            disabled={!!state.verificationId || !settings.AllowCountrySelection ? true : false}
                        />
                    </View>
                    : null}
                {state.customStyleIndex != 0 ?
                    <View style={styles.box2}>
                        <TextInput
                            style={[styles.textInput,{textAlign:isRTL? "right":"left"}]}
                            placeholder={t('mobile_no_placeholder')}
                            onChangeText={(value) => setState({ ...state, phoneNumber: value })}
                            value={state.phoneNumber}
                            editable={!!state.verificationId ? false : true}
                            keyboardType="phone-pad"
                        />
                    </View>
                    : null}
                {state.customStyleIndex != 0 ? state.verificationId ? null :
                    <MaterialButtonDark
                        onPress={onPressLogin}
                        style={styles.materialButtonDark}
                    >{t('request_otp')}</MaterialButtonDark>
                    : null}
                {state.customStyleIndex != 0 && !!state.verificationId ?
                    <View style={styles.box2}>
                        <TextInput
                            style={[styles.textInput,{textAlign:isRTL? "right":"left"}]}
                            placeholder={t('otp_here')}
                            onChangeText={(value) => setState({ ...state, verificationCode: value })}
                            value={state.verificationCode}
                            ditable={!!state.verificationId}
                            keyboardType="phone-pad"
                            secureTextEntry={true}
                        />
                    </View>
                    : null}
                {state.customStyleIndex != 0 && !!state.verificationId ?
                    <MaterialButtonDark
                        onPress={onSignIn}
                        style={styles.materialButtonDark}
                    >{t('authorize')}</MaterialButtonDark>
                    : null}
                {state.verificationId ?
                    <View style={styles.actionLine}>
                        <TouchableOpacity style={styles.actionItem} onPress={CancelLogin}>
                            <Text style={styles.actionText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                {loading ?
                    <View style={styles.loading}>
                        <ActivityIndicator color={colors.BLACK} size='large' />
                    </View>
                    : null}
            </ImageBackground>
        </KeyboardAvoidingView>

    );
}

const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40
    },
    container: {
        flex: 1,
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height + (Platform.OS == 'android'? 40 :0),
    },
    topBar: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: (Dimensions.get('window').height * 0.52) + (Platform.OS == 'android'? 40 :0),
    },
    backButton: {
        height: 40,
        width: 40,
        marginTop: 30,
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50,
        marginLeft: 35,
        marginRight: 35
    },

    box1: {
        height: 35,
        backgroundColor: colors.WHITE,
        marginTop: 26,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: colors.BORDER_BACKGROUND,
        justifyContent: 'center'
    },
    box2: {
        height: 35,
        backgroundColor: colors.WHITE,
        marginTop: 12,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: colors.BORDER_BACKGROUND,
        justifyContent: 'center'
    },
    textInput: {
        color: colors.BACKGROUND,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        //textAlign: "left",
        marginTop: 8,
        marginLeft: 5
    },
    materialButtonDark: {
        height: 35,
        marginTop: 22,
        marginLeft: 35,
        marginRight: 35,
        backgroundColor: colors.BUTTON,
    },
    linkBar: {
        flexDirection: "row",
        marginTop: 30,
        alignSelf: 'center'
    },
    barLinks: {
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    linkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.WHITE,
        fontFamily: "Roboto-Bold",
    },
    pickerStyle: {
        color: colors.BACKGROUND,
        fontFamily: "Roboto-Regular",
        fontSize: 18,
        marginLeft: 5,
    },

    actionLine: {
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    actionItem: {
        height: 20,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontWeight: 'bold'
    }
});