import userSlice from ./userSlice.js
export default const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});
