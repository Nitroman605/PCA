import React from 'react';
import { View,StatusBar, Text, Image  , StyleSheet , ImageBackground , KeyboardAvoidingView , AsyncStorage , Keyboard , TouchableWithoutFeedback , TouchableOpacity , ScrollView} from 'react-native';
import { Input , Form , Item , Icon , Button , Toast , Root , Label} from 'native-base'
import LocalizedStrings from 'react-native-localization';
import {checkInternet} from './util/util'

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
       title : "Create Account"
     },
     ar: {
         user:"البريد الإلكتروني",
         password:"كلمة المرور",
         consfirmPass : "تأكيد كلمة المرور",
         login:"تسجيل",
         errorLogin : "اسم المستخدم أو كلمة المرور غير صحيحة",
         errorConn : "خطا في الوصول إلى سيرفرات ستديا",
         errorNet : "الرجاء التحقق من اتصالك بالإنترنت",
         noInput : "الرجاء ادخال اسم المستخدم و كلمة المرور", 
         ok : "موافق",
         sing: "لديك حساب ؟ قم بتسجيل الدخول",
         title : "تسجيل حساب"
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
        this.props.navigation.goBack()
    }

    handleFocus(inputField) {
        this[inputField]._root.focus();
    }


    render() {
        return (
            <View style={{flex : 1}} >
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
                            <View style={{marginTop : 0}} >
                                <Item floatingLabel  error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Label style={{marginLeft : 10}} >{strings.user}</Label>
                                    <Icon style={[styles.input,{color : this.state.username == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="person" />
                                    <Input
                                        onChangeText={(username) => this.setState({ username })}
                                        //placeholder={strings.user}
                                        returnKeyType='next'
                                        onSubmitEditing={() => this.handleFocus('passwordInput')}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{color : 'black' , textAlign : 'left' }}
                                    />
                                </Item>
                            </View>
                            <View >
                                <Item floatingLabel error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Label style={{marginLeft : 10}}>{strings.password}</Label>
                                    <Icon style={[styles.input,{color : this.state.password == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="key" />
                                    <Input
                                        ref={(c) => this.passwordInput = c}
                                        secureTextEntry
                                        onChangeText={(password) => this.setState({ password })}
                                        //placeholder={strings.password}
                                        returnKeyType='next'
                                        onSubmitEditing={() => this.handleFocus('confirmPass')}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{ color : 'black' , textAlign : 'left'}}
                                        
                                    />
                                </Item>
                                <Item floatingLabel error={this.state.error} style={[styles.item,{flexDirection : strings.getLanguage() == 'en'? 'row':'row-reverse'}]}>
                                    <Label style={{marginLeft : 10}}>{strings.consfirmPass}</Label>
                                    <Icon style={[styles.input,{color : this.state.consfirmPass == ''?'rgb(90,90,90)':'rgb(4,95,225)'}]} active name="key" />
                                    <Input
                                        ref={(d) => this.confirmPass = d}
                                        secureTextEntry
                                        onChangeText={(consfirmPass) => this.setState({ consfirmPass })}
                                        //placeholder={strings.consfirmPass}
                                        onSubmitEditing={() => this.login()}
                                        disabled={this.state.disable}
                                        placeholderTextColor='rgb(90,90,90)'
                                        style={{ color : 'black' , textAlign : 'left'}}
                                        
                                    />
                                </Item>
                            </View>
                            
                    <Item style={{ borderBottomWidth: 0,marginRight : 10, marginTop : 15 }}>
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
                      <TouchableOpacity style={{marginTop : 20}} onPress={this.login}>
                        <Text uppercase={false} style={{color : 'black', fontWeight : 'bold' , textAlign : 'center' , fontSize : 16 , textDecorationLine : 'underline'}}>{strings.sign}</Text>
                      </TouchableOpacity>
                    </View>
                  </Item>
                            

                  </Form>
                </View >
                </View >
            <View style={{ flex: 1 }}>
            </View>
            
            </View >
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            </View>
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
      marginTop: 15,
  
    },
    buttonLogin: {
      backgroundColor: 'rgba(30,30,30,0.8)',
      height : 50
    }
  });