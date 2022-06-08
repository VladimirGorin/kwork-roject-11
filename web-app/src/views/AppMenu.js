import React, { useContext, useState } from 'react';
import {
  Typography,
  ListItemIcon,
  Divider,
  MenuList,
  MenuItem
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import HomeIcon from '@material-ui/icons/Home';
import DashboardIcon from '@material-ui/icons/Dashboard';
import CarIcon from '@material-ui/icons/DirectionsCar';
import ListIcon from '@material-ui/icons/ListAlt';
import ExitIcon from '@material-ui/icons/ExitToApp';
import OfferIcon from '@material-ui/icons/LocalOffer';
import PeopleIcon from '@material-ui/icons/People';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import MoneyIcon from '@material-ui/icons/AttachMoney';
import NotifyIcon from '@material-ui/icons/NotificationsActive';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import { FirebaseContext } from 'common';
import { colors } from '../components/Theme/WebTheme';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import { useTranslation } from "react-i18next";


function AppMenu() {
  const { api } = useContext(FirebaseContext);
  const {
    signOut
  } = api;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const LogOut = () => {
    dispatch(signOut());
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingRight: theme.spacing(4),
    },
  }));

  const classes = useStyles();

  const [menuActive, setMenuActive] = useState([false, false, false, false]);

  const handleClick = (index) => {
    let temp = menuActive;
    temp[index] = !menuActive[index];
    setMenuActive(temp);
  };
  const arrowLeft = {
    // justifyContent:'flex-end',
    position: 'absolute',
    left: 0
  };
  const arrowRight = {
    // justifyContent:'flex-end',
    position: 'absolute',
    right: 0
  };

  let isAdmin = auth.info && auth.info.profile && auth.info.profile.usertype === 'admin';
  let isFleetAdmin = auth.info && auth.info.profile && auth.info.profile.usertype === 'fleetadmin';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: colors.AppMenu_Header }}>
        <img style={{ marginTop: '20px', marginBottom: '20px', width: '120px', height: '120px' }} src={require("../assets/img/logo192x192.png").default} alt="Logo" />
      </div>
      <Divider />
      <MenuList>
        <MenuItem component={Link} to="/">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <Typography variant="inherit">{t('home')}</Typography>
        </MenuItem>
        {isAdmin || isFleetAdmin ?
          <MenuItem component={Link} to="/dashboard">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('dashboard_text')}</Typography>
          </MenuItem>
          : null}
        <MenuItem component={Link} to="/bookings">
          <ListItemIcon>
            <ListIcon />
          </ListItemIcon>
          <Typography variant="inherit">{t('booking_history')}</Typography>
        </MenuItem>
        {isAdmin ?
          <MenuItem component={Link} to="/addbookings">
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('addbookinglable')}</Typography>
          </MenuItem>
          : null}
        {isFleetAdmin ?
          <MenuItem component={Link} to="/drivers">
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('drivers')}</Typography>
          </MenuItem>
          : null}
        {isAdmin ?
          <MenuItem button onClick={() => handleClick(1)} component={Link} to="/riders">
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <Typography>{t('users_title')}</Typography>
            {menuActive[1] ?
              <ListItemIcon style={isRTL ==='rtl'? arrowLeft:arrowRight}>
                <KeyboardArrowDownIcon style={{direction:'rtl'}}/>
              </ListItemIcon>
              :
              <ListItemIcon style={isRTL ==='rtl'? arrowLeft:arrowRight}>
                <KeyboardArrowLeftIcon />
              </ListItemIcon>
            }
          </MenuItem>
          : null}
        <Collapse in={menuActive[1]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {isAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/riders">
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('riders')}</Typography>
              </ListItem>
              : null}
            {isAdmin || isFleetAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/drivers">
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('drivers')}</Typography>
              </ListItem>
              : null}
            {isAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/fleetadmins">
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('fleetadmins')}</Typography>
              </ListItem>
              : null}
          </List>
        </Collapse>

        {isAdmin ?
          <MenuItem component={Link} to="/cartypes">
            <ListItemIcon>
              <CarIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('car_type')}</Typography>
          </MenuItem>
          : null}
        {isAdmin ?
          <MenuItem component={Link} to="/cancelreasons">
            <ListItemIcon>
              <CarIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('cancellation_reasons')}</Typography>
          </MenuItem>
          : null}
        {isFleetAdmin ?
          <MenuItem component={Link} to="/driverearning">
            <ListItemIcon>
              <MoneyIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('earning_reports')}</Typography>
          </MenuItem>
          : null}
        {isAdmin ?
          <MenuItem button onClick={() => handleClick(2)} component={Link} to="/earningreports">
            <ListItemIcon>
              <MoneyIcon />
            </ListItemIcon>
            <Typography>{t('wallet_title')}</Typography>
            {menuActive[2] ?
              <ListItemIcon style={isRTL ==='rtl'? arrowLeft:arrowRight}>
                <KeyboardArrowDownIcon />
              </ListItemIcon>
              :
              <ListItemIcon style={isRTL ==='rtl'? arrowLeft:arrowRight}>
                <KeyboardArrowLeftIcon />
              </ListItemIcon>
            }
          </MenuItem>
          : null}
        <Collapse in={menuActive[2]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {isAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/earningreports">
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('earning_reports')}</Typography>
              </ListItem>
              : null}
            {isAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/driverearning">
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('driver_earning')}</Typography>
              </ListItem>
              : null}
            {isAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/addtowallet">
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('add_to_wallet')}</Typography>
              </ListItem>
              : null}
            {isAdmin ?
              <ListItem button className={classes.nested} component={Link} to="/withdraws">
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <Typography variant="inherit">{t('withdraws')}</Typography>
              </ListItem>
              : null}
          </List>
        </Collapse>

        {isAdmin ?
          <MenuItem component={Link} to="/promos">
            <ListItemIcon>
              <OfferIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('promo')}</Typography>
          </MenuItem>
          : null}
        {isAdmin ?
          <MenuItem component={Link} to="/notifications">
            <ListItemIcon>
              <NotifyIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('push_notification_title')}</Typography>
          </MenuItem>
          : null}
        {isAdmin ?
          <MenuItem component={Link} to="/settings">
            <ListItemIcon>
              <LocalAtmIcon />
            </ListItemIcon>
            <Typography variant="inherit">{t('settings_title')}</Typography>
          </MenuItem>
          : null}
        <MenuItem component={Link} to="/profile">
          <ListItemIcon>
            <PersonOutlineIcon />
          </ListItemIcon>
          <Typography variant="inherit">{t('profile')}</Typography>
        </MenuItem>
        <MenuItem onClick={LogOut}>
          <ListItemIcon>
            <ExitIcon />
          </ListItemIcon>
          <Typography variant="inherit">{t('logout')}</Typography>
        </MenuItem>
      </MenuList>
    </div>
  );
}

export default AppMenu;