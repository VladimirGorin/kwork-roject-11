import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
import Email from "@material-ui/icons/Email";
import Header from "components/Header/Header.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import styles from "assets/jss/material-kit-react/views/loginPage.js";
import image from "assets/img/background.jpg";
import { useSelector, useDispatch } from "react-redux";
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import AlertDialog from '../components/AlertDialog';
import CountrySelect from '../components/CountrySelect';
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

export default function LoginPage(props) {
  const { api } = useContext(FirebaseContext);
  const { t } = useTranslation();
  const {
    clearLoginError,
    emailSignUp,
    checkUserExists,
    validateReferer,
    signIn,
    countries
  } = api;


  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const dispatch = useDispatch();

  const [state, setState] = React.useState({
    email: '',
    mobile: '',
    password: '',
    firstName: '',
    lastName: '',
    usertype: 'rider',
    referralId: '',
    phone:''
  });

  const [commonAlert, setCommonAlert] = useState({ open: false, msg: '' });
  const [countryCode, setCountryCode] = useState();
  const [mobileWithoutCountry, setMobileWithoutCountry] = useState('');

  useEffect(() => {
    if(settings){
        for (let i = 0; i < countries.length; i++) {
            if(countries[i].label === settings.country){

                setCountryCode(countries[i]);
            }
        }
    }
  }, [settings,countries]);

  const classes = useStyles();
  const { ...rest } = props;

  const onInputChange = (event) => {
    setState({ ...state, [event.target.id]: event.target.value })
  }

  const validateMobile = () => {
    let mobileValid = true;
    if (mobileWithoutCountry.length < 6) {
      mobileValid = false;
      setCommonAlert({ open: true, msg: t('mobile_no_blank_error') })
    }
    if(mobileWithoutCountry.includes('+') || mobileWithoutCountry.includes(' ') || mobileWithoutCountry.includes('-') ){
      mobileValid = false;
      setCommonAlert({ open: true, msg: t('mobile_no_blank_error') })
    }
    return mobileValid;
  }

  const validatePassword = (complexity) => {
    let passwordValid = true;
    const regx1 = /^([a-zA-Z0-9@*#]{6,30})$/
    const regx2 = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/
    if (complexity === 'any') {
      passwordValid = state.password.length >= 1;
      if (!passwordValid) {
        setCommonAlert({ open: true, msg: t('password_blank_messege') })
      }
    }
    else if (complexity === 'alphanumeric') {
      passwordValid = regx1.test(state.password);
      if (!passwordValid) {
        setCommonAlert({ open: true, msg: t('password_alphaNumeric_check') })
      }
    }
    else if (complexity === 'complex') {
      passwordValid = regx2.test(state.password);
      if (!passwordValid) {
        setCommonAlert({ open: true, msg: t('password_complexity_check') })
      }
    }
    return passwordValid
  }

  const handleRegister = (e) => {
    e.preventDefault();
    //eslint-disable-next-line
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (/\S/.test(state.firstName) && state.firstName.length>0 && /\S/.test(state.lastName) && state.lastName.length >0) {
      if (re.test(state.email)) {
        if (validatePassword('alphanumeric')) {
          if (validateMobile()) {
            checkUserExists(state).then((res) => {
              if (res.users && res.users.length > 0) {
                setCommonAlert({ open: true, msg: t('user_exists') })
              }
              else if(res.error){
                setCommonAlert({ open: true, msg: t('email_or_mobile_issue') })
              }
              else{
                if (state.referralId && state.referralId.length > 0) {
                  validateReferer(state.referralId).then((referralInfo) => {
                    if (referralInfo.uid) {
                      emailSignUp({...state, signupViaReferral: referralInfo.uid}).then((res)=>{
                        if(res.uid){
                          settings.email_verify?setCommonAlert({ open: true, msg: t('email_verify_message') }):setCommonAlert({ open: true, msg: t('account_create_successfully') })
                          setTimeout(()=>{
                            dispatch(signIn(state.email,state.password));
                            props.history.push('/login');
                          },3000);
                        }else{
                          setCommonAlert({ open: true, msg: t('reg_error') });
                        }
                      })
                    } else {
                      setCommonAlert({ open: true, msg: t('referer_not_found') });
                    }
                  }).catch((error) => {
                    setCommonAlert({ open: true, msg: t('referer_not_found') });
                  });
                } else {
                  emailSignUp(state).then((res)=>{
                    if(res.uid){
                      settings.email_verify?setCommonAlert({ open: true, msg: t('email_verify_message') }):setCommonAlert({ open: true, msg: t('account_create_successfully') })
                      setTimeout(()=>{
                        dispatch(signIn(state.email,state.password));
                        props.history.push('/login');
                      },3000);
                    }else{
                      setCommonAlert({ open: true, msg: t('reg_error') });
                    }
                  })
                }
              }
            });
          } else {
            setCommonAlert({ open: true, msg: t('mobile_no_blank_error') });
          }
        }
      } else {
        setCommonAlert({ open: true, msg: t('proper_email') });
      }
    } else {
      setCommonAlert({ open: true, msg: t('proper_input_name') });

    }
  };

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: '' });
    if (auth.error.flag) {
      dispatch(clearLoginError());
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    props.history.push('/login');
  };

  return (
    <div>
      <Header
        absolute
        color="transparent"
        rightLinks={<HeaderLinks />}
        {...rest}
      />
      <div
        className={classes.pageHeader}
        style={{
          backgroundImage: "url(" + image + ")",
          backgroundSize: "cover",
          backgroundPosition: "top center"
        }}
      >
        <div id="sign-in-button" />
        <div className={classes.container}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={4}>
              <Card>
                <form className={classes.form}>

                  <Paper square className={classes.root} style={{ paddingTop: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <Tabs
                      value={0}
                      variant="fullWidth"
                      indicatorColor="primary"
                      textColor="inherit"
                      aria-label="switch login type"
                    >
                      <Tab disabled={true} icon={<EmailIcon />} label={t('register_email')} aria-label="email" />
                    </Tabs>
                  </Paper>

                  <CardBody>
                    <CustomInput
                      labelText={t('firstname')}     
                      id="firstName"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        type: "text",
                        required: true,
                        endAdornment: (
                          <InputAdornment >
                            <Email className={classes.inputIconsColor} />
                          </InputAdornment>
                        )
                      }}
                      onChange={onInputChange}
                      value={state.firstName}
                    />
                    <CustomInput    // LAST NAME
                      labelText={t('lastname')}
                      id="lastName"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        type: "text",
                        required: true,
                        endAdornment: (
                          <InputAdornment >
                            <Email className={classes.inputIconsColor} />
                          </InputAdornment>
                        )
                      }}
                      onChange={onInputChange}
                      value={state.lastName}
                    />
                    <CustomInput
                      labelText={t('email')}
                      id="email"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        type: "email",
                        required: true,
                        endAdornment: (
                          <InputAdornment >
                            <Email className={classes.inputIconsColor} />
                          </InputAdornment>
                        )
                      }}
                      onChange={onInputChange}
                      value={state.email}
                    />
                    <CustomInput
                      labelText={t('password')}
                      id="password"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        type: "password",
                        required: true,
                        endAdornment: (
                          <InputAdornment >
                            <Icon className={classes.inputIconsColor}>
                              lock_outline
                            </Icon>
                          </InputAdornment>
                        ),
                        autoComplete: "off"
                      }}
                      onChange={onInputChange}
                      value={state.password}
                    />
                    {settings && settings.AllowCountrySelection ?   // COUNTRY
                      <CountrySelect
                        countries={countries}
                        value={countryCode? countryCode:null}
                        onChange={
                          (object, value) => {
                            setCountryCode(value);
                            let formattedNum = mobileWithoutCountry.replace(/ /g, '');
                            formattedNum = "+" + countryCode + formattedNum.replace(/-/g, '');
                            setState({ ...state, mobile: formattedNum })
                          }
                        }
                        style={{ paddingTop: 20 }}
                        disabled={state.verificationId ? true : false}
                      />
                      : null}
                    <CustomInput
                      labelText={t('phone')}
                      id="mobile"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        required: true,
                        disabled: state.verificationId ? true : false,
                        endAdornment: (
                          <InputAdornment >
                            <PhoneIcon className={classes.inputIconsColor} />
                          </InputAdornment>
                        )
                      }}
                      onChange={
                        (event) => {
                          setMobileWithoutCountry(event.target.value)
                          let formattedNum = event.target.value.replace(/ /g, '');
                          formattedNum = "+" + countryCode.phone + formattedNum.replace(/-/g, '');
                          setState({ ...state, mobile: formattedNum })
                        }
                      }
                      value={mobileWithoutCountry}
                    />
                    <CustomInput    // LAST NAME
                      labelText={t('referralId')}
                      id="referralId"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        type: "text",
                        required: true,
                        endAdornment: (
                          <InputAdornment>
                            <Email className={classes.inputIconsColor} />
                          </InputAdornment>
                        )
                      }}
                      onChange={onInputChange}
                      value={state.referralId}
                    />
                  </CardBody>
                  <CardFooter className={classes.cardFooter}>
                    <Button type="submit" className={classes.normalButton} simple color="primary" size="lg" onClick={handleRegister}>
                      {t('register')}
                    </Button>
                    <Button className={classes.normalButton} simple color="primary" size="lg" onClick={handleBack}>
                      {t('back')}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </GridItem>
          </GridContainer>
        </div>
        <Footer whiteFont />
        <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>{commonAlert.msg}</AlertDialog>
      </div>
    </div>
  );
}
