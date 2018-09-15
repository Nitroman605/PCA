import React from 'react';
import {
    View, StatusBar, Text, Image, StyleSheet, Modal, KeyboardAvoidingView,
    AsyncStorage, Keyboard, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Slider , PermissionsAndroid
} from 'react-native';
import { Icon, Button, Header, List, ListItem, Separator, Left, Body, Right } from 'native-base'
import LocalizedStrings from 'react-native-localization';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import fontelloConfig from '../config.json';
import { Gyroscope, Accelerometer, Magnetometer } from "react-native-sensors";
import Proximity from 'react-native-proximity';

let strings = new LocalizedStrings({
    en: {
        title: "Sensors",
        modalTitle: "Settings",
        interval: "Interval between Data Collection",
        minute: "Minute",
        save: "Save",
    },
    ar: {
        title: "الحساسات",
        modalTitle: "الإعدادات",
        interval: "الفترة بين جمع البيانات",
        minute: "دقيقة",
        save: "حفظ",
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
            modalVisible: false,
            slideValue: 1,
            foreground: true,
            gpsTimer: null,
            gpsValues: { latitude: 0, longitude: 0, altitude: 0 },
            gyroValues: { x: 0, y: 0, z: 0 },
            acsoValues: { x: 0, y: 0, z: 0 },
            magnoValues: { x: 0, y: 0, z: 0 },
            proxValues : {distance : 0 , proximity : false },
        };

    }
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: strings.title,
            headerTitleStyle: { color: 'white', fontWeight: 'bold' },
            headerStyle: { backgroundColor: 'rgb(30,30,30)' },
            headerTintColor: 'white',
            headerRight: (
                <View style={{ flexDirection: strings.getLanguage() == 'ar' ? 'row-reverse' : 'row-reverse' }} >
                    <TouchableOpacity onPress={() => { navigation.state.params.settings(true) }} style={{ backgroundColor: 'transparent', alignContent: 'center', justifyContent: 'center', width: 30 }}>
                        <Icon style={{ color: 'white', backgroundColor: 'transparent', borderColor: 'transparent' }} name='settings' />
                    </TouchableOpacity>
                </View>
            ),
        }
    };

    componentDidMount() {
        this.props.navigation.setParams({ settings: this.setModalVisible.bind(this) });
    }
    componentWillUnmount() {
        Proximity.removeListener(this._proximityListener);
        clearInterval(this.state.gpsTimer)
        gyroObservable.stop();
        accelerationObservable.stop();
        magnoObservable.stop();
    }
    setModalVisible(value) {
        this.setState({ modalVisible: !this.state.modalVisible });
    }

    toggleSensor = (sensor) => {
        this.state[sensor] = !this.state[sensor]
        this.setState({})
        switch (sensor) {
            case 'gps':
                if (this.state.gps) {
                    this.state.gpsTimer = setInterval(() => { this.startGPS() }, 10000);
                }
                else {
                    clearInterval(this.state.gpsTimer)
                    this.state.gpsValues.latitude = 0
                    this.state.gpsValues.longitude = 0
                    this.state.gpsValues.altitude = 0
                }
                break;
            case 'gyro':
                if (this.state.gyro) {
                    new Gyroscope({
                        updateInterval: 1000 // defaults to 100ms
                    })
                        .then(observable => {
                            gyroObservable = observable;
                            // Normal RxJS functions
                            gyroObservable
                                .subscribe(({ x, y, z }) => {
                                    this.setState({ gyroValues: { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) } })
                                });
                        })
                        .catch(error => {
                            console.log("The sensor is not available");
                        });
                }
                else {
                    gyroObservable.stop();
                }
                break;
            case 'accelero':
                if (this.state.accelero) {
                    new Accelerometer({
                        updateInterval: 1000 // defaults to 100ms
                    })
                        .then(observable => {
                            accelerationObservable = observable;
                            // Normal RxJS functions
                            accelerationObservable
                                .subscribe(({ x, y, z }) => {
                                    this.setState({ acsoValues: { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) } })
                                });
                        })
                        .catch(error => {
                            console.log("The sensor is not available");
                        });
                }
                else {
                    accelerationObservable.stop();
                }
                break;
            case 'magnet':
                if (this.state.magnet) {
                    new Magnetometer({
                        updateInterval: 1000 // defaults to 100ms
                    })
                        .then(observable => {
                            magnoObservable = observable;
                            // Normal RxJS functions
                            magnoObservable
                                .subscribe(({ x, y, z }) => {
                                    this.setState({ magnoValues: { x: x.toFixed(3), y: y.toFixed(3), z: z.toFixed(3) } })
                                });
                        })
                        .catch(error => {
                            console.log("The sensor is not available");
                        });
                }
                else {
                    magnoObservable.stop();
                }
                break;
            case 'proximity':
                if (this.state.proximity) {
                    Proximity.addListener((data) => {this.proximityListener(data)});
                }
                else {
                    Proximity.removeListener((data) => {this.proximityListener(data)});
                }
                break;
        }
    }

    proximityListener(data) {
        this.setState({
            proxValues : {distance : data.distance.toFixed(3) , proximity : data.proximity}
        })
      }
    startGPS = async () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    gpsValues: {
                        latitude: position.coords.latitude.toFixed(3), longitude: position.coords.longitude.toFixed(3),
                        altitude: position.coords.altitude.toFixed(3)
                    }
                })
            },
            (error) => console.log(error),
            {enableHighAccuracy: true}
            
        );
    }
    render() {
        return (
            <View style={{ flex: 1 }} >
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setModalVisible(!this.state.modalVisible);
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => { this.setModalVisible(!this.state.modalVisible); }}>
                        <View style={{
                            flex: 1,
                            justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'
                        }}>
                            <TouchableWithoutFeedback>
                                <View style={{ width: 250, height: 200, backgroundColor: 'rgb(50,50,50)', elevation: 10 }}>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'black', paddingVertical: 10 }} >
                                        <Text style={{ textAlign: 'center', fontSize: 18, color: 'white' }} >{strings.modalTitle}</Text>
                                    </View>
                                    <View style={{ marginTop: 20 }} >
                                        <Text style={{ marginBottom: 5, textAlign: 'center', color: 'white', fontWeight: 'bold' }} >{strings.interval}</Text>
                                        <Slider
                                            maximumValue={60}
                                            minimumValue={0}
                                            minimumTrackTintColor='rgb(0, 182, 255)'
                                            maximumTrackTintColor='black'
                                            thumbTintColor='rgb(0, 182, 255)'
                                            value={this.state.slideValue}
                                            step={1}
                                            onSlidingComplete={(v) => { this.setState({ slideValue: v }) }}
                                            onValueChange={(v) => { this.setState({ slideValue: v }) }}
                                        />
                                        <Text style={{ textAlign: 'center', color: 'white' }} >{this.state.slideValue + " " + strings.minute}</Text>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }} >
                                        <TouchableOpacity style={{marginRight: 10, marginBottom: 10}} onPress={() => { this.setModalVisible() }}>
                                            <Text uppercase={false} style={{ color: 'rgb(0, 182, 255)', fontWeight: 'bold', fontSize: 18 ,}}>{strings.save}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>

                </Modal>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="rgb(50,50,50)"
                />
                <View style={{ flex: 0.08, padding: 5, backgroundColor: 'rgb(60,60,60)', alignContent: 'center', flexDirection: 'row', height: 50 , justifyContent : 'center' }} >
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
                    {/*
                    <TouchableOpacity style={[styles.sensorContainer]} onPress={() => this.toggleSensor('thermo')}>
                        <Icon style={{ color: this.state.thermo ? 'rgb(0, 182, 255)' : 'rgb(180,180,180)', backgroundColor: 'transparent', borderColor: 'transparent', fontSize: 38 }} name='md-thermometer' />
                    </TouchableOpacity>
                    */}
                </View>
                <ScrollView style={{ flex: 1 }} >
                    {this.getGps()}
                    {this.getGyro()}
                    {this.getaccelero()}
                    {this.getMagno()}
                    {this.getProx()}
                </ScrollView>
            </View>
        );
    }
    getGps() {
        if (this.state.gps) {
            return (
                <List>
                    <Separator style={{ backgroundColor: 'rgb(204,201,220)', paddingVertical: 3 }} bordered>
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} >GPS</Text>
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
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} >Gyroscope</Text>
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
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} >Accelerometer</Text>
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
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} >Magnetometer</Text>
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
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }} >Proximity</Text>
                    </Separator>
                    <ListItem>
                        <Left>
                            <Text>Proximity :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1 }} >
                            <Text>{this.state.proxValues.proximity+""}</Text>
                        </Right>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Text>Distance :</Text>
                        </Left>
                        <Body>
                        </Body>
                        <Right style={{ flex: 1  }} >
                            <Text>{this.state.proxValues.distance}</Text>
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
});