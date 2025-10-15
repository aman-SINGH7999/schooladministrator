// /src/providers/ReduxProvider.tsx

'use client'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import React, { useEffect } from 'react'
import { setSchool, setUser } from "@/store/slices/authSlice";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedSchool = localStorage.getItem("school");
    if (storedUser) {
      store.dispatch(setUser(JSON.parse(storedUser)));
    }
    if (storedSchool) {
    store.dispatch(setSchool(JSON.parse(storedSchool)));
  }
  }, []);

  return <Provider store={store}>{children}</Provider>
}
