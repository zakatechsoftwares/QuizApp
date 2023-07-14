import {
  createSlice,
  configureStore,
  createAsyncThunk,
  createAction,
} from "@reduxjs/toolkit";

import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";

const initialState = {
  userId: null,
  userEmail: null,
  DbUser: null,
  loading: true,
  errorMessage: null,
  paymentStatus: false,
  currentGroupName: null,
  currentGroupCadre: null,
  runAppUseEffect: false,
  emailVerified: false,
  dbUserFirstName: null,
  dbUserLastName: null,
  dbUserMiddleName: null,
};

const fetchUser = createAsyncThunk("DbUser/fetchUser", async (userId) => {
  try {
    const userDoc = await firestore().collection("users").doc(userId).get();
    // .onSnapshot((snapshot) => {
    //   return snapshot?.data();
    // });
    const user = userDoc.data();
    let paid = false;

    let data1 =
      user && Array.isArray(user.payments) && user.payments.length > 0
        ? user?.payments[user?.payments?.length - 1]?.nextDueDate > Date.now()
        : false;

    let data2 = user?.exempted ?? false;
    let data3 =
      user !== undefined && user?.dateJoined !== undefined
        ? Date.now() - user?.dateJoined ?? Date.now() < 7 * 86400000
        : false;

    paid = data2 || data1 || data3 ? true : false;

    let data = JSON.stringify({ user, paid });

    return data;
  } catch (error) {
    // Alert.alert("Error fetching user:", error);
    throw error?.message;
  }
});

//export const triggerUserFetch = createAction("DbUser/triggerUserFetch");

const userSlice = createSlice({
  name: "DbUser",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },
    setEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },
    setRunAppUseEffect: (state, action) => {
      state.runAppUseEffect = !state.runAppUseEffect;
    },
    setDbUser: (state, action) => {
      state.DbUser = action.payload;
    },
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
    setCurrentGroupName: (state, action) => {
      state.currentGroupName = action.payload;
    },
    setCurrentGroupCadre: (state, action) => {
      state.currentGroupCadre = action.payload;
    },
    setDbUserFirstName: (state, action) => {
      state.dbUserFirstName = action.payload;
    },
    setDbUserLastName: (state, action) => {
      state.dbUserLastName = action.payload;
    },
    setDbUserMiddleName: (state, action) => {
      state.dbUserMiddleName = action.payload;
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchUser.pending, (state, action) => {
  //       state.loading = true;
  //     })
  //     .addCase(fetchUser.fulfilled, (state, action) => {
  //       {
  //         state.paymentStatus = JSON.parse(action.payload).paid || false;
  //         state.DbUser = JSON.parse(action.payload).user;
  //         state.loading = false;
  //       }
  //     })
  //     .addCase(fetchUser.rejected, (state, action) => {
  //       state.errorMessage = action.payload.error.message;
  //       state.loading = false;
  //     });
  // },
});

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export const {
  setLoading,
  setCurrentGroupCadre,
  setCurrentGroupName,
  setRunAppUseEffect,
  setDbUser,
  setPaymentStatus,
  setEmailVerified,
  setUserEmail,
  setUserId,
  setDbUserFirstName,
  setDbUserLastName,
  setDbUserMiddleName,
} = userSlice.actions;
//export { fetchUser };
export default store;
