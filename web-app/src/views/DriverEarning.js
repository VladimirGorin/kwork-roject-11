import React,{ useState,useEffect } from 'react';
import MaterialTable from 'material-table';
import { useSelector } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";

export default function DriverEarning() {
  
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
    const columns =  [
        { title: t('year'),field: 'year', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('months'), field: 'monthsName', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('driver_name'), field: 'driverName', cellStyle:{paddingRight: isRTL=== 'rtl'?'10%':null, textAlign:isRTL=== 'rtl'?'right': null}, headerStyle:{paddingRight: isRTL=== 'rtl'?'10%':null,textAlign:isRTL=== 'rtl'?'right': null}},
        { title: t('vehicle_reg_no'), field: 'driverVehicleNo', cellStyle:{paddingRight: isRTL=== 'rtl'?'10%':null, textAlign:isRTL=== 'rtl'?'right': null}, headerStyle:{paddingRight: isRTL=== 'rtl'?'10%':null,textAlign:isRTL=== 'rtl'?'right': null}},
        { title: t('earning_amount'), field: 'driverShare', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}}
    ];

  const [data, setData] = useState([]);
  const driverearningdata = useSelector(state => state.driverearningdata);

  useEffect(()=>{
        if(driverearningdata.driverearnings){
            setData(driverearningdata.driverearnings);
        }
  },[driverearningdata.driverearnings]);

  return (
    driverearningdata.loading? <CircularLoading/>:
    <MaterialTable
      title={t('driver_earning')}
      columns={columns}
      data={data}
      style={{direction:isRTL ==='rtl'?'rtl':'ltr'}}
      options={{
        exportButton: true,
        grouping: true,
      }}
      
    />
  );
}
