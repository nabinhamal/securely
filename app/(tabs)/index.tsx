import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * Root screen component that displays a centered welcome message and navigation links.
 *
 * @returns The JSX element containing a safe-area container with a headline and three navigation links.
 */
export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background ">
      <Text className="text-xl font-bold text-sucess">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 rounded-full bg-primary px-4 py-2"
      >
        <Text className="text-white">Go to onboarding</Text>
      </Link>
      <Link href="/sign-in" className="mt-4 rounded-full bg-primary px-4 py-2">
        <Text className="text-white">Go to sign in</Text>
      </Link>
      <Link
        href={{ pathname: "/subscriptions/[id]", params: { id: "1" } }}
        className="mt-4 rounded-full bg-primary px-4 py-2"
      >
        <Text className="text-white">Go to subscriptions</Text>
      </Link>
    </SafeAreaView>
  );
}
