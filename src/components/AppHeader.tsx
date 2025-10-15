"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { IUser } from "@/types/user";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSchool, clearUser } from "@/store/slices/authSlice";
import QuickActionDropdown from "./QuickActionDropdown";
import { toast } from "sonner";


export function AppHeader() {
    const [showOptions, setShowOptions] = useState(false);
    const user = useAppSelector((state) => state.auth.user); 
    const router = useRouter();
    const dispatch = useAppDispatch();
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
  
    
    // Generate initials
    console.log("parsed user: ", user);
    const initials = user?.name
        .split(" ")
        .map((n:string) => n[0].toUpperCase())
        .slice(0, 2)
        .join("");


     //  outside click handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showOptions]);

    
    const handleLogout = async ()=>{
        try{
            const res = await axios.post('/api/auth/logout', {}, { withCredentials: true });
            localStorage.removeItem("user");
            localStorage.removeItem("school");
            dispatch(clearUser());
            dispatch(clearSchool());
            toast.success("Logout Successful.")
            router.push("/login");
        }catch(err){
            console.log(err)
        }
    }

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm mt-0">
      {/* Left: Page title */}
      <h1 className="text-xl font-semibold text-gray-800 ml-11">{pathname}</h1>

      <QuickActionDropdown headerLabel="Profile" options={[{label:"Setting", href:"#"}, {label:"Logout", href:"handleLogout"}]} footerLabel="Logout" onFooterClick={handleLogout}>
        {user?.profile?.avatar ? (
          <Image
            src={user?.profile?.avatar}
            alt={user.name}
            width={40}
            height={40}
            className="rounded-full border border-gray-300 object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition">
            {initials}
          </div>
        )}
      </QuickActionDropdown>
    </header>
  );
}
