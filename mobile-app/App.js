import React, { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import AppContainer from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  LogBox
} from "react-native";
import { Provider } from "react-redux";
import  {
  FirebaseProvider,
  store
} from 'common/src';
import AppCommon from './AppCommon';
import AppCat from './config/AppCat';
import { FirebaseConfig } from './config/FirebaseConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    LogBox.ignoreLogs(['Setting a timer']);
    LogBox.ignoreLogs(['It appears that']);
    onLoad();
  }, []);

  const _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/background.jpg'),
        require('./assets/images/logo165x90white.png'),
        require('./assets/images/bg.jpg'),
        require('./assets/images/intro.jpg'),
      ]),
      Font.loadAsync({
        'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
        'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
      }),
    ]);
  };

  const onLoad = async () => {
    const loadingMsg = 'Loading';
    if (__DEV__) {
      setUpdateMsg(loadingMsg + '...');
      _loadResourcesAsync().then(() => setAssetsLoaded(true));
    } else {
      try {
        setUpdateMsg(loadingMsg + '.');
        Updates.checkForUpdateAsync().then((update)=>{
          if (update.isAvailable) {
            setUpdateMsg(loadingMsg + '..');
             Updates.fetchUpdateAsync().then((fetchResult) => {
              if(fetchResult.isNew){
                Updates.reloadAsync().catch(()=>{
                  setUpdateMsg(loadingMsg + '...');
                  _loadResourcesAsync().then(() => setAssetsLoaded(true));                 
                })
              }else{
                setUpdateMsg(loadingMsg + '...');
                _loadResourcesAsync().then(() => setAssetsLoaded(true));
              }
            }).catch((error)=>{
              setUpdateMsg(loadingMsg + '...');
              _loadResourcesAsync().then(() => setAssetsLoaded(true));
            });
          } else {
            setUpdateMsg(loadingMsg + '...');
            _loadResourcesAsync().then(() => setAssetsLoaded(true));
          }
        }).catch(error=>{
          setUpdateMsg(loadingMsg + '...');
          _loadResourcesAsync().then(() => setAssetsLoaded(true));
        });
      } catch (error) {
        setUpdateMsg(loadingMsg + '...');
        _loadResourcesAsync().then(() => setAssetsLoaded(true));
      }
    }
  }

  return (
    assetsLoaded ?
      <Provider store={store}>
        <FirebaseProvider config={FirebaseConfig} appcat={AppCat}>
          <AppCommon>
            <AppContainer />
          </AppCommon>
        </FirebaseProvider>
      </Provider>
      :
      <View style={styles.container}>
        <ImageBackground
          source={require('./assets/images/intro.jpg')}
          resizeMode="stretch"
          style={styles.imagebg}
        >
          <ActivityIndicator />
          <Text style={{ paddingBottom: 100 }}>{updateMsg}</Text>
        </ImageBackground>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  imagebg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: "flex-end",
    alignItems: 'center'
  }
});