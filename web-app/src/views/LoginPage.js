import React, { useState, useEffect, useContext } from 'react';
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
import CardHeader from "components/Card/CardHeader.js";
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
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Button as RegularButton} from "@material-ui/core";
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

export default function LoginPage(props) {
  const { api, authRef, RecaptchaVerifier } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    signIn,
    facebookSignIn,
    clearLoginError,
    mobileSignIn,
    signOut,
    sendResetMail,
    checkUserExists,
    countries
  } = api;

  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const dispatch = useDispatch();
  const [loginType, setLoginType] = React.useState(0);
  const [activeReg, setActiveReg] = React.useState(false);
  const [openFPModal, setOpenFPModal] = React.useState(false);
  const [capatchaReady, setCapatchaReady] = React.useState(false);

  const [data, setData] = React.useState({
    email: '',
    pass: '',
    country: null,
    mobile: '',
    password: '',
    otp: '',
    verificationId: null,
    firstName: '',
    lastName: '',
    selectedcountry:null,
    usertype:'rider',
    referralId:''
  });
  
  const [tabDisabled, setTabDisabled] = React.useState(false);
  const [fpEmail, setFpEmail] = React.useState("");

  const [commonAlert, setCommonAlert] = useState({ open: false, msg: '' });

  const classes = useStyles();
  const { ...rest } = props;

  useEffect(() => {
    if(settings){
        for (let i = 0; i < countries.length; i++) {
            if(countries[i].label === settings.country){
                setData({
                  country: countries[i].phone,
                  selectedcountry:countries[i],
                });
            }
        }
    }
  }, [settings,countries]);

  useEffect(() => {
    if(!capatchaReady){
      window.recaptchaVerifier = new RecaptchaVerifier("sign-in-button",{
        'size': 'invisible',
        'callback': function(response) {
          setCapatchaReady(true);
        }
      });
    }
    if (auth.info) {
      if(auth.info.profile){
        let role = auth.info.profile.usertype;
        if(role==='admin' || role==='fleetadmin'){
          props.history.push('/dashboard');
        }
        else if (role==='driver'){
          props.history.push('/bookings');
        }
        else {
          props.history.push('/');
        }
      }else{
        if(!activeReg){
          setActiveReg(true);
          if(auth.info.phoneNumber){
            setData({...data,mobile:auth.info.phoneNumber})
            setLoginType(1);
          }else{
            setData({...data,email:auth.info.email})
            setLoginType(0);
          }
          setTabDisabled(true);
          setCommonAlert({ open: true, msg: t('login_success') });
        }
      } 
    }
    if (auth.error && auth.error.flag && auth.error.msg.message !== t('not_logged_in')) {
      if (auth.error.msg.message === t('require_approval')){
        setCommonAlert({ open: true, msg: t('require_approval') })
      } else if(auth.error.msg.message === t('reset_pass_msg')){
        setCommonAlert({ open: true, msg: t('reset_pass_msg') })
      } else if(auth.error.msg.message === t('email_verify_message')){
        setCommonAlert({ open: true, msg: t('email_verify_message') })
      } else{
        setCommonAlert({ open: true, msg: t('login_error') })
      }
    }
    if(auth.verificationId){
      setData({ ...data, verificationId: auth.verificationId });
    }
  }, [auth.info, auth.error, auth.verificationId, props.history, data, data.email,activeReg,capatchaReady,RecaptchaVerifier,t]);

  const handleTabChange = (event, newValue) => {
    setLoginType(newValue);
  };

  const handleFacebook = (e) => {
    e.preventDefault();
    dispatch(facebookSignIn());
  }

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: '' });
    if (auth.error.flag) {
      setData({...data,email:'',pass:''});
      dispatch(clearLoginError());
    }
  };

  const onInputChange = (event) => {
    setData({ ...data, [event.target.id]: event.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    //eslint-disable-next-line
    if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(data.email) && data.pass.length > 0) {
      dispatch(signIn(data.email, data.pass));
    } else {
      setCommonAlert({ open: true, msg: t('login_validate_error')})
    }
    setData({...data,email:'',pass:''});
  }

  const handleGetOTP = (e) => {
    e.preventDefault();
    const phoneNumber = "+" + data.country + data.mobile;
    checkUserExists({mobile:phoneNumber}).then((res)=>{
      if(res.users && res.users.length>0){
          const appVerifier = window.recaptchaVerifier;
          authRef
          .signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(res => {
              setData({...data, verificationId: res.verificationId})
          })
          .catch(error => {
              setCommonAlert({ open: true, msg: error.code + ": " + error.message})
          });
      }
      else{
          setCommonAlert({ open: true, msg: t('user_does_not_exists')})
      }
    });
  }

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (data.otp.length === 6 && parseInt(data.otp) > 100000 & parseInt(data.otp) < 1000000) {
      dispatch(mobileSignIn(data.verificationId, data.otp));
    } else {
      setCommonAlert({ open: true, msg: t('otp_validate_error')})
    }
  }

  const handleCancel = (e) => {
    e.preventDefault();
    dispatch(signOut());
    setTabDisabled(false);
    setActiveReg(false);  
  }

  const onCountryChange = (object, value) => {
    if (value && value.phone) {
      setData({ ...data, country: value.phone, selectedcountry:value });
    }
  };

  const handleRegister = (e) => {
    props.history.push('/register');
  };

  const handleForgotPass = (e) => {
    e.preventDefault();
    setOpenFPModal(true);
  };

  const onFPModalEmailChange = (e) => {
    e.preventDefault();
    setFpEmail(e.target.value);
  }

  const handleCloseFP = (e) => {
    e.preventDefault();
    setFpEmail('');
    setOpenFPModal(false);
  }

  const handleResetPassword = (e) => {
    e.preventDefault();
    dispatch(sendResetMail(fpEmail));
    setFpEmail('');
    setOpenFPModal(false);
  }

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
                  {settings && settings.FacebookLoginEnabled?
                  <CardHeader color="info" className={classes.cardHeader}>
                    <h4>{t('signIn')}</h4>
                    <div className={classes.socialLine}>
                      {settings.FacebookLoginEnabled?
                      <Button
                        justIcon
                        href="#pablo"
                        target="_blank"
                        color="transparent"

                        onClick={handleFacebook}
                      >
                        <i className={"fab fa-facebook"} />
                      </Button>
                      :null}
                    </div>
                  </CardHeader>
                  :null}
                  <Paper square className={classes.root} style={!(settings && settings.FacebookLoginEnabled)?{paddingTop:20,borderTopLeftRadius:10,borderTopRightRadius:10}:null}>
                    <Tabs
                      value={loginType}
                      onChange={handleTabChange}
                      variant="fullWidth"
                      indicatorColor="primary"
                      textColor="inherit"
                      aria-label="switch login type"
                    >
                      <Tab disabled={tabDisabled} icon={<EmailIcon />} label={t('email_tab')}  aria-label="email" />
                      {settings && settings.MobileLoginEnabled?
                      <Tab disabled={tabDisabled} icon={<PhoneIcon />} label={t('phone_tab')} aria-label="phone" />
                      :null}
                    </Tabs>
                  </Paper>

                  <CardBody>
                    {loginType === 0 ?    //EMAIL
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
                        value={data.email}
                      />
                      : null}
                    {loginType === 0?
                      <CustomInput
                        labelText={t('password')}
                        id="pass"
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
                        value={data.pass}
                      />
                      : null}
                    { loginType === 1 && settings.AllowCountrySelection && data.selectedcountry?   // COUNTRY
                      <CountrySelect
                        countries={countries}
                        value={data.selectedcountry}
                        onChange={onCountryChange}
                        style={{paddingTop:20}}
                        disabled={data.verificationId ? true : false}
                      />
                      : null}
                    {loginType === 1 ?   //MOBILE
                      <CustomInput
                        labelText={t('phone')}
                        id="mobile"
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          required: true,
                          disabled: data.verificationId ? true : false,
                          endAdornment: (
                            <InputAdornment>
                              <PhoneIcon className={classes.inputIconsColor} />
                            </InputAdornment>
                          )
                        }}
                        onChange={onInputChange}
                        value={data.mobile}
                      />
                      : null}
                    {data.verificationId && loginType === 1 ?    // OTP
                      <CustomInput
                        labelText={t('otp')}
                        id="otp"
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          type: "password",
                          required: true,
                          endAdornment: (
                            <InputAdornment>
                              <Icon className={classes.inputIconsColor}>
                                lock_outline
                            </Icon>
                            </InputAdornment>
                          ),
                          autoComplete: "off"
                        }}
                        onChange={onInputChange}
                        value={data.otp}
                      />
                      : null}
                    {loginType === 0 ?  
                      <RegularButton 
                        color="inherit" 
                        onClick={handleForgotPass}
                        disableElevation={true}
                        disableFocusRipple={true}
                        disableRipple={true}
                        className={classes.forgotButton}
                        variant="text"
                        style={{ width:'100%', justifyContent:isRTL==='rtl'? 'right':'left'}}
                      >
                          {t('forgot_password')}
                      </RegularButton>
                    : null}
                  </CardBody>
                  <CardFooter className={classes.cardFooter}>
                    {loginType === 0 ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" type="submit" onClick={handleSubmit}>
                        {t('login')}
                    </Button>
                      : null}
                    {loginType === 0 ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" type="submit" onClick={handleRegister}>
                        {t('register')}
                    </Button>
                      : null}

                    {loginType === 1 && !data.verificationId ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" type="submit" onClick={handleGetOTP}>
                        {t('get_otp')}
                    </Button>
                      : null}
                    { loginType === 1 &&  data.verificationId ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" type="submit" onClick={handleVerifyOTP}>
                        {t('verify_otp')}
                    </Button>
                      : null}

                    { loginType === 1 && data.verificationId ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" onClick={handleCancel}>
                        {t('cancel')}
                    </Button>
                      : null}

                  </CardFooter>
                </form>
              </Card>
            </GridItem>
          </GridContainer>
        </div>
        <Footer whiteFont />
        <Dialog open={openFPModal} onClose={handleCloseFP} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title" style={{textAlign:isRTL=== 'rtl'?'right':'left'}}>{t('forgot_pass_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText style={{textAlign:isRTL=== 'rtl'?'right':'left'}}>
              {t('forgot_pass_description')}
          </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label={t('email')}
              type="email"
              fullWidth
              onChange={onFPModalEmailChange}
              className={isRTL ==="rtl"? classes.inputRtl:null}
              style={{direction:isRTL=== 'rtl'?'rtl':'ltr'}}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFP} color="primary">
            {t('cancel')}
          </Button>
            <Button onClick={handleResetPassword} color="primary">
            {t('reset_password')}
          </Button>
          </DialogActions>
        </Dialog>
        <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>{commonAlert.msg}</AlertDialog>
      </div>
    </div>
  );
}
