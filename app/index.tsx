import React from "react";
// import { useRouter } from "expo-router";
// import { useAuth } from "@/context/AuthContext";
import SplashScreen from "./SplashScreen";


export default function Index() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
// console.log("CHECKED")
//  useEffect(() => {
//    if (!loading) {
//      console.log("Loading complete, user:", user);
//      if (!user) {
//        router.replace("/(tabs)");
//      } else {
//        router.replace("/auth");
//      }
//    }
//  }, [loading, user, router]);


  return <SplashScreen />;
}
