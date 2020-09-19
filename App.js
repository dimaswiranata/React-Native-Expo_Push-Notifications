import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View } from 'react-native';
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

// controlling how notification display
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return{
      shouldShowAlert: true,
      shouldPlaySound: true
    }
  }
});

export default function App() {

  const [pushToken, setPushToken] = useState();

  useEffect(() => {
    // getting permissions
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if(statusObj.status !== 'granted'){
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== 'granted'){
          throw new Error('Permission not granted!');
        }
      })
      .then(() => {
        // get push token 
        console.log('getting token')
        return Notifications.getExpoPushTokenAsync();
      })
      .then((response) => {
        console.log('response : ',response);
        const token = response.data;
        setPushToken(token);
      })
      .catch((err) => {
        console.log('error : ', err)
        return null;
      });
  }, [])

  useEffect(() => {
    // Reacting to Background Notifications
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('background : ',response);
    });
    // Reacting to Foreground Notifications
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notifications) => {
        console.log('foreground : ',notifications);
    });

    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, [])

  // const triggerNotificationHandler = () => {
  //   // sending local notifications
  //   Notifications.scheduleNotificationAsync({
  //     content : {
  //       title: 'My First local notification',
  //       body: 'This is the first local notification we are sending!',
  //       data: { specialData: 'Some Text'}
  //     },
  //     trigger: {
  //       seconds: 10
  //     }
  //   });
  // }

  const triggerNotificationHandler = () => {
    // Using expo's push server
    fetch(`https://exp.host/--/api/v2/push/send`, {
      method: 'POST',
      headers: {
        Accept : 'application/json',
        'Accept-Encoding' : 'gzip, deflate',
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        data: {extraData : 'Some Data'},
        title: 'Sent via the app',
        body: 'Using expo push server!'
      })
    });
  }

  return (
    <View style={styles.container}>
      <Button title="Trigger Notification" onPress={triggerNotificationHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
