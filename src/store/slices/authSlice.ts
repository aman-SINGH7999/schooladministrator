// /src/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IUser } from '@/types/user';
import { ISchool } from '@/types/school'

interface AuthState { user: IUser | null; school: ISchool | null; }

const initialState: AuthState = { user: null, school: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUser | null>) {
      state.user = action.payload
    },
    setSchool(state, action: PayloadAction<ISchool | null>){
      state.school = action.payload
    },
    clearUser(state) {
      state.user = null
    },
    clearSchool(state){
      state.school = null
    }
  },

})

export const { setUser, setSchool, clearUser, clearSchool } = authSlice.actions
export default authSlice.reducer
