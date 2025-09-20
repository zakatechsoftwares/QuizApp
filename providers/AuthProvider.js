// File: providers/AuthProvider.js
import React, { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import messaging from "@react-native-firebase/messaging";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { Settings } from "react-native-fbsdk-next";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setDbUser,
  setDbUserFirstName,
  setDbUserLastName,
  setDbUserMiddleName,
  setPaymentStatus,
  setDbUserDateJoined,
  setDbUserExempted,
  setUserEmail,
  setUserId,
  setEmailVerified,
  setRunAppUseEffect,
  setOpenGroupList,
  setShowAdvert,
} from "../redux/userSlice";

// Helper: join group logic moved from App.js original
async function joinGroupByPasskey(passKey, dbUserFirstName, dispatch, userId) {
  try {
    const key = passKey.substring(passKey.indexOf("~") + 1).trim();
    const groupToJoin = passKey
      .substring(passKey.indexOf("?") + 1, passKey.indexOf("~"))
      .replace(/\+/g, " ");
    const groupToJoinId = groupToJoin.substring(0, groupToJoin.indexOf("-"));
    const invitedCadre = passKey
      .substring(0, passKey.indexOf("?"))
      .replace(/\+/g, " ");

    dispatch(setLoading(true));
    const arg = await firestore().collection("users").doc(groupToJoinId).get();
    const pass = arg?.data()?.[groupToJoin]?.examinerPass;
    const passFiltered = pass?.filter((item) => item.passKey === key);
    if (passFiltered?.length > 0) {
      // remove pass from source list
      pass.splice(pass.findIndex((item) => item.passKey === key), 1);
      await firestore()
        .collection("users")
        .doc(groupToJoinId)
        .update({ [`${groupToJoin}.examinerPass`]: pass });

      // update this user's membership
      const docRef = firestore().collection("users").doc(userId);
      const doc = await docRef.get();
      let groupMembership = doc.data().groupMembership || [];
      let updatedGroupMemberships = groupMembership.filter(
        (ele) => ele.name !== groupToJoin || ele.cadre === "Admin"
      );

      const ownGroupMemberships = updatedGroupMemberships.findIndex(
        (ele) => ele.name === groupToJoin
      );
      if (ownGroupMemberships === -1) {
        await docRef.update({
          groupMembership: [
            ...updatedGroupMemberships,
            { cadre: invitedCadre, name: groupToJoin },
          ],
        });
      } else {
        await docRef.update({ groupMembership: updatedGroupMemberships });
      }

      // add member to group's members
      const docRef2 = firestore().collection("users").doc(groupToJoinId);
      let members = arg.data()[groupToJoin].members || [];
      const updatedMembers = [
        ...members.filter((m) => m.userId !== userId),
        {
          dateJoin: Date.now(),
          cadre: invitedCadre,
          userId,
          firstName: dbUserFirstName,
          lastName: "", // original had dbUserLastName
          middleName: "",
          email: null,
        },
      ];
      await docRef2.update({ [`${groupToJoin}.members`]: updatedMembers });

      dispatch(setOpenGroupList(true));
      Alert.alert(`You successfully joined ${groupToJoin}`);
      dispatch(setLoading(false));
      dispatch(setRunAppUseEffect()); // toggle
    } else {
      Alert.alert("pass key not authorized");
      dispatch(setLoading(false));
    }
  } catch (err) {
    Alert.alert("An error has occurred: " + err.message);
    dispatch(setLoading(false));
  }
}

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const isMounted = useRef(false);
  const dbUserFirstName = useSelector((s) => s.user.dbUserFirstName);
  const userId = useSelector((s) => s.user.userId);

  // Tracking / FB settings
  useEffect(() => {
    (async () => {
      try {
        const { status } = await requestTrackingPermissionsAsync();
        Settings.initializeSDK();
        if (status === "granted") {
          await Settings.setAdvertiserTrackingEnabled(true);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // FCM foreground/background handlers
  useEffect(() => {
    const onOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.notification) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.notification) {
          Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        }
      });

    const unsubscribeMessage = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage?.notification) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      }
    });

    return () => {
      onOpened();
      unsubscribeMessage();
    };
  }, []);

  // Dynamic links: handle onLink and initial link (Join group)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const handleLink = ({ url }) => {
      if (url && dbUserFirstName && userId) {
        try {
          const passKey = decodeURI(url).split("=")[1];
          joinGroupByPasskey(passKey, dbUserFirstName, dispatch, userId);
        } catch (e) {
          // ignore
        }
      }
    };

    const unsubscribe = dynamicLinks().onLink(handleLink);

    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link?.url && dbUserFirstName && userId) {
          const passKey = link.url.split("=")[1];
          joinGroupByPasskey(passKey, dbUserFirstName, dispatch, userId);
        }
      })
      .catch(() => {});

    return () => unsubscribe();
    // We depend on dbUserFirstName & userId so that user is signed in when we try to join
  }, [dbUserFirstName, userId]);

  // Auth state listener + firestore fetch
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (credentials) => {
      if (credentials) {
        dispatch(setEmailVerified(credentials.emailVerified));
        dispatch(setUserEmail(credentials.email));
        dispatch(setUserId(credentials.uid));
        dispatch(setLoading(true));

        if (!credentials.emailVerified) {
          Alert.alert("Click on the link sent to your mail and then sign in");
          dispatch(setLoading(false));
          return;
        }

        try {
          const userDoc = await firestore().collection("users").doc(credentials.uid).get();
          if (userDoc.exists) {
            const user = userDoc.data();
            // compute paid/showAdvert similarly to original
            const data1 =
              Array.isArray(user.payments) && user.payments.length > 0
                ? user.payments[user.payments.length - 1].nextDueDate > Date.now()
                : false;
            const data2 = !!user.exempted;
            const data3 =
              user?.dateJoined !== undefined
                ? Date.now() - user.dateJoined < 7 * 86400000
                : false;
            const paid = data2 || data1 || data3;
            const showAdvert = !data1;
            dispatch(setLoading(false));
            dispatch(setDbUser(JSON.stringify(user)));
            dispatch(setDbUserFirstName(user.firstName || null));
            dispatch(setDbUserLastName(user.lastName || null));
            dispatch(setDbUserMiddleName(user.middleName || null));
            dispatch(setPaymentStatus(!!paid));
            dispatch(setDbUserDateJoined(user.dateJoined || null));
            dispatch(setDbUserExempted(!!user.exempted));
            dispatch(setShowAdvert(showAdvert));
          } else {
            // no user doc: set defaults
            dispatch(setLoading(false));
            dispatch(setShowAdvert(true));
            dispatch(setDbUser(JSON.stringify(credentials)));
            dispatch(setDbUserFirstName(credentials.displayName || null));
            dispatch(setPaymentStatus(false));
            dispatch(setDbUserDateJoined(Date.now()));
          }
        } catch (err) {
          console.log("dbUser fetch error:", err.message);
          dispatch(setLoading(false));
        }
      } else {
        // signed out
        dispatch(setLoading(false));
        dispatch(setUserEmail(null));
        dispatch(setCurrentGroupCadre(null));
        dispatch(setCurrentGroupName(null));
        dispatch(setDbUser(null));
        dispatch(setEmailVerified(false));
        dispatch(setDbUserFirstName(null));
        dispatch(setDbUserLastName(null));
        dispatch(setDbUserMiddleName(null));
      }
    });

    return () => subscriber();
  }, []);

  // Account deletion helper (reused from original)
  async function revokeSignInWithAppleToken() {
    try {
      const { authorizationCode } = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.REFRESH,
      });
      if (!authorizationCode) {
        Alert.alert("Apple Revocation failed - no authorizationCode returned");
        return;
      }
      return auth().revokeToken(authorizationCode);
    } catch (err) {
      throw err;
    }
  }

  async function deleteAccount() {
    try {
      await firestore().collection("users").doc(userId).delete();
    } catch (err) {
      console.log("delete user doc error", err.message);
    }

    if (Platform.OS === "ios") {
      try {
        await revokeSignInWithAppleToken();
        dispatch(setDbUser(null));
        dispatch(setUserEmail(null));
        dispatch(setCurrentGroupName(null));
        dispatch(setCurrentGroupCadre(null));
        dispatch(setEmailVerified(false));
        dispatch(setDbUserFirstName(null));
        dispatch(setDbUserLastName(null));
        dispatch(setDbUserMiddleName(null));
        dispatch(setRunAppUseEffect());
        Alert.alert("Your account has been deleted.");
      } catch (err) {
        Alert.alert(err.message);
      }
    }

    const user = auth().currentUser;
    if (!user) return;
    try {
      await user.delete();
      dispatch(setDbUser(null));
      dispatch(setUserEmail(null));
      dispatch(setCurrentGroupName(null));
      dispatch(setCurrentGroupCadre(null));
      dispatch(setEmailVerified(false));
      dispatch(setDbUserFirstName(null));
      dispatch(setDbUserLastName(null));
      dispatch(setDbUserMiddleName(null));
      dispatch(setRunAppUseEffect());
      Alert.alert("Your account has been deleted.");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        Alert.alert(
          "This operation is sensitive and requires recent authentication. Log in retry."
        );
      } else {
        Alert.alert(err.message);
      }
    }
  }

  // expose nothing; all effects are internal and dispatch to redux
  // If you want to expose handlers to UI (e.g. deleteAccount), consider using Context or export helpers

  return <>{children}</>;
}
