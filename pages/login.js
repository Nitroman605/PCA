import React from 'react';
import { View,StatusBar, Text, Image  , ScrollView,StyleSheet , ImageBackground , KeyboardAvoidingView , AsyncStorage , Keyboard , TouchableWithoutFeedback , TouchableOpacity} from 'react-native';
import { Input , Form , Item , Icon , Button , Toast , Root , Content} from 'native-base'
import LocalizedStrings from 'react-native-localization';
import {checkInternet} from './util/util'

let strings = new LocalizedStrings({
   en:{
      user:"Email",
      password:"Password",
      login:"Login",
      errorLogin : "Incorrect Username or Password",
      errorConn : "Unable to reach Steadia Servers",
      errorNet : "Please Connect to the Internet",
      noInput : "Please enter your email and password",
      ok : "Ok", 
      sign : "Don't have an account ? Sign up",
      wrongEmail : "The email is not correct",
    },
    ar: {
        user:"البريد الإلكتروني",
        password:"كلمة المرور",
        login:"تسجيل الدخول",
        errorLogin : "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        errorConn : "خطا في الوصول إلى سيرفرات ستديا",
        errorNet : "الرجاء التحقق من اتصالك بالإنترنت",
        noInput : "الرجاء ادخال البريد الإلكتروني و كلمة المرور", 
        ok : "موافق",
        sing: "ليس لديك حساب ؟ قم بالتسجيل",
        wrongEmail : "البريد الإلكتروني غير صحيح",
    }
   })
   
export default class Login extends React.Component {
 
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            error: false,
            showToast: false,
            disable: false,
            isRTL: null,
        };
    }

    handleFocus(inputField) {
        this[inputField]._root.focus();
    }

    verfiy = async () => {
     let t =  await AsyncStorage.getItem('token');
     console.log(t)
    }
    login = () => {
      //this.props.navigation.navigate('Home')
        if(this.state.username != '' && this.state.password.length >=8){
          if(this.validateEmail(this.state.username)){
            checkInternet().then(isConnected => {
              if (isConnected) {
                fetch('http://35.187.64.144/user/login', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: "email=" + this.state.username + "&password=" + this.state.password
                })
                  .then((response) => response.json())
                  .then(async (res) => {
                    console.log(res);
                    if (res.status == "success") {
                      console.log("Login Successfully")
                      //let result: boolean = await regToken(res.data.loginToken, this.state.token);
                        this.setState({ disable: false });
                        await AsyncStorage.setItem('token',res.data.token);
                        await AsyncStorage.setItem('email',this.state.username);
                        this.props.navigation.navigate('Home')
                    }
                    else if (res.status == "fail") {
                      this.setState({ error: true });
                      this.setState({ disable: false });
                      Toast.show({
                        text: strings.errorLogin,
                        position: 'bottom',
                        buttonText: strings.ok,
                        type: 'warning',
                        duration : 6000,
                      })
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                    console.log("No Server");
                    Toast.show({
                      text: strings.errorConn,
                      position: 'bottom',
                      buttonText: strings.ok,
                      type: 'warning',
                      duration : 6000,
                    })
                    this.setState({ error: true });
                    this.setState({ disable: false });
                  });
              }
              else {
                console.log("No Internet");
                this.setState({ disable: false });
                Toast.show({
                  text: strings.errorNet,
                  position: 'bottom',
                  buttonText: strings.ok,
                  type: 'warning',
                  duration : 6000,
                })
              }
            });
          }
          else{
            this.setState({ disable: false });
            this.setState({error : true})
            Toast.show({
                text: strings.wrongEmail,
                position: 'bottom',
                buttonText: strings.ok,
                type: 'warning',
                duration : 6000,
              })
          }
          }
          else{
            this.setState({ disable: false });
            this.setState({error : true})
            Toast.show({
                text: strings.noInput,
                position: 'bottom',
                buttonText: strings.ok,
                type: 'warning',
                duration : 6000,
              })
          }
          
    }
    sign = () => {
      this.props.navigation.navigate('Sign')
    }

    render() {
        return (
          <View style={{flex : 1}} > 
            <StatusBar
          barStyle="light-content"
          backgroundColor="rgb(50,50,50)"
            />
            <KeyboardAvoidingView style={{flex : 1}} enabled>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
            <ImageBackground source={require('./images/background.jpg')} style={{flex : 1}} >

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
 
                <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ resizeMode: 'contain', width: 250, height: 250 }} source={require('./images/logoSense.png')} />
                </View>

                <View style={{ flex: 5 }}>
                    <View style={styles.itemContainer}>
                        <Form >
                            <View style={{marginTop : 20}} >
                                <Item  error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Icon style={[styles.input,{color : this.state.username == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="person" />
                                    <Input
                                        onChangeText={(username) => this.setState({ username })}
                                        placeholder={strings.user}
                                        returnKeyType='next'
                                        onSubmitEditing={() => this.handleFocus('passwordInput')}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{color : 'black' , textAlign : 'left' }}
                                    />
                                </Item>
                            </View>
                            <View >
                                <Item error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Icon style={[styles.input,{color : this.state.password == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="key" />
                                    <Input
                                        ref={(c) => this.passwordInput = c}
                                        secureTextEntry
                                        onChangeText={(password) => this.setState({ password })}
                                        placeholder={strings.password}
                                        onSubmitEditing={() => this.login()}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{ color : 'black' , textAlign : 'left'}}
                                        
                                    />
                                </Item>
                            </View>
                            
                        
                    <Item style={{ borderBottomWidth: 0 , marginLeft:0 }}>
                    <View style={styles.buttonContainer}>

                      <Button disabled={this.state.disable} style = { styles.buttonLogin } block onPress={this.login}>
                        <Text uppercase={false} style={{color : 'rgb(255,255,255)', fontWeight : 'bold' , fontSize : 20}}>{strings.login}</Text>
                      </Button>
                      <TouchableOpacity style={{marginTop : 20}} onPress={this.sign}>
                        <Text uppercase={false} style={{color : 'rgb(255,255,255)', fontWeight : 'bold' , textAlign : 'center' , fontSize : 16 , textDecorationLine : 'underline'}}>{strings.sign}</Text>
                      </TouchableOpacity>
                    </View>
                  </Item>
                            

                  </Form>
                </View >
                </View >
            <View style={{ flex: 1 }}>
            </View>
            
            </View >
            </ImageBackground>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            </View>
        );
    }
    validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }
}

const styles = StyleSheet.create({
    container: {
  
    },
    linearGradient: {
      flex: 1,
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    theImage: {
      resizeMode: 'contain',
    },
    itemContainer: {
      flex: 1,
    },
    item: {
      backgroundColor: 'rgba(255,255,255,0.8)',
      marginLeft: 20,
      marginRight: 20,
      marginBottom: 5,
      width : 300,
      elevation : 10,
      borderBottomWidth : 2
    },
    button: {
      flex: 1,
      marginLeft: 5
    },
    input: {
      marginLeft: 10,
      backgroundColor : 'transparent',
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
      padding : 10
    },
    buttonLogin: {
      backgroundColor: 'rgba(50,50,50,0.9)',
      width : 280,
      marginLeft: 20,
      marginRight: 20,
    }
  });