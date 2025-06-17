
import React from "react";
import { Stack } from "expo-router";

const AccountLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />

    </Stack>
  );
};

export default AccountLayout;
