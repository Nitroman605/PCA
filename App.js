import {YellowBox} from 'react-native';
import { createStackNavigator,createSwitchNavigator  } from 'react-navigation';
import Login from './pages/login'
import Sign from './pages/sign'
import Home from './pages/home'
import Auth from './pages/auth'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])

const HomeStack = createStackNavigator({
  Home: {
    screen: Home
  }
},{

});

const loginStack = createStackNavigator({
  Login: {
    screen: Login
  },
  Sign:{
    screen : Sign
  }
},{
  initialRouteName : 'Login',
  headerMode : 'screen'
});

export default createSwitchNavigator(
  {
    Home: HomeStack,
    Auth: Auth,
    Login : loginStack
  },
  {
    initialRouteName: 'Auth',
  }
);