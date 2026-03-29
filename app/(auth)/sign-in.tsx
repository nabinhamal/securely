import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/sign-up" className="mt-4 rounded-full bg-primary px-4 py-2">
        <Text className="text-white">Go to sign up</Text>
      </Link>
    </View>
  );
};

export default SignIn;
