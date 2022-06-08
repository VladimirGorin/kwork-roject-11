import { createSwitchNavigator,createAppContainer } from 'react-navigation';
import { AuthStack, 
    RightRiderRootNavigator, 
    LeftRiderRootNavigator, 
    RightDriverRootNavigator, 
    LeftDriverRootNavigator, 
    RightAdminRootNavigator, 
    LeftAdminRootNavigator } from './MainNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';

const AppNavigator= createSwitchNavigator({
        AuthLoading: AuthLoadingScreen,
        Auth: AuthStack,
        RightRiderRoot: RightRiderRootNavigator,
        LeftRiderRoot: LeftRiderRootNavigator,
        RightDriverRoot: RightDriverRootNavigator,
        LeftDriverRoot: LeftDriverRootNavigator,
        RightAdminRoot: RightAdminRootNavigator,
        LeftAdminRoot: LeftAdminRootNavigator,
        },
        {
            initialRouteName: 'AuthLoading'
        }
    );
const AppContainer = createAppContainer(AppNavigator);
export default AppContainer;
  