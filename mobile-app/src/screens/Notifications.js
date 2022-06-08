import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Dimensions, FlatList, StyleSheet, Image, TouchableWithoutFeedback ,TouchableOpacity,Alert} from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme';
import { Header } from 'react-native-elements';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
import moment from 'moment/min/moment-with-locales';
const devWidth = Dimensions.get("window").width;
import { FirebaseContext } from 'common/src';

export default function Notifications(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const hCom ={ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } };
    const auth = useSelector(state => state.auth);
    const { appcat } = useContext(FirebaseContext);
    const [data,setData] = useState([]);

    useEffect(() => {
        if (auth.info && auth.info.profile && auth.info.profile.notifications) {
          setData(
            Object.values(auth.info.profile.notifications).sort(
              (a, b) => b.count - a.count > a.count - b.count
            )
          );
        }
      }, [auth.info]);

      const show = (item) => {
        Alert.alert(
          item.title,
          item.msg,
          [
            {
              text: "ok",
              onPress: () => console.log('OK Pressed'),
              style: "ok",
            },
          ],
          { cancelable: false }
        );
      };


    const newData = ({item}) =>{
        return(
        <View style={styles.container}>
           <View style={styles.divCompView}>
              <View style={styles.containsView}>
                  <View style={{flexDirection:isRTL? 'row-reverse':'row'}}> 
                      <View style={styles.imageHolder}>
                        {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.BLACK}
                                size={35}
                            />
                            :
                            <Icon
                                name='car-sports'
                                type='material-community'
                                color={colors.HEADER}
                                size={35}
                            />
                            }
                      </View>
                         <TouchableOpacity onPress={() => show(item)} style={styles.statusView}>
                            <View style={styles.textFormat}>   
                                <Text numberOfLines={1} style={[styles.textStyle1,{textAlign:isRTL? 'right':'left'}]}>{item.title}</Text>
                                <Text numberOfLines={1} style={[styles.textStyle2,{textAlign:isRTL? 'right':'left'}]}>{item.msg}</Text>
                            </View> 
                            <View style={{flexDirection:isRTL?'row-reverse':'row'}}>
                                <Icon
                                    iconStyle={styles.iconPositionStyle}
                                    name='clock'
                                    type='octicon'
                                    size={15}
                                    color={colors.RIDELIST_TEXT}
                                /> 
                                <Text style={[styles.textColor,[isRTL?{paddingRight: 5}:{paddingLeft:5}]]}>{moment(item.dated).format('lll')}</Text>
                            </View>  
                            </TouchableOpacity>
                      </View>
                  </View>
               </View>
        </View>
         )
     }


    return (
        <View style={{ flex: 1 }}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL? null:hCom}
                rightComponent={isRTL? hCom:null}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('push_notification_title')}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}               
            />
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                renderItem={newData}
            />
        </View>
    )

}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    divCompView: {
        borderWidth: 1,
        height: 60,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        borderColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        flex: 1
    },
    imageHolder: {
        height: 50,
        width: 50,
        borderWidth: 1,
        borderRadius: 50 / 2,
        marginLeft: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.WHITE,
        backgroundColor: colors.WHITE,
        padding: 3
    },
    containsView: {
        justifyContent: 'center',
    },
    statusView: {
        flexDirection: 'column',
        marginLeft: 5,
        height: "100%",
    },
    textStyle1: {
        fontSize: 12,
        fontFamily: 'Roboto-Regular',
        marginBottom:2,
        color: colors.RIDELIST_TEXT,
    },
    textStyle2: {
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
    },
    textColor: {
        color: colors.RIDELIST_TEXT,
        alignSelf: 'center',
        fontSize: 12,
        fontFamily: 'Roboto-Regular',
    },
    textFormat: {
        flex: 1,
        width: devWidth - 100
    },
    cabLogoStyle: {
        flex: 1
    },
    iconPositionStyle: {
        alignSelf: 'flex-start'
    }
});