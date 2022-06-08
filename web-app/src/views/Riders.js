import React,{ useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';


export default function Users() {
  const { api } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    addUser,
    editUser, 
    deleteUser,
    checkUserExists
  } = api;
  const settings = useSelector(state => state.settingsdata.settings);
  const [data, setData] = useState([]);
  const usersdata = useSelector(state => state.usersdata);
  const dispatch = useDispatch();

  useEffect(()=>{
    if(usersdata.users){
      setData(usersdata.users.filter(user => user.usertype ==='rider'));
    }else{
      setData([]);
    }
  },[usersdata.users]);

  const columns = [
    { title: t('createdAt'), field: 'createdAt', editable:'never', defaultSort:'desc',render: rowData => rowData.createdAt? moment(rowData.createdAt).format('lll'):null,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('first_name'), field: 'firstName',cellStyle:{textAlign:isRTL=== 'rtl' ?'center':'left'}},
    { title: t('last_name'), field: 'lastName',cellStyle:{textAlign:isRTL=== 'rtl' ?'center':'left'}},
    { title: t('email'), field: 'email', editable:'onAdd',render: rowData => settings.AllowCriticalEditsAdmin ? rowData.email : "Hidden for Demo",cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'},headerStyle:{textAlign:'center'}},
    { title: t('mobile'), field: 'mobile', editable:'onAdd',render: rowData => settings.AllowCriticalEditsAdmin ? rowData.mobile : "Hidden for Demo",cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('profile_image'),  field: 'profile_image', render: rowData => rowData.profile_image?<img alt='Profile' src={rowData.profile_image} style={{width: 50,borderRadius:'50%'}}/>:null, editable:'never',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('account_approve'),  field: 'approved', type:'boolean',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('wallet_balance'),  field: 'walletBalance', type:'numeric' , editable:'never', initialEditValue: 0,cellStyle:{textAlign:isRTL=== 'rtl' ?'center':'center'}},
    { title: t('signup_via_referral'), field: 'signupViaReferral', editable:'never' ,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('referralId'),  field: 'referralId', editable:'never', initialEditValue: '' ,cellStyle:{textAlign:isRTL=== 'rtl' ?'center':'left'}},
  ];

  return (
    usersdata.loading? <CircularLoading/>:
    <MaterialTable
      title={t('riders')}
      columns={columns}
      style={{direction:isRTL ==='rtl'?'rtl':'ltr'}}
      data={data}
      options={{
        exportButton: settings.AllowCriticalEditsAdmin,
        sorting: true,
      }}
      editable={{
        onRowAdd: newData =>
          new Promise((resolve,reject) => {
            setTimeout(() => {
              checkUserExists(newData).then((res) => {
                if (res.users && res.users.length > 0) {
                  alert(t('user_exists'));
                  reject();
                }
                else if(res.error){
                  alert(t('email_or_mobile_issue'));
                  reject();
                }
                else{
                  newData['createdByAdmin'] = true;
                  newData['usertype'] = 'rider';
                  newData['createdAt'] = new Date().toISOString();
                  newData['referralId'] = newData.firstName.toLowerCase() + Math.floor(1000 + Math.random() * 9000).toString();
                  dispatch(addUser(newData));
                  resolve();
                }
              });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(editUser(oldData.id,newData));
            }, 600);
          }),
        onRowDelete: oldData =>
          settings.AllowCriticalEditsAdmin?
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(deleteUser(oldData.id));
            }, 600);
          })
          :
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              alert(t('demo_mode'));
            }, 600);
          })
          , 
      }}
    />
  );
}
