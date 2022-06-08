import React,{ useState,useEffect } from 'react';
import MaterialTable from 'material-table';
import { useSelector} from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";

export default function Earningreports() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();

    const columns =  [
        { title: t('year'),field: 'year', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('months'), field: 'monthsName', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('Gross_trip_cost'), field: 'tripCost', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('trip_cost_driver_share'), field: 'rideCost', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('convenience_fee'), field: 'convenienceFee', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('Discounts'), field: 'discountAmount', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
        { title: t('Profit'),  render: rowData => (parseFloat(rowData.convenienceFee) - parseFloat(rowData.discountAmount)).toFixed(2) , editable:'never', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
    ];

  const [data, setData] = useState([]);
  const earningreportsdata = useSelector(state => state.earningreportsdata);

  useEffect(()=>{
        if(earningreportsdata.Earningreportss){
            setData(earningreportsdata.Earningreportss);
        }
  },[earningreportsdata.Earningreportss]);

  return (
    earningreportsdata.loading? <CircularLoading/>:
    <MaterialTable
      title={t('earning_reports')}
      style={{direction:isRTL ==='rtl'?'rtl':'ltr'}}
      columns={columns}
      data={data}
      options={{
        exportButton: true,
      }}
      
    />
  );
}
