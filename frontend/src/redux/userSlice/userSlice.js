import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
    },
    // Merge instead of replace. A full replace (`state.currentUser =
    // action.payload`) means any field currentUser already had but that
    // the update response doesn't include (e.g. getMyDetails attaches a
    // `stores` array that updateMyDetails's response doesn't) gets
    // silently dropped. Spreading over the existing object keeps those
    // fields and only overwrites what actually came back.
    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.token = null;
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;