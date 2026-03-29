import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { posthog } from "@/lib/posthog";
import { styled } from "nativewind";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const { width } = Dimensions.get("window");

const Onboarding = () => {
  return (
    <SafeAreaView className="flex-1 bg-accent">
      <StatusBar style="light" />

      {/* Pattern Image - Top Positioned */}
      <View className="w-full h-[55%]">
        <Image
          source={require("../assets/images/splash-pattern.png")}
          contentFit="cover"
          style={{ width: width, height: "100%" }}
          transition={600}
        />
      </View>

      <View className="flex-1 -mt-10">
        <View className="flex-1 px-10 pb-12 justify-end">
          {/* Text Content Block */}
          <View className="items-center mb-10">
            <Text
              className="text-center text-4xl font-sans-bold text-white "
              numberOfLines={1}
            >
              Gain Financial Clarity
            </Text>
            <Text className="mt-4 text-center text-xl font-sans-medium text-white/90">
              Track, analyze and cancel with ease
            </Text>
          </View>

          {/* Get Started Button - White Pill Shape */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              posthog.capture("onboarding_get_started");
              router.push("/(auth)/sign-up");
            }}
            className="w-full items-center justify-center rounded-full bg-white py-5 shadow-xl"
          >
            <Text className="text-xl font-sans-bold ">Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
