import React from 'react';
import {
    View, StatusBar, Text, Image, StyleSheet, Modal, KeyboardAvoidingView,FlatList,NativeEventEmitter,NativeModules,
    AsyncStorage, Keyboard, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Slider , PermissionsAndroid ,Alert,
    Platform , ImageBackground,Linking
} from 'react-native';
import { Icon, Button, Header, List, ListItem, Separator, Left, Body, Right , Badge , Drawer , Thumbnail } from 'native-base'
import LocalizedStrings from 'react-native-localization';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import fontelloConfig from '../config.json';
import { Gyroscope, Accelerometer, Magnetometer } from "react-native-sensors";
import Proximity from 'react-native-proximity';
import Geolocation from 'react-native-geolocation-service';
import wifi from 'react-native-android-wifi';
import { BleManager } from 'react-native-ble-plx';
import DeviceInfo  from 'react-native-device-info'
import BackgroundTimer from 'react-native-background-timer';
import Permissions from 'react-native-permissions'
import {checkInternet} from './util/util'

let strings = new LocalizedStrings({
    en: {
        title: "Sensors",
        modalTitle: "Settings",
        interval: "Interval of data collection",
        minute: "Minute",
        save: "Save",
        networks : "Networks :",
        close : 'Close',
        wifimodal : "Wifi Networks",
        ble : 'BLE Devices',
        permissionTitle : "Can we access your location?",
        permissionSubtitle : "to collect gps,ble,wifi we need location permission",
        no : "No",
        ok : "OK",
        openSettings : "Open Settings",
        about: "About",
        logout: "Logout",
        forContact : "Contact this email if you have any issues",
        permissionTitleBle : "Can we access your Bluetooth?",
        permissionSubtitleBle : "to collect ble we need Bluetooth permission",
        siteData : "Visit this website to download your data",
    },
    ar: {
        title: "الحساسات",
        modalTitle: "الإعدادات",
        interval: "الفترة بين جمع البيانات",
        minute: "دقيقة",
        save: "حفظ",
        networks : "الشبكات :",
        close : 'اغلاق',
        wifimodal : "شبكات الواي فاي",
        ble : "اجهزة البي أل إي",
        permissionTitle : "هل من الممكن الحصول على صلاحية الموقع ؟",
        permissionSubtitle : "لجمع معلومات الموقع ، الوايفاي و البلوتوث سوف نحتاج لصلاحية الموقع",
        no : "لا",
        ok : "نعم",
        openSettings : "فتح الإعدادات",
        about: "عن التطبيق",
        logout: "تسجيل الخروج",
        forContact : "الرجاء التواصل مع هذا البريد اذا واجهتك أي مشاكل",
        permissionTitleBle : "هل من الممكن الحصول على صلاحية البلوتوث ؟",
        permissionSubtitleBle : "لجمع معلومات البلوتوث سوف نحتاج لصلاحية البلوتوث",
        siteData : "قم بزيارة هذا الموقع اذا رغبت بتحميل بياناتك",
    }
})

const IconFont = createIconSetFromFontello(fontelloConfig);
const gyroObservable = null;
const accelerationObservable = null;
const magnoObservable = null;
export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gps: false,
            gyro: false,
            accelero: false,
            proximity: false,
            magnet: false,
            thermo: false,
            battery: false,
            wifi : false,
            ble : false,
            modalVisible: false,
            slideValue: 1,
            selectedValue : 1,
            savedInterval : 1,
            foreground: true,
            gpsTimer: null,
            gpsValues: { latitude: 0, longitude: 0, altitude: 0 },
            gyroValues: { x: 0, y: 0, z: 0 },
            acsoValues: { x: 0, y: 0, z: 0 },
            magnoValues: { x: 0, y: 0, z: 0 },
            proxValues : false,
            wifiNet : {networks : []},
            wifiTimer : null,
            wifiModal : false,
            bleDev : {devices : []},
            bleTimer : null,
            bleModal : false,
            test : [{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'},{SSID : 'test'}],
            alwaysUpdate : null,
            email : "",
            aboutModal : false,
        };
        this.manager = new BleManager();
        this.gpsValues = {latitude: 0, longitude: 0, altitude: 0 }
        this.gyroValues = { x: 0, y: 0, z: 0 }
        this.acsoValues = { x: 0, y: 0, z: 0 }
        this.magnoValues = { x: 0, y: 0, z: 0 }
        this.proxValues = false
        this.wifiNet = {networks : []}
        this.bleDev = {devices : []}
    }


    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: strings.title,
            headerTitleStyle: { color: 'white', fontWeight: 'bold' },
            headerStyle: { backgroundColor: 'rgb(30,30,30)' },
            headerTintColor: 'white',
            headerRight: (
                <View style={{ flexDirection: strings.getLanguage() == 'ar' ? 'row-reverse' : 'row-reverse' }} >
                    <TouchableOpacity onPress={() => { navigation.state.params.menu() }} style={{ backgroundColor: 'transparent', alignContent: 'center', justifyContent: 'center', width: 30 , marginHorizontal : 5}}>
                        <Icon style={{ color: 'white', backgroundColor: 'transparent', borderColor: 'transparent' }} name='menu' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { navigation.state.params.settings(true) }} style={{ backgroundColor: 'transparent', alignContent: 'center', justifyContent: 'center', width: 30 , marginHorizontal : 5 }}>
                        <Icon style={{ color: 'white', backgroundColor: 'transparent', borderColor: 'transparent' }} name='settings' />
                    </TouchableOpacity>
                </View>
            ),
        }
    };

    closeDrawer = () => {
        this.drawer._root.close()
    };

    openDrawer = () => {
        this.drawer._root.open()
    };

    async componentDidMount() {
        this.props.navigation.setParams({ settings: this.setModalVisible.bind(this) });
        this.props.navigation.setParams({ menu: this.openDrawer.bind(this) });
        let email = await AsyncStorage.getItem("email")
        let interval = await AsyncStorage.getItem("interval")
        interval = interval != null?parseFloat(interval):1
        this.setState({savedInterval : interval , selectedValue : interval , slideValue : interval , email : email})
        if(this.state.savedInterval != 0){
            if(Platform.OS == 'ios'){
                BackgroundTimer.runBackgroundTimer(() => { 
                    if(this.state.gps){
                        await this.startGPS();
                    }
                    if(this.state.wifi){
                        await this.startWifi();
                    }
                    if(this.state.ble){
                        await this.bleScanner();
                    }
                    this.collectData();
                    }, 
                    this.state.savedInterval * 60000);
            }
            else {
                this.state.wifiTimer = BackgroundTimer.setInterval(async () => { 
                    if(this.state.gps){
                        await this.startGPS();
                    }
                    if(this.state.wifi){
                        await this.startWifi();
                    }
                    if(this.state.ble){
                        await this.bleScanner();
                    }
                    this.collectData();
                    }, 
                    this.state.savedInterval * 60000);
            }
        }
        this.state.alwaysUpdate = setInterval(async ()=>{
            this.setState({gpsValues : this.gpsValues,gyroValues : this.gyroValues,acsoValues : this.acsoValues,
                magnoValues : this.magnoValues ,proxValues : this.proxValues , wifiNet : this.wifiNet,
                bleDev : this.bleDev})
        },500)
    }
    componentWillUnmount() {
        Proximity.removeListener(this._proximityListener);
        clearInterval(this.state.gpsTimer)
        clearInterval(this.state.wifiTimer)
        clearInterval(this.state.bleTimer)
        clearInterval(this.state.alwaysUpdate)
        gyroObservable.stop();
        accelerationObservable.stop();
        magnoObservable.stop();
        BackgroundTimer.clearInterval(this.state.wifiTimer);
        if(Platform.OS == 'ios'){
            BackgroundTimer.stopBackgroundTimer();
        }
    }

    collectData = async() => {
        checkInternet().then(async (isConnected) => {
            let token = await AsyncStorage.getItem("token")
            let battery = await DeviceInfo.getBatteryLevel()
            battery = (battery*100).toFixed(0)
            if (isConnected) {
              fetch('http://35.187.64.144/main/collectData', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'x-user-token': token
                },
                body: JSON.stringify({
                    gps : this.gpsValues,
                    gyro : this.gyroValues,
                    accelero : this.acsoValues,
                    magneto : this.magnoValues,
                    proximity : this.proxValues,
                    wifi : this.wifiNet,
                    ble : this.bleDev,
                    battery : battery
                })
              })
                .then((response) => response.json())
                .then(async (res) => {
                  console.log(res);
                  if (res.status == "success") {
                    console.log("sent Successfully")
                  }
                  else if (res.status == "fail") {
                    console.log("Fail")
                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            }
            else {
              console.log("No Internet");
            }
          });
    }

    checkLocationPermession = async() =>{
        return Permissions.check('location',{ type: 'always' }).then(response => {
            if(response == 'authorized'){
                return true;
            }
            else{
                return false;
            }
          })
    }

    requestLocationPermession = async() => {
        return Permissions.request('location',{ type: 'always' }).then(response => {
            if(response == 'authorized'){
                return true;
            }
            else{
                return false;
            }
          })
    }

    alertForLocationPermission() {
        Alert.alert(
          strings.permissionTitle,
          strings.permissionSubtitle,
          [
            {
              text: strings.no,
              onPress: () => console.log('Permission denied'),
              style: 'cancel',
            },
            { text: strings.ok, onPress: this.requestLocationPermession },
            Platform.OS == 'ios'?{ text: strings.openSettings, onPress: Permissions.openSettings }:null,
          ],
        )
    }

    checkBlePermession = async() =>{
        return Permissions.check('bluetooth').then(response => {
            if(response == 'authorized'){
                return true;
            }
            else{
                return false;
            }
          })
    }

    requestBlePermession = async() => {
        return Permissions.request('bluetooth').then(response => {
            if(response == 'authorized'){
                return true;
            }
            else{
                return false;
            }
          })
    }

    alertForBlePermission() {
        Alert.alert(
          strings.permissionTitleBle,
          strings.permissionSubtitleBle,
          [
            {
              text: strings.no,
              onPress: () => console.log('Permission denied'),
              style: 'cancel',
            },
            { text: strings.ok, onPress: this.requestBlePermession },
            Platform.OS == 'ios'?{ text: strings.openSettings, onPress: Permissions.openSettings }:null,
          ],
        )
    }
    setModalVisible(value) {
        this.setState({ modalVisible: !this.state.modalVisible });
    }

    setWifiModalVisible(value) {
        this.setState({ wifiModal: !this.state.wifiModal });
    }

    setBleModalVisible(value) {
        this.setState({ bleModal: !this.state.bleModal });
    }

    setAboutModalVisible(value) {
        this.setState({ aboutModal: !this.state.aboutModal });
    }

    toggleSensor = async(sensor) => {
        this.state[sensor] = !this.state[sensor]
        this.setState({})
        switch (sensor) {
            case 'gps':
                if (this.state.gps) {
                    //this.state.gpsTimer = setInterval(() => { this.startGPS() }, (this.state.savedInterval *1000));
                    this.checkLocationPermession().then((boo) => {
                        if(boo){
                            this.startGPS()
                        }
                        else{
                            this.requestLocationPermession().then((boo) => {
                                if(boo){
                                    this.startGPS()
                                }
                                else{
                                    this.state.gps = false
                                    this.alertForLocationPermission();
                                }
                            })
                        }
                    })
                }
                else {
                    //clearInterval(this.state.gpsTimer)
                    this.gpsValues.latitude = 0
                    this.gpsValues.longitude = 0
                    this.gpsValues.altitude = 0
                }
                break;
            case 'gyro':
                if (this.state.gyro) {
                    new Gyroscope({
                        updateInterval: 100 // defaults to 100ms
                    })
                        .then(observable => {
                            gyroObservable = observable;
                            // Normal RxJS functions
                            gyroObservable
                                .subscribe(({ x, y, z }) => {
                                    this.gyroValues = { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) } 
                                });
                        })
                        .catch(error => {
                            console.log("The sensor is not available");
                        });
                }
                else {
                    gyroObservable.stop();
                    this.gyroValues = { x: 0, y: 0, z: 0 } 
                }
                break;
            case 'accelero':
                if (this.state.accelero) {
                    new Accelerometer({
                        updateInterval: 100 // defaults to 100ms
                    })
                        .then(observable => {
                            accelerationObservable = observable;
                            // Normal RxJS functions
                            accelerationObservable
                                .subscribe(({ x, y, z }) => {
                                    this.acsoValues = { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) }
                                });
                        })
                        .catch(error => {
                            console.log("The sensor is not available");
                        });
                }
                else {
                    accelerationObservable.stop();
                    this.acsoValues = { x: 0, y: 0, z: 0 }
                }
                break;
            case 'magnet':
                if (this.state.magnet) {
                    new Magnetometer({
                        updateInterval: 100 // defaults to 100ms
                    })
                        .then(observable => {
                            magnoObservable = observable;
                            // Normal RxJS functions
                            magnoObservable
                                .subscribe(({ x, y, z }) => {
                                    this.magnoValues = { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) }
                                });
                        })
                        .catch(error => {
                            console.log("The sensor is not available");
                        });
                }
                else {
                    magnoObservable.stop();
                    this.magnoValues = { x: 0, y: 0, z: 0 }
                }
                break;
            case 'proximity':
                if (this.state.proximity) {
                    Proximity.addListener((data) => {this.proximityListener(data)});
                }
                else {
                    Proximity.removeListener((data) => {this.proximityListener(data)});
                    this.proxValues = false
                }
                break;
            case 'wifi':
                if (this.state.wifi) {
                    //this.state.wifiTimer = setInterval(() => { this.startWifi() }, (this.state.savedInterval *1000));
                    this.checkLocationPermession().then((boo) => {
                        if(boo){
                            this.startWifi()
                        }
                        else{
                            this.requestLocationPermession().then((boo) => {
                                if(boo){
                                    this.startWifi()
                                }
                                else{
                                    this.state.wifi = false
                                    this.alertForLocationPermission();
                                }
                            })
                        }
                    })
                }
                else {
                    //clearInterval(this.state.wifiTimer)
                    this.wifiNet.networks = []
                }
                break;
            case 'ble':
                if (this.state.ble) {
                    //this.state.bleTimer = setInterval(() => { this.bleScanner() },  (this.state.savedInterval *1000) );
                    this.checkLocationPermession().then((boo) => {
                        if(boo){
                            this.bleScanner()
                        }
                        else{
                            this.requestLocationPermession().then((boo) => {
                                if(boo){
                                    if(Platform.OS == 'ios'){
                                        this.checkBlePermession().then((boo) => {
                                            if(boo){
                                                this.bleScanner()
                                            }
                                            else{
                                                this.requestBlePermession().then((boo) => {
                                                    if(boo){
                                                        this.bleScanner()
                                                    }
                                                    else{
                                                        this.state.ble = false
                                                        this.alertForBlePermission();
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else{
                                        this.bleScanner()
                                    }
                                }
                                else{
                                    this.state.ble = false
                                    this.alertForLocationPermission();
                                }
                            })
                        }
                    })
                }
                else {
                    //clearInterval(this.state.bleTimer)
                    this.bleDev.devices = []
                }
                break;
        }
    }

    bleScanner = async()=>{
        console.log("Scanning")
        this.bleDev.devices = []
        setTimeout(()=>{
            console.log("Stopping scan")
            this.manager.stopDeviceScan();},5000)
        this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                console.log(error)
                return
            }
    
            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            console.log(device.name)
            console.log(device.rssi)
            console.log(device.id)
            let dev = {name : device.name , rssi : device.rssi , uuid : device.id}
            let index = this.bleDev.devices.findIndex(x => x.uuid == device.id)
            // here you can check specific property for an object whether it exist in your array or not
            if (index === -1){
                this.bleDev.devices.push(dev)
            }
        });
    }


    proximityListener = async (data) => {
        this.proxValues = data.proximity
    }

    startGPS = async () => {
        Geolocation.getCurrentPosition(
            (position) => {
                this.gpsValues = {
                        latitude: position.coords.latitude.toFixed(3), longitude: position.coords.longitude.toFixed(3),
                        altitude: position.coords.altitude.toFixed(3)
                    }
            },
            (error) => console.log(error),
            {enableHighAccuracy: true, timeout: 10000 ,maximumAge: 10000}
        );
    }

    startWifi = async () =>{
        this.wifiNet.networks = []
        wifi.isEnabled((isEnabled) => {
            if (isEnabled) {
              wifi.loadWifiList((wifiStringList) => {
                var wifiArray = JSON.parse(wifiStringList);
                for(i = 0 ; i < wifiArray.length ; i++){
                    this.wifiNet.networks.push({SSID : wifiArray[i].SSID , BSSID : wifiArray[i].BSSID , level : wifiArray[i].level})
                }
                },
                (error) => {
                  console.log(error);
                }
              );
            } else {
              console.log("wifi service is disabled");
            }
          });
    }
    render() {
        return (
            <Drawer
            ref={(ref) => { this.drawer = ref; }}
            content={
            <View style={{flex : 1 , flexDirection : 'column'}}>
            <ImageBackground style={{alignSelf: 'stretch',flex: 1,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'flex-end',maxHeight: 100}} source={require('./images/slidebackground.jpeg')} >
            <Thumbnail
              source={require('./images/user.png')}
              small
              style={{
                marginLeft: 5,
                marginBottom: 5,
              }} />
            <View style={{ marginLeft: 5, marginBottom: 10, backgroundColor: 'transparent' }}>
              <Text  style={{ textAlign: 'left', fontSize: 16, color: 'rgb(160,160,160)' }} >{this.state.email}</Text>
            </View>
          </ImageBackground>
          <List style={{flex : 1 , backgroundColor : 'rgb(60,60,60)'}} >
          <ListItem button onPress={()=>{
              this.closeDrawer();
              this.setAboutModalVisible()}} icon style={[styles.buttonContainer,  { height : 60}]}>
              <Left style={{ backgroundColor: 'transparent' }} >
                <Icon style={styles.icon} name='md-information-circle' />
              </Left>
              <Body style={{ borderBottomWidth: 0, backgroundColor: 'transparent' }}>
                <Text style={styles.optionText} >{strings.about}</Text>
              </Body>
            </ListItem>
            <View style={{borderBottomWidth : 1 , borderBottomColor : 'rgb(120,120,120)' }} />
            <ListItem button  onPress={async()=>{
                await AsyncStorage.removeItem("token")
                await AsyncStorage.removeItem("email")
                this.props.navigation.navigate('Login')
            }} icon style={[styles.buttonContainer,  { height : 60}]}>
              <Left style={{ backgroundColor: 'transparent' }} >
                <Icon style={styles.icon} name='ios-backspace' />
              </Left>
              <Body style={{ borderBottomWidth: 0, backgroundColor: 'transparent' }}>
                <Text style={styles.optionText} >{strings.logout}</Text>
              </Body>
            </ListItem>
          </List>
            </View>
            }
            onClose={() => this.closeDrawer()} >
            <View style={{ flex: 1 }} >
                {this.getSettingsModal()}
                {this.getWifiModal()}
                {this.getbleModal()}
                {this.getAboutModal()}
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="rgb(50,50,50)"
                />
                
                <View style={{ flex: 0.08, padding: 5, backgroundColor: 'rgb(60,60,60)', alignContent: 'center', flexDirection: 'row', height: 50 , justifyContent : 'center' }} >
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('gps')}>
                        <Icon style={{ color: this.state.gps ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='locate' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('gyro')}>
                        <IconFont style={{ color: this.state.gyro ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='gyroscope' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('accelero')}>
                        <IconFont style={{ color: this.state.accelero ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='accelerometer' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('magnet')}>
                        <Icon style={{ color: this.state.magnet ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='ios-magnet' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('proximity')}>
                        <IconFont style={{ color: this.state.proximity ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='proximity' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('wifi')}>
                        <Icon style={{ color: this.state.wifi ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='ios-wifi' />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('ble')}>
                        <Icon style={{ color: this.state.ble ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='md-bluetooth' />
                    </TouchableOpacity>
                    {/*
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('thermo')}>
                        <Icon style={{ color: this.state.thermo ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='md-thermometer' />
                    </TouchableOpacity>
                    */}
                </ScrollView>   
                </View>
                <ScrollView style={{ flex: 1 }} >
                    {this.getGps()}
                    {this.getGyro()}
                    {this.getaccelero()}
                    {this.getMagno()}
                    {this.getProx()}
                    {this.getWifi()}
                    {this.getBle()}
                </ScrollView>
            </View>
            </Drawer>
        );
    }

    getSettingsModal(){
        return(
            <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
                this.setModalVisible(!this.state.modalVisible);
            }}
        >
            <TouchableWithoutFeedback onPress={() => { 
                this.setState({selectedValue : this.state.savedInterval , slideValue : this.state.savedInterval })
                this.setModalVisible(!this.state.modalVisible); }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'
                }}>
                    <TouchableWithoutFeedback>
                        <View style={{ width: 250, height: 200, backgroundColor: 'rgb(50,50,50)', elevation: 10 }}>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'black', paddingVertical: 10 }} >
                                <Text style={{ textAlign: 'center', fontSize: 18, color: 'rgb(0, 182, 255)' }} >{strings.modalTitle}</Text>
                            </View>
                            <View style={{ marginTop: 20 }} >
                                <Text style={{ marginBottom: 5, textAlign: 'center', color: 'white', fontWeight: 'bold' }} >{strings.interval}</Text>
                                <Slider
                                    maximumValue={60.5}
                                    minimumValue={0.5}
                                    minimumTrackTintColor='rgb(0, 182, 255)'
                                    maximumTrackTintColor='black'
                                    thumbTintColor='rgb(0, 182, 255)'
                                    value={this.state.slideValue}
                                    step={1}
                                    onSlidingComplete={(v) => { 
                                        console.log(v)
                                        this.setState({selectedValue: v==0.5?0.5:Math.floor(v)}) }}
                                    onValueChange={(v) => { this.setState({ selectedValue: v==0.5?0.5:Math.floor(v)}) }}
                                />
                                <Text style={{ textAlign: 'center', color: 'white' }} >{this.state.selectedValue + " " + strings.minute}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }} >
                                <TouchableOpacity style={{marginRight: 10, marginBottom: 10}} onPress={async() => { 
                                    this.setState({savedInterval : this.state.selectedValue})
                                    BackgroundTimer.clearInterval(this.state.wifiTimer)
                                    if(this.state.selectedValue != 0){
                                        this.state.wifiTimer = BackgroundTimer.setInterval(async () => { 
                                            if(this.state.gps){
                                                await this.startGPS();
                                            }
                                            if(this.state.wifi){
                                                await this.startWifi();
                                            }
                                            if(this.state.ble){
                                                await this.bleScanner();
                                            }
                                            this.collectData();
                                            }, 
                                            this.state.selectedValue * 60000);
                                    }
                                    this.setModalVisible()
                                    AsyncStorage.setItem("interval",this.state.selectedValue+"")
                                    }}>
                                    <Text uppercase={false} style={{ color: 'rgb(0, 182, 255)', fontWeight: 'bold', fontSize: 18 ,}}>{strings.save}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>

        </Modal>
        )
    }

    getAboutModal(){
        return(
            <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.aboutModal}
            onRequestClose={() => {
                this.setAboutModalVisible();
            }}
        >
            <TouchableWithoutFeedback onPress={() => { 
                this.setAboutModalVisible() }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'
                }}>
                    <TouchableWithoutFeedback>
                        <View style={{ width: 250, height: 300, backgroundColor: 'rgb(50,50,50)', elevation: 10 }}>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'black', paddingVertical: 10 }} >
                                <Text style={{ textAlign: 'center', fontSize: 18, color: 'rgb(0, 182, 255)' }} >{strings.about}</Text>
                            </View>
                            <View style={{ marginTop: 20 }} >
                                <Text style={{ marginBottom: 5, textAlign: 'center', color: 'white', fontWeight: 'bold' }} >{strings.siteData}</Text>
                                <TouchableOpacity style={{marginTop : 10}} onPress={() => {Linking.openURL('http://sensebook.ai')}} ><Text style={{ marginBottom: 5, textAlign: 'center', color: 'rgb(200,200,200)', fontWeight: 'bold' , textDecorationLine : 'underline' }} >http://sensebook.ai/</Text></TouchableOpacity>
                                <Text style={{ marginBottom: 5,marginTop : 10, textAlign: 'center', color: 'white', fontWeight: 'bold' }} >{strings.forContact}</Text>
                                <TouchableOpacity style={{marginTop : 10}} onPress={() => {Linking.openURL('mailto:sensebook1@gmail.com?subject='+this.state.email+' - ')}} ><Text style={{ marginBottom: 5, textAlign: 'center', color: 'rgb(200,200,200)', fontWeight: 'bold' , textDecorationLine : 'underline' }} >snesebook1@gmail.com</Text></TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }} >
                                <TouchableOpacity style={{marginRight: 10, marginBottom: 10}} onPress={() => {this.setAboutModalVisible()}}>
                                    <Text uppercase={false} style={{ color: 'rgb(0, 182, 255)', fontWeight: 'bold', fontSize: 18 ,}}>{strings.ok}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>

        </Modal>
        )
    }

    getWifiModal(){
            return(
                <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.wifiModal}
                onRequestClose={() => {
                    this.setWifiModalVisible(!this.state.wifiModal);
                }}
            >
                <TouchableWithoutFeedback onPress={() => { this.setWifiModalVisible(!this.state.wifiModal); }}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'
                    }}>
                        <TouchableWithoutFeedback>
                            <View style={{ width: 250, height: 350, backgroundColor: 'rgb(50,50,50)', elevation: 10 }}>
                            <ScrollView>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'black', paddingVertical: 10 }} >
                                    <Text style={{ textAlign: 'center', fontSize: 18, color: 'rgb(0, 182, 255)' }} >{strings.wifimodal}</Text>
                                </View>
                                
                                <View style={{ marginTop: 5 }}>         
                                <List>
                                <FlatList
                                    data={this.state.wifiNet.networks}
                                    keyExtractor={(item, index) => item.BSSID}
                                    renderItem={({item}) => 
                                    <ListItem>
                                    <Left  style={{ flex: 1 }}>
                                        <Text style={{color : 'white'}} >{item.SSID}</Text>
                                    </Left>
                                    <Right  style={{ flex: 0.2 }}>
                                        <Text style={{color : 'white'}} >{100+item.level+'%'}</Text>
                                    </Right>
                                </ListItem>
                                }/>
                                </List>
                               
                                </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
    
            </Modal>
            )
    }

    getbleModal(){
        return(
            <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.bleModal}
            onRequestClose={() => {
                this.setBleModalVisible(!this.state.bleModal);
            }}
        >
            <TouchableWithoutFeedback onPress={() => { this.setBleModalVisible(!this.state.bleModal); }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'
                }}>
                    <TouchableWithoutFeedback>
                        <View style={{ width: 250, height: 350, backgroundColor: 'rgb(50,50,50)', elevation: 10 }}>
                        <ScrollView>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'black', paddingVertical: 10 }} >
                                <Text style={{ textAlign: 'center', fontSize: 18, color: 'rgb(0, 182, 255)' }} >{strings.ble}</Text>
                            </View>
                            
                            <View style={{ marginTop: 5 }}>         
                            <List>
                            <FlatList
                                data={this.state.bleDev.devices}
                                keyExtractor={(item, index) => item.name + index}
                                renderItem={({item}) => 
                                <ListItem>
                                <Left  style={{ flex: 1 }}>
                                    <Text style={{color : 'white'}} >{item.name}</Text>
                                </Left>
                                <Right  style={{ flex: 1 }}>
                                    <Text style={{color : 'white'}} >{item.rssi}</Text>
                                </Right>
                                </ListItem>
                            }/>
                            </List>
                           
                            </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>

        </Modal>
        )
}
    getGps() {
        if (this.state.gps) {
            return (
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} adjustsFontSizeToFit={true}>GPS</Text>
                    </Separator>
                    <ListItem>
                        <Left>
                            <Text>Longitude :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.gpsValues.longitude}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>latitude :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.gpsValues.latitude}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>altitude :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.gpsValues.altitude}</Text>
                        </Right>
                    </ListItem>
                </List>
            )
        }
        else {
            return null;
        }
    }

    getGyro() {
        if (this.state.gyro) {
            return (
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} adjustsFontSizeToFit={true}>Gyroscope</Text>
                    </Separator>
                    <ListItem>
                        <Left>
                            <Text>X :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.gyroValues.x}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Y :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.gyroValues.y}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Z :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.gyroValues.z}</Text>
                        </Right>
                    </ListItem>
                </List>
            )
        }
        else {
            return null;
        }
    }

    getaccelero() {
        if (this.state.accelero) {
            return (
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} adjustsFontSizeToFit={true}>Accelerometer</Text>
                    </Separator>
                    <ListItem>
                        <Left>
                            <Text>X :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.acsoValues.x}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Y :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.acsoValues.y}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Z :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.acsoValues.z}</Text>
                        </Right>
                    </ListItem>
                </List>
            )
        }
        else {
            return null;
        }
    }

    getMagno() {
        if (this.state.magnet) {
            return (
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} adjustsFontSizeToFit={true}>Magnetometer</Text>
                    </Separator>
                    <ListItem>
                        <Left>
                            <Text>X :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.magnoValues.x}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Y :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.magnoValues.y}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Z :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.magnoValues.z}</Text>
                        </Right>
                    </ListItem>
                </List>
            )
        }
        else {
            return null;
        }
    }

    getProx() {
        if (this.state.proximity) {
            return (
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18}} adjustsFontSizeToFit={true}>Proximity</Text>
                    </Separator>
                    <ListItem>
                        <Left>
                            <Text >Proximity :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.proxValues+""}</Text>
                        </Right>
                    </ListItem>
                </List>
            )
        }
        else {
            return null;
        }
    }
    getWifi() {
        if (this.state.wifi) {
            return (
                
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} adjustsFontSizeToFit={true}>Wifi</Text>
                    </Separator>
                    
                    <ListItem>
                    
                        <Left>
                            <Text>{strings.networks}</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <TouchableOpacity onPress={() => {this.setWifiModalVisible(true)}} >
                            <Badge style={{backgroundColor : 'rgb(50,50,50)' , width : 25 , height : 25 , justifyContent : 'center'}}>
                            <Text style={{textAlign : 'center' , textAlignVertical : 'center' , color : 'rgb(0, 182, 255)'}} >{this.state.wifiNet.networks.length}</Text>
                            </Badge>
                            </TouchableOpacity>
                        </Right>
                    </ListItem>
                    
                </List>
               
            )
        }
        else {
            return null;
        }
    }

    getBle() {
        if (this.state.ble) {
            return (
                
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} adjustsFontSizeToFit={true}>Ble</Text>
                    </Separator>
                    
                    <ListItem>
                    
                        <Left>
                            <Text>devices</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <TouchableOpacity onPress={() => {this.setBleModalVisible(true)}} >
                            <Badge style={{backgroundColor : 'rgb(50,50,50)' , width : 25 , height : 25 , justifyContent : 'center'}}>
                            <Text style={{textAlign : 'center' , textAlignVertical : 'center' , color : 'rgb(0, 182, 255)'}} >{this.state.bleDev.devices.length}</Text>
                            </Badge>
                            </TouchableOpacity>
                        </Right>
                    </ListItem>
                    
                </List>
               
            )
        }
        else {
            return null;
        }
    }
}
const styles = StyleSheet.create({
    sensorContainer: {
        marginHorizontal: 20
    },
    sensor: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        fontSize: 38
    },
    buttonContainer: {
        alignSelf: 'flex-start',
        //backgroundColor: 'rgb(244,244,244)',
        backgroundColor: 'transparent',
        marginBottom: 5,
        marginTop: 5,
        paddingBottom: 10
      },
      icon: {
        fontSize: 28,
        color: 'rgb(0, 182, 255)',
        backgroundColor: 'transparent',
      },
      optionText: {
        marginLeft: 20,
        fontSize :  16,
        textAlign: 'left',
        color : 'white',
        backgroundColor: 'transparent',
      },
});