import React from 'react';
import { View,StatusBar, Text, Image  , StyleSheet , ImageBackground , KeyboardAvoidingView , AsyncStorage , Keyboard , TouchableWithoutFeedback , TouchableOpacity , ScrollView} from 'react-native';
import { Input , Form , Item , Icon , Button , Toast , Root , Label} from 'native-base'
import LocalizedStrings from 'react-native-localization';
import {checkInternet} from './util/util'
import DeviceInfo  from 'react-native-device-info'

let strings = new LocalizedStrings({
    en:{
       user:"Email",
       password:"Password",
       consfirmPass : "Confirm Password",
       login:"Sign up",
       errorLogin : "Incorrect Username or Password",
       errorConn : "Unable to reach Steadia Servers",
       errorNet : "Please Connect to the Internet",
       noInput : "Please enter your username and password",
       ok : "Ok", 
       sign : "Already got an account ? Sign in",
       title : "Create Account",
       emailUsed : "The email is already registered",
       password8 : "The length of the password must be 8 or more",
       passMatch : "The passwords does not match",
       wrongEmail : "The email is not correct",
     },
     ar: {
         user:"البريد الإلكتروني",
         password:"كلمة المرور",
         consfirmPass : "تأكيد كلمة المرور",
         login:"تسجيل",
         errorLogin : "البريد الإلكتروني أو كلمة المرور غير صحيحة",
         errorConn : "خطا في الوصول إلى سيرفرات ستديا",
         errorNet : "الرجاء التحقق من اتصالك بالإنترنت",
         noInput : "الرجاء ادخال البريد الإلكتروني و كلمة المرور", 
         ok : "موافق",
         sing: "لديك حساب ؟ قم بتسجيل الدخول",
         title : "تسجيل حساب",
         emailUsed : "البريد الإلكتروني مستخدم حاليا",
         password8 : "طول كلمة المرور يجب أن تكون 8 أو أكثر",
         passMatch : "كلمة المرور لا تتطابق",
         wrongEmail : "البريد الإلكتروني غير صحيح",
     }
    })

export default class Sign extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            consfirmPass : '',
            error: false,
            showToast: false,
            disable: false,
            isRTL: null,
        };
        
    }
    static navigationOptions = ({ navigation }) => {
        return {
          headerTitle: strings.title,
          headerTitleStyle: { color: 'white', fontWeight: 'bold' },
          headerStyle : {backgroundColor : 'rgb(30,30,30)'},
          headerTintColor: 'white',
        }
      };
    
      login = () => {
        //this.props.navigation.navigate('Home')
          if(this.state.password.length < 8){
            this.setState({ error: true });
            this.setState({ disable: false });
            Toast.show({
                text: strings.password8,
                position: 'bottom',
                buttonText: strings.ok,
                type: 'warning',
                duration : 6000,
              })
          }
          else{
            if(this.state.password != this.state.consfirmPass){
                this.setState({ error: true });
                this.setState({ disable: false });
                Toast.show({
                    text: strings.passMatch,
                    position: 'bottom',
                    buttonText: strings.ok,
                    type: 'warning',
                    duration : 6000,
                  })
            }
            else{
                if(this.state.username != ''){
                    if(this.validateEmail(this.state.username)){
                      checkInternet().then(isConnected => {
                        if (isConnected) {
                          let brand = DeviceInfo.getBrand()
                          let modal = DeviceInfo.getModel()
                          fetch('http://35.187.64.144/user/signup', {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: "email=" + this.state.username + "&password=" + this.state.password + "&brand=" + brand +"&modal="+modal
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
                                if(res.code == 1){
                                    this.setState({ error: true });
                                    this.setState({ disable: false });
                                    Toast.show({
                                      text: strings.emailUsed,
                                      position: 'bottom',
                                      buttonText: strings.ok,
                                      type: 'warning',
                                      duration : 6000,
                                    })
                                }
                                else{
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
          }

            
      }

    handleFocus(inputField) {
        this[inputField]._root.focus();
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    render() {
        return (
            
            <ScrollView style={{flex : 1 , paddingHorizontal : 10}} >
            <StatusBar
          barStyle="light-content"
          backgroundColor="rgb(50,50,50)"
            />
            <KeyboardAvoidingView style={{flex : 1}} enabled>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {
                /*
                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ resizeMode: 'contain', width: 200, height: 200 }} source={require('./images/steadia_logo.png')} />
                </View>
                */
              }
                <View style={{ flex: 1 }}>
                    <View style={styles.itemContainer}>
                        <Form >
                            
                                <Item error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
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
                           
                                <Item  error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Icon style={[styles.input,{color : this.state.password == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="key" />
                                    <Input
                                        ref={(c) => this.passwordInput = c}
                                        secureTextEntry
                                        onChangeText={(password) => this.setState({ password })}
                                        placeholder={strings.password}
                                        returnKeyType='next'
                                        onSubmitEditing={() => this.handleFocus('confirmPass')}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{ color : 'black' , textAlign : 'left'}}
                                        
                                    />
                                </Item>
                                <Item error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Icon style={[styles.input,{color : this.state.consfirmPass == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="key" />
                                    <Input
                                        ref={(d) => this.confirmPass = d}
                                        secureTextEntry
                                        onChangeText={(consfirmPass) => this.setState({ consfirmPass })}
                                        placeholder={strings.consfirmPass}
                                        onSubmitEditing={() => this.login()}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{ color : 'black' , textAlign : 'left'}}
                                        
                                    />
                                </Item>      
                    <Item style={{ borderBottomWidth: 0,marginRight : 10, marginTop : 15}}>
                    <ScrollView style={{width : 300 , borderColor : 'rgb(60,60,60)' , borderRadius : 10 , backgroundColor : 'rgba(255,255,255,0.8)',
                                height : 250, paddingTop : 5 , paddingHorizontal : 4
                                }} >
                        <Text style={{color : 'black' , fontSize : 16 , fontWeight : 'bold'}} >We will secure your data using the latest securtiy standerds</Text>
                    </ScrollView>
                    </Item>

                    <Item style={{ borderBottomWidth: 0 , marginLeft:0 }}>
                    <View style={styles.buttonContainer}>
                      <Button disabled={this.state.disable} style = { styles.buttonLogin } block onPress={this.login}>
                        <Text uppercase={false} style={{color : 'white', fontWeight : 'bold' , fontSize : 20}}>{strings.login}</Text>
                      </Button>
                    </View>
                    </Item>   

                  </Form>
                </View >
                </View >
            </View >
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            </ScrollView>
        );
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
      paddingHorizontal : 10,
    },
    item: {
      backgroundColor: 'transparent',
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 5,
      width : 370,
      paddingHorizontal : 5
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
      marginLeft: 20,
      marginRight: 20,
      marginTop: 10,
    },
    buttonLogin: {
      backgroundColor: 'rgba(30,30,30,0.8)',
      height : 50
    }
  });