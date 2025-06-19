import React from "react";
import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="termsandcondition" options={{ headerShown: false }} />
      {/* <Stack.Screen name="privacypolicy" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} /> */}
    </Stack>
  );
};

export default AuthLayout;
