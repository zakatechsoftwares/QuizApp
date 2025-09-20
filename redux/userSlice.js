// redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";

const initialState = {
  userId: null,
  userEmail: null,
  DbUser: null,
  loading: false,
  errorMessage: null,
  paymentStatus: false,
  currentGroupName: null,
  currentGroupCadre: null,
  runAppUseEffect: false,
  emailVerified: false,
  dbUserFirstName: null,
  dbUserLastName: null,
  dbUserMiddleName: null,
  dbUserDateJoined: null,
  dbUserExempted: null,
  openGroupList: false,
  questionCategory: null,
  showAdvert: false,
};

export const fetchUser = createAsyncThunk(
  "DbUser/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const userDoc = await firestore().collection("users").doc(userId).get();
      const user = userDoc.data();
      if (!user) return rejectWithValue("User not found");

      const hasPaid =
        (Array.isArray(user.payments) &&
          user.payments.length > 0 &&
          user.payments.at(-1).nextDueDate > Date.now()) ||
        user?.exempted ||
        (user.dateJoined && Date.now() - user.dateJoined < 7 * 86400000);

      return { user, paid: !!hasPaid };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const userSlice = createSlice({
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
    setRunAppUseEffect: (state) => {
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
    setDbUserDateJoined: (state, action) => {
      state.dbUserDateJoined = action.payload;
    },
    setDbUserExempted: (state, action) => { state.dbUserExempted = action.payload; }
,
    setOpenGroupList: (state, action) => {
      state.openGroupList = action.payload;
    },
    setQuestionCategory: (state, action) => {
      state.questionCategory = action.payload;
    },
    setShowAdvert: (state, action) => {
      state.showAdvert = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.paymentStatus = action.payload.paid;
        state.DbUser = action.payload.user;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.errorMessage = action.payload;
        state.loading = false;
      });
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
  setOpenGroupList,
  setDbUserExempted,
  setDbUserDateJoined,
  setQuestionCategory,
  setShowAdvert,
} = userSlice.actions;

export default userSlice.reducer;
