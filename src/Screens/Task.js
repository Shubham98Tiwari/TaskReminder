import React, {useState} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Image,
    Animated,
    TouchableOpacity,
    TouchableHighlight,
    Pressable,
    Modal,
    TextInput,
    Alert
  } from 'react-native';
  import {
    Colors,
  } from 'react-native/Libraries/NewAppScreen';
  import Icon from 'react-native-ionicons';
  import { FloatingAction } from "react-native-floating-action";
  import {actions} from "../config/constants"
import { SwipeListView } from 'react-native-swipe-list-view';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReactNativeAN from 'react-native-alarm-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchData} from '../config/network';
import {BASE_URL} from '../config/constants';

  const Task = () => {

    let [tasks, setTasks] = React.useState([]);
    let [modalVisible, setModalVisible] = useState(false);
    let [taskName, setTaskName] = useState("");
    const [toggleRepeat, setToggleRepeat] = useState(false)
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [listData, setListData] = useState(
        // Array(20)
        //     .fill('')
        //     .map((_, i) => ({ key: `${i}`, text: `item #${i}`, title:`Task #${i}`, time: "4:30 AM" }))
        []
    );

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        
        setShowDateTimePicker(false)
        setDate(currentDate);
      };
    
      const showMode = (currentMode) => {
        setShowDateTimePicker(true);
        setMode(currentMode);
      };
    
      const showDatepicker = () => {
        showMode('date');
        setShowDateTimePicker(true);
      };
    
      const showTimepicker = () => {
        showMode('time');
        setShowDateTimePicker(true);
      };
    
    let createUser = async() => {
        try {
            console.log("userId")
            const userId = await AsyncStorage.getItem('userId');
            if(!userId) {
                let randomUser = makeid();
                await AsyncStorage.setItem('userId', randomUser);
            }
            await getTasks();
        } catch (error) {
            console.log(error)
        }
    }
    let getTasks = async() => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if(userId) {
                let allTasks = await fetchData("get", BASE_URL + userId);
                if(allTasks.status == 200) {
                    console.log(allTasks?.data);
                    setListData(allTasks?.data?.msg);
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    let createTask = async(payload) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if(userId) {
                payload["_id"] = payload?.key;
                payload["userId"] = userId;
                let allTasks = await fetchData("post", BASE_URL + "createTask", payload);
                if(allTasks.status == 200) {
                    console.log(allTasks?.data?.msg);
                    getTasks();
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    let deleteTask = async(taskId) => {
        try {
            console.log("------------", taskId)
            let allTasks = await fetchData("get", BASE_URL + "deleteTask/" + taskId);
            console.log("------------2", taskId)
            if(allTasks?.status == 200) {
            console.log("------------3", taskId)
                console.log(allTasks?.data?.msg);
                getTasks();
            }
        } catch (error) {
            console.log(error)
        }
    }
    React.useEffect(() => {
    createUser();
        return () => {
            
        }
    }, []);

    let makeid = () => {
        var length = 8;
        var result = '';
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    let onSaveEvent = async () => {
        try {
            let key = makeid();
            var currentTime = Date.now();
            if (date.getTime() < currentTime) {
                Alert.alert('please choose future time');
                return;
            }
            const fireDate = ReactNativeAN.parseDate(date);
            console.log('A date has been picked: ', fireDate, taskName);

            const alarmNotifData = {
            id: key, // Required
            title: 'Alarm Ringing for '+ taskName, // Required
            message: "Reminder for " + taskName, // Required
            channel: 'alarm-channel', // Required. Same id as specified in MainApplication's onCreate method
            ticker: 'My Notification Ticker',
            auto_cancel: true, // default: true
            vibrate: true,
            vibration: 100, // default: 100, no vibration if vibrate: false
            small_icon: 'ic_launcher', // Required
            large_icon: 'ic_launcher',
            play_sound: true,
            sound_name: null, // Plays custom notification ringtone if sound_name: null
            color: 'red',
            schedule_once: true, // Works with ReactNativeAN.scheduleAlarm so alarm fires once
            tag: 'some_tag',
            fire_date: fireDate, // Date for firing alarm, Required for ReactNativeAN.scheduleAlarm.

            // You can add any additional data that is important for the notification
            // It will be added to the PendingIntent along with the rest of the bundle.
            // e.g.
            // data: { value: datetime },
            };
            console.log('A date has been picked: ',alarmNotifData);
            // setListData(oldArray => [...oldArray, {key:key, title: taskName, date: date, isDaily: toggleRepeat}]);
            await createTask({key:key, title: taskName, date: date, isDaily: toggleRepeat})
            ReactNativeAN.scheduleAlarm(alarmNotifData);
            // ReactNativeAN.sendNotification(alarmNotifData);
            setModalVisible(false);
        } catch (error) {
            console.log(error);
        }
    };

    const alarmNotifData = {
        id:"randomId",
        title: taskName,
        message: "Reminder for " + taskName,
        channel: "alarm-channel",
        small_icon: "ic_launcher",
    
        // You can add any additional data that is important for the notification
        // It will be added to the PendingIntent along with the rest of the bundle.
        // e.g.
          data: { foo: "bar" },
    };

    const isDarkMode = useColorScheme() === 'dark';
  
    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
  


    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const deleteRow = (rowMap, rowKey) => {
        try {
            rowKey = rowKey.toString();
            closeRow(rowMap, rowKey);
            deleteTask(rowKey);
            // ReactNativeAN.deleteAlarm(rowKey);
        } catch (error) {
            console.log(error);
        }
        // const newData = [...listData];
        // const prevIndex = listData.findIndex(item => item.key === rowKey);
        // newData.splice(prevIndex, 1);
        // setListData(newData);
    };

    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };

    const onSwipeValueChange = swipeData => {
        const { key, value } = swipeData;
        // rowSwipeAnimatedValues[key].setValue(Math.abs(value));
    };

    const onDontShowAgainPressed = async () => {
        try {
          setModalVisible(!modalVisible);
        } catch (error) {
          console.log(error);
        }
    }

    const renderItem = data => (
        <TouchableHighlight
            onPress={() => console.log('You touched me')}
            style={styles.rowFront}
            underlayColor={'#AAA'}
        >
            <View>
                <Text style={{color:"black", fontWeight:"700", fontSize:16}}>{data?.item?.title}</Text>
                <View style={{flexDirection:"row", alignItems:"center"}}>
                    <Icon
                        name="alarm"
                        size={13}
                        color="black"
                        />
                    <Text style={{color:"black", fontSize:13, marginLeft:"1%", marginRight:"2%"}}>{new Date(data?.item?.date)?.toLocaleTimeString()}</Text>

                    <Icon
                        name='repeat'
                        size={13}
                        color="black"
                        />
                    <Text style={{color:"black", fontSize:13, marginLeft:"1%"}}>{data?.item?.isDaily ? "Daily": "Once"}</Text>
                </View>
                <View style={{flexDirection:"row", alignItems:"center"}}>
                    <Icon
                        name="calendar"
                        size={13}
                        color="black"
                        />
                    <Text style={{color:"black", fontSize:13, marginLeft:"1%", marginRight:"2%"}}>{new Date(data?.item?.date)?.toDateString()}</Text>
                </View>
            </View>
        </TouchableHighlight>
    );

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            {/* <Text>Left</Text> */}
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                onPress={() => closeRow(rowMap, data?.item?.key)}
            >
                <Text style={styles.backTextWhite}>Close</Text>
            </TouchableOpacity>
            <View style={{flex:1}}/>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => deleteRow(rowMap, data?.item?.key)}
            >
                <Animated.View
                    style={[
                        styles.trash,
                        // {
                        //     transform: [
                        //         {
                        //             scale: rowSwipeAnimatedValues[
                        //                 data?.item?.key
                        //             ].interpolate({
                        //                 inputRange: [45, 90],
                        //                 outputRange: [0, 1],
                        //                 extrapolate: 'clamp',
                        //             }),
                        //         },
                        //     ],
                        // },
                    ]}
                >
                    <Image
                        source={require('../res/images/trash.png')}
                        style={styles.trash}
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );

    return (
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={{flex:0.25, backgroundColor:"#A7E9CF", borderBottomLeftRadius:30, borderBottomRightRadius:30,flexDirection:"row", padding:"3%"}}>
            <View style={{flex:1, flexDirection:"column",padding:"2%", justifyContent:"center"}}>
                <Text style={{fontSize:20,color:"#000000", fontWeight:"500"}}>Hi!</Text>
                <Text style={{fontSize:20,color:"#000000", fontWeight:"700", marginTop:"10%",}}>Easy Way To Note Your Tasks.</Text>
            </View>
            <View style={{flex:1, flexDirection:"column",padding:"2%", justifyContent:"center"}}>
                <Image source={require("../res/images/todo.png")} style={{width:"100%", height:"100%", resizeMode:"contain"}}/>
            </View>
        </View>

        <View style={styles.container}>
            <SwipeListView
                data={listData}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                leftOpenValue={75}
                rightOpenValue={-75}
                previewRowKey={'0'}
                previewOpenValue={-50}
                previewOpenDelay={3000}
                onRowDidOpen={onRowDidOpen}
                onSwipeValueChange={onSwipeValueChange}
            />
        </View>

        <FloatingAction
            color={"#78D5B0"}
            actions={actions}
            onPressItem={name => {
                if(name == "bt_task") {
                    setModalVisible(true);
                }
            }}
        />

        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
            onDontShowAgainPressed()
            }}
        >
            <Pressable onPressOut={() => {onDontShowAgainPressed();}} style={styles.centeredView}>
                <Pressable onPress={() => {}} style={styles.modalView}>
                    <View style={{flexDirection:"row"}}>
                        <View style={{flex:1}}/>
                        <View style={{justifyContent:'flex-end', alignSelf:'flex-end', marginBottom:5}}>
                            <Pressable
                            style={{padding:5}}
                            onPress={() => onDontShowAgainPressed()}
                            >
                            <Icon name="close" color="black" size={25}/>
                            </Pressable>
                        </View>
                    </View>
                    
                    <View style={{marginTop:5}}>
                        <TextInput
                            style={styles.input}
                            onChangeText={setTaskName}
                            placeholder="Remind me to..."
                            value={taskName}
                        />
                        <TouchableOpacity style={{flexDirection:"row", alignContent:"center",}} onPress={() => showDatepicker()}>
                            <Icon
                                name="calendar"
                                size={40}
                                color="black"
                                style={{alignSelf:"center"}}
                            />
                            <TextInput
                                style={[styles.input, {flex:1}]}
                                onChangeText={(value) => {setDate(value)}}
                                value={date ? date?.toDateString(): ""}
                                editable={false}
                            />
                        </TouchableOpacity>
                        <Pressable style={{flexDirection:"row", alignContent:"center",}} onPress={() => showTimepicker()}>
                            <Icon
                                name="alarm"
                                size={40}
                                color="black"
                                style={{alignSelf:"center"}}
                            />
                            <TextInput
                                style={[styles.input, {flex:1}]}
                                onChangeText={(value) => {setDate(value)}}
                                value={date ? date?.toLocaleTimeString(): ""}
                                editable={false}
                            />
                        </Pressable>
                        <View style={{flexDirection:"row", alignContent:"center",}}>
                            <Icon
                                name="repeat"
                                size={40}
                                color="black"
                                style={{alignSelf:"center"}}
                            />
                            <Text style={{color:"black",  fontSize:16, marginLeft:"4%",alignSelf:"center"}}>{"Repeat Everyday"}</Text>
                             <CheckBox
                                style={{ marginLeft:"2%",alignSelf:"center"}}
                                disabled={false}
                                value={toggleRepeat}
                                onValueChange={(newValue) => setToggleRepeat(newValue)}
                            />
                        </View>

                        <Pressable onPress={() => onSaveEvent()} style={{flexDirection:"row", alignContent:"center",backgroundColor:"#78D5B0", padding:"3%",justifyContent:"center", margin:"5%"}}>
                            <Text style={{color:"black",  fontSize:16, marginLeft:"4%",alignSelf:"center"}}>{"Save"}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>

        {showDateTimePicker && (
            <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={false}
            display="default"
            onChange={onChange}
            />
        )}
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        backgroundColor: 'white',
        borderBottomColor: 'black',
        borderBottomWidth: 0,
        justifyContent: 'center',
        height: 75,
        margin:10,
        borderRadius:10,
        elevation:5,
        padding:"4%"
    },
    rowBack: {
        backgroundColor: 'white',
        flexDirection: 'row',
        margin:10,
        height: 75,
        borderRadius:10,
        elevation:5
    },
    backRightBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 75,
        borderRadius:10,
        height: "100%",
    },
    backRightBtnLeft: {
        backgroundColor: 'green',
    },
    backRightBtnRight: {
        backgroundColor: 'red',
    },
    trash: {
        height: 25,
        width: 25,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
        color:"#fff"
      },
      modalView: {
        width:"90%",
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      },
      modalText: {
        marginBottom: 10,
        textAlign: "center",
        color:"#ffffff",
        fontSize:32,
        fontFamily:'Poppins-SemiBold'
      },
      input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
      },
  });
  
  export default Task;
  