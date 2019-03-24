import React from 'react';
import { View, StatusBar, Text, Image, StyleSheet, ImageBackground, KeyboardAvoidingView, AsyncStorage, Keyboard, TouchableWithoutFeedback, TouchableOpacity, ScrollView ,FlatList} from 'react-native';
import { Input, Form, Item, Icon, Button, Toast, Root, Label } from 'native-base'
import LocalizedStrings from 'react-native-localization';
import { checkInternet } from './util/util'
import DeviceInfo from 'react-native-device-info'

let strings = new LocalizedStrings({
  en: {
    user: "Email",
    password: "Password",
    consfirmPass: "Confirm Password",
    login: "Sign up",
    errorLogin: "Incorrect Username or Password",
    errorConn: "Unable to reach Steadia Servers",
    errorNet: "Please Connect to the Internet",
    noInput: "Please enter your username and password",
    ok: "Ok",
    sign: "Already got an account ? Sign in",
    title: "Create Account",
    emailUsed: "The email is already registered",
    password8: "The length of the password must be 8 or more",
    passMatch: "The passwords does not match",
    wrongEmail: "The email is not correct",
  },
  ar: {
    user: "البريد الإلكتروني",
    password: "كلمة المرور",
    consfirmPass: "تأكيد كلمة المرور",
    login: "تسجيل",
    errorLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    errorConn: "خطا في الوصول إلى سيرفرات ستديا",
    errorNet: "الرجاء التحقق من اتصالك بالإنترنت",
    noInput: "الرجاء ادخال البريد الإلكتروني و كلمة المرور",
    ok: "موافق",
    sing: "لديك حساب ؟ قم بتسجيل الدخول",
    title: "تسجيل حساب",
    emailUsed: "البريد الإلكتروني مستخدم حاليا",
    password8: "طول كلمة المرور يجب أن تكون 8 أو أكثر",
    passMatch: "كلمة المرور لا تتطابق",
    wrongEmail: "البريد الإلكتروني غير صحيح",
  }
})

export default class Sign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      consfirmPass: '',
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
      headerStyle: { backgroundColor: 'rgb(30,30,30)' },
      headerTintColor: 'white',
    }
  };

  login = () => {
    //this.props.navigation.navigate('Home')
    if (this.state.password.length < 8) {
      this.setState({ error: true });
      this.setState({ disable: false });
      Toast.show({
        text: strings.password8,
        position: 'bottom',
        buttonText: strings.ok,
        type: 'warning',
        duration: 6000,
      })
    }
    else {
      if (this.state.password != this.state.consfirmPass) {
        this.setState({ error: true });
        this.setState({ disable: false });
        Toast.show({
          text: strings.passMatch,
          position: 'bottom',
          buttonText: strings.ok,
          type: 'warning',
          duration: 6000,
        })
      }
      else {
        if (this.state.username != '') {
          if (this.validateEmail(this.state.username)) {
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
                  body: "email=" + this.state.username.toLowerCase() + "&password=" + this.state.password + "&brand=" + brand + "&modal=" + modal
                })
                  .then((response) => response.json())
                  .then(async (res) => {
                    console.log(res);
                    if (res.status == "success") {
                      console.log("Login Successfully")
                      //let result: boolean = await regToken(res.data.loginToken, this.state.token);
                      this.setState({ disable: false });
                      await AsyncStorage.setItem('token', res.data.token);
                      await AsyncStorage.setItem('email', this.state.username);
                      this.props.navigation.navigate('Home')
                    }
                    else if (res.status == "fail") {
                      if (res.code == 1) {
                        this.setState({ error: true });
                        this.setState({ disable: false });
                        Toast.show({
                          text: strings.emailUsed,
                          position: 'bottom',
                          buttonText: strings.ok,
                          type: 'warning',
                          duration: 6000,
                        })
                      }
                      else {
                        this.setState({ error: true });
                        this.setState({ disable: false });
                        Toast.show({
                          text: strings.errorLogin,
                          position: 'bottom',
                          buttonText: strings.ok,
                          type: 'warning',
                          duration: 6000,
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
                      duration: 6000,
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
                  duration: 6000,
                })
              }
            });
          }
          else {
            this.setState({ disable: false });
            this.setState({ error: true })
            Toast.show({
              text: strings.wrongEmail,
              position: 'bottom',
              buttonText: strings.ok,
              type: 'warning',
              duration: 6000,
            })
          }
        }
        else {
          this.setState({ disable: false });
          this.setState({ error: true })
          Toast.show({
            text: strings.noInput,
            position: 'bottom',
            buttonText: strings.ok,
            type: 'warning',
            duration: 6000,
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

      <ScrollView style={{ flex: 1, paddingHorizontal: 10 }} >
        <StatusBar
          barStyle="light-content"
          backgroundColor="rgb(50,50,50)"
        />
        <KeyboardAvoidingView style={{ flex: 1 }} enabled>
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

                    <Item error={this.state.error} style={[styles.item, { flexDirection: strings.getLanguage() == 'en' ? 'row' : 'row-reverse' }]}>
                      <Icon style={[styles.input, { color: this.state.username == '' ? 'rgb(90,90,90)' : 'rgb(4,95,225)' }]} active name="person" />
                      <Input
                        onChangeText={(username) => this.setState({ username })}
                        placeholder={strings.user}
                        returnKeyType='next'
                        onSubmitEditing={() => this.handleFocus('passwordInput')}
                        disabled={this.state.disable}
                        placeholderTextColor='rgb(90,90,90)'
                        style={{ color: 'black', textAlign: 'left' }}
                      />
                    </Item>

                    <Item error={this.state.error} style={[styles.item, { flexDirection: strings.getLanguage() == 'en' ? 'row' : 'row-reverse' }]}>
                      <Icon style={[styles.input, { color: this.state.password == '' ? 'rgb(90,90,90)' : 'rgb(4,95,225)' }]} active name="key" />
                      <Input
                        ref={(c) => this.passwordInput = c}
                        secureTextEntry
                        onChangeText={(password) => this.setState({ password })}
                        placeholder={strings.password}
                        returnKeyType='next'
                        onSubmitEditing={() => this.handleFocus('confirmPass')}
                        disabled={this.state.disable}
                        placeholderTextColor='rgb(90,90,90)'
                        style={{ color: 'black', textAlign: 'left' }}

                      />
                    </Item>
                    <Item error={this.state.error} style={[styles.item, { flexDirection: strings.getLanguage() == 'en' ? 'row' : 'row-reverse' }]}>
                      <Icon style={[styles.input, { color: this.state.consfirmPass == '' ? 'rgb(90,90,90)' : 'rgb(4,95,225)' }]} active name="key" />
                      <Input
                        ref={(d) => this.confirmPass = d}
                        secureTextEntry
                        onChangeText={(consfirmPass) => this.setState({ consfirmPass })}
                        placeholder={strings.consfirmPass}
                        onSubmitEditing={() => this.login()}
                        disabled={this.state.disable}
                        placeholderTextColor='rgb(90,90,90)'
                        style={{ color: 'black', textAlign: 'left' }}

                      />
                    </Item>
                    <Item style={{ borderBottomWidth: 0, marginRight: 10, marginTop: 15 }}>
                      <ScrollView style={{
                        width: 300, borderColor: 'rgb(60,60,60)', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)',
                        height: 250, paddingTop: 5, paddingHorizontal: 4 
                      }} >
                        <TouchableWithoutFeedback>
                          <View>
                          <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>1. TERMS OF USE</Text>
                          <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}By downloading, installing, browsing, accessing or using this mobile application (“SenseBook”) and its corresponding website www.sensebook.ai, you agree to be bound by these Terms and Conditions of Use. We reserve the right to amend these terms and conditions at any time. If you disagree with any of these Terms and Conditions, you must immediately discontinue your access to the Mobile Application and your use of the services offered on the Mobile Application. Continued use of the Mobile Application will constitute acceptance of these Terms and Conditions, as may be amended from time to time.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18 , marginVertical : 5}}>{"\n"}2. DEFINITIONS</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}In these Terms and Conditions of Use, the following capitalized terms shall have the following meanings, except where the context otherwise requires:
  {"\n"}{"\n"}"Account" means an account created by a User on the Mobile Application as part of Registration.
  {"\n"}{"\n"}"Privacy Policy" means the privacy policy set out in Clause 8 of these Terms and Conditions of Use.
  {"\n"}{"\n"}"Register" means to create an Account on the Mobile Application and "Registration" means the act of creating such an Account.
  {"\n"}{"\n"}"Services" means all the services provided by the Mobile Application to the Users, and "Service" means any one of them,
  {"\n"}{"\n"}"Users" means users of the Mobile Application, including you and "User" means any one of them.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}3. RULES ABOUT USE OF THE SERVICE AND THE MOBILE APPLICATION</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}3.1 We will use reasonable endeavors to correct any errors or omissions as soon as practicable after being notified of them. However, we do not guarantee that the Services or the Mobile Application will be free of faults, and we do not accept liability for any such faults, errors or omissions. In the event of any such error, fault or omission, you should report it by contacting us via the email.
  {"\n"}{"\n"}3.2 We do not warrant that your use of the Services or the Mobile Application will be uninterrupted and we do not warrant that any information (or messages) transmitted via the Services or the Mobile Application will be transmitted accurately, reliably, in a timely manner or at all. Notwithstanding that we will try to allow uninterrupted access to the Services and the Mobile Application, access to the Services and the Mobile Application may be suspended, restricted or terminated at any time.
  {"\n"}{"\n"}3.3 We do not give any warranty that the Services and the Mobile Application are free from viruses or anything else which may have a harmful effect on any technology.
  {"\n"}{"\n"}3.4 We reserve the right to change, modify, substitute, suspend or remove without notice any information or Services on the Mobile Application from time to time. Your access to the Mobile Application and/or the Services may also be occasionally restricted to allow for repairs, maintenance or the introduction of new facilities or services. We will attempt to restore such access as soon as we reasonably can. For the avoidance of doubt, we reserve the right to withdraw any information or Services from the Mobile Application at any time.
  {"\n"}{"\n"}3.5 We reserve the right to block access to and/or to edit or remove any material which in our reasonable opinion may give rise to a breach of these Terms and Conditions of Use.
  </Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}4. DISCLAIMER AND EXCLUSION OF LIABILITY</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}4.1 The Mobile Application, the Services, the information on the Mobile Application and use of all related facilities are provided on an "as is, as available" basis without any warranties whether express or implied.
  {"\n"}{"\n"}4.2 To the fullest extent permitted by applicable law, we disclaim all representations and warranties relating to the Mobile Application and its contents, including in relation to any inaccuracies or omissions in the Mobile Application, warranties of merchantability, quality, fitness for a particular purpose, accuracy, availability, non-infringement or implied warranties from course of dealing or usage of trade.
  {"\n"}{"\n"}4.3 We do not warrant that the Mobile Application will always be accessible, uninterrupted, timely, secure, error free or free from computer virus or other invasive or damaging code or that the Mobile Application will not be affected by any acts of God or other force majeure events, including inability to obtain or shortage of necessary materials, equipment facilities, power or telecommunications, lack of telecommunications equipment or facilities and failure of information technology or telecommunications equipment or facilities.
  {"\n"}{"\n"}4.4 While we may use reasonable efforts to include accurate and up-to-date information on the Mobile Application, we make no warranties or representations as to its accuracy, timeliness or completeness.
  {"\n"}{"\n"}4.5 We shall not be liable for any acts or omissions of any third parties howsoever caused, and for any direct, indirect, incidental, special, consequential or punitive damages, howsoever caused, resulting from or in connection with the mobile application and the services offered in the mobile application, your access to, use of or inability to use the mobile application or the services offered in the mobile application, reliance on or downloading from the mobile application and/or services, or any delays, inaccuracies in the information or in its transmission including but not limited to damages for loss of business or profits, use, data or other intangible, even if we have been advised of the possibility of such damages.
  {"\n"}{"\n"}4.6 We shall not be liable in contract, tort (including negligence or breach of statutory duty) or otherwise howsoever and whatever the cause thereof, for any indirect, consequential, collateral, special or incidental loss or damage suffered or incurred by you in connection with the Mobile Application and these Terms and Conditions of Use. For the purposes of these Terms and Conditions of Use, indirect or consequential loss or damage includes, without limitation, loss of revenue, profits, anticipated savings or business, loss of data or goodwill, loss of use or value of any equipment including software, claims of third parties, and all associated and incidental costs and expenses.
  {"\n"}{"\n"}4.7 The above exclusions and limitations apply only to the extent permitted by law. None of your statutory rights as a consumer that cannot be excluded or limited are affected.
  {"\n"}{"\n"}4.8 Notwithstanding our efforts to ensure that our system is secure, you acknowledge that all electronic data transfers are potentially susceptible to interception by others. We cannot, and do not, warrant that data transfers pursuant to the Mobile Application, or electronic mail transmitted to and from us, will not be monitored or read by others.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}5. INDEMNITY</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}You agree to indemnify and keep us indemnified against any claim, action, suit or proceeding brought or threatened to be brought against us which is caused by or arising out of (a) your use of the Services, (b) any other party’s use of the Services using your user ID, verification PIN, and/or (c) your breach of any of these Terms and Conditions of Use, and to pay us damages, costs and interest in connection with such claim, action, suit or proceeding.
  </Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}6. INTELLECTUAL PROPERTY RIGHTS</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}6.1 All editorial content, information, photographs, illustrations, artwork and other graphic materials, and names, logos and trade marks on the Mobile Application are protected by copyright laws and/or other laws and/or international treaties, and belong to us and/or our suppliers, as the case may be. These works, logos, graphics, sounds or images may not be copied, reproduced, retransmitted, distributed, disseminated, sold, published, broadcasted or circulated whether in whole or in part, unless expressly permitted by us and/or our suppliers, as the case may be.
  {"\n"}{"\n"}6.2 Nothing contained on the Mobile Application should be construed as granting by implication, estoppel, or otherwise, any license or right to use any trademark displayed on the Mobile Application without our written permission. Misuse of any trademarks or any other content displayed on the Mobile Application is prohibited.
  {"\n"}{"\n"}6.3 We will not hesitate to take legal action against any unauthorised usage of our trade marks, name or symbols to preserve and protect its rights in the matter. All rights not expressly granted herein are reserved. Other product and company names mentioned herein may also be the trade marks of their respective owners.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18}}>{"\n"}7. AMENDMENTS</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}{"\n"}7.1 We may periodically make changes to the contents of the Mobile Application, including to the descriptions and prices of goods and services advertised, at any time and without notice. We assume no liability or responsibility for any errors or omissions in the content of the Mobile Application.
  {"\n"}{"\n"}7.2 We reserve the right to amend these Terms and Conditions of Use from time to time without notice. The revised Terms and Conditions of Use will be posted on the Mobile Application and shall take effect from the date of such posting. You are advised to review these terms and conditions periodically as they are binding upon you.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}8. Privacy Policy</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}8.1 Access to the Mobile Application and use of the Services offered on the Mobile Application is subject to this Privacy Policy. By accessing the Mobile Application and by continuing to use the Services offered, you are deemed to have accepted this Privacy Policy, and in particular, you are deemed to have consented to our use and disclosure of your personal information in the manner prescribed in this Privacy Policy. We reserve the right to amend this Privacy Policy from time to time. If you disagree with any part of this Privacy Policy, you must immediately discontinue your access to the Mobile Application and your use of the Services.
  {"\n"}{"\n"}8.2 As part of the normal operation of our Services, we collect, use and, in some cases, disclose information about you to third parties. Accordingly, we have developed this Privacy Policy in order for you to understand how we collect, use, communicate and disclose and make use of your personal information when you use the Services on the Mobile Application:-
  {"\n"}{"\n"}•	Before or at the time of collecting personal information, we will identify the purposes for which information is being collected.
  {"\n"}{"\n"}•	We will collect and use of personal information solely with the objective of fulfilling those purposes specified by us and for other compatible purposes, unless we obtain the consent of the individual concerned or as required by law.
  {"\n"}{"\n"}•	We will only retain personal information as long as necessary for the fulfillment of those purposes.
  {"\n"}{"\n"}•	We will collect personal information by lawful and fair means and, where appropriate, with the knowledge or consent of the individual concerned.
  {"\n"}{"\n"}•	Personal information should be relevant to the purposes for which it is to be used, and, to the extent necessary for those purposes, should be accurate, complete, and up-to-date.
  {"\n"}{"\n"}•	We will protect personal information by reasonable security safeguards against loss or theft, as well as unauthorized access, disclosure, copying, use or modification.
  {"\n"}{"\n"}•	Information We Collect.
  {"\n"}{"\n"}•SenseBook receives or collects information when we operate and provide our Services, including when you install, access, or use our Services.
  You’re Account Information. You provide your email address to create your SenseBook account.
  {"\n"}{"\n"}•	Automatically Collected Information
  Usage and Log Information. We collect service-related, diagnostic, and performance information. This includes information about your activity (such as how you use our Services, how you interact with others using our Services, and the like), log files, and diagnostic, crash, website, and performance logs and reports.
  Device and Connection Information. We collect device-specific information when you install, access, or use our Services. This includes information such as hardware model, operating system information, browser information, IP address, mobile network information including phone number, and device identifiers. We collect device location information if you use our location features, such as when you choose to share your location with your contacts, view locations nearby or those others have shared with you, and the like, and for diagnostics and troubleshooting purposes such as if you are having trouble with our app’s location features.
  Device sensors readings. We collect device sensor readings such as: GPS, Gyro, Accelerometer, Magnetometer, Proximity, Wifi, BLE and Battery.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}9. How We Use Information</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}We use all the information we have to help us operate, provide, improve, understand, customize, support, the Research community.
  Our Services. We operate and provide our Services, including providing customer support, and improving, fixing, and customizing our Services. We understand how people use our Services, and analyze and use the information we have to evaluate and improve our Services, research, develop, and test new services and features, and conduct troubleshooting activities. We also use your information to respond to you when you contact us.
  No Third-Party Banner Ads. We do not allow third-party banner ads on SenseBook. We have no intention to introduce them, but if we ever do, we will update this policy.</Text>
  <Text style={{color :'rgb(47,84,150)', fontWeight : 'bold' , fontSize : 18, marginVertical : 5}}>{"\n"}10. Information You and We Share</Text>
  <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }} >{"\n"}You share your information as you use and communicate through our Services, and we share your information to help us operate, provide, improve, understand, customize, support the Research community.
  We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.
  {"\n"}Contact Us
  If you have questions about our Privacy Policy, please contact us.
  {"\n"}{"\n"}SenseBook©
  {"\n"}Privacy Policy
  {"\n"}sensebook1@gmail.com
  {"\n"}{"\n"}
                        </Text>
                        </View>
                        </TouchableWithoutFeedback>
                      </ScrollView>
                      
                    </Item>

                    <Item style={{ borderBottomWidth: 0, marginLeft: 0 }}>
                      <View style={styles.buttonContainer}>
                        <Button disabled={this.state.disable} style={styles.buttonLogin} block onPress={this.login}>
                          <Text uppercase={false} style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{strings.login}</Text>
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
    paddingHorizontal: 10,
  },
  item: {
    backgroundColor: 'transparent',
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 5,
    width: 370,
    paddingHorizontal: 5
  },
  button: {
    flex: 1,
    marginLeft: 5
  },
  input: {
    marginLeft: 10,
    backgroundColor: 'transparent',
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
    height: 50
  }
});