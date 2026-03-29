import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/sign-in" className="mt-4 rounded-full bg-primary px-4 py-2">
        <Text className="text-white">Go to sign in</Text>
      </Link>
    </View>
  );
};

export default SignUp;
