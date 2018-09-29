import React from 'react';
import { AsyncStorage,View , StatusBar } from 'react-native';
import {Root} from 'native-base'
export default class Auth extends React.Component {
    constructor(props) {
        super(props);
        this._bootstrapAsync();
    }

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem('token');

        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        console.log("User token is : ")
        console.log(userToken)
        this.props.navigation.navigate(userToken ? 'Home' : 'Login');
    };

    // Render any loading content that you like here
    render() {
        return (
            <View>
                <StatusBar barStyle="default"  backgroundColor="rgb(0,119,187)" />
            </View>
        );
    }
}