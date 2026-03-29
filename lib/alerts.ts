
import { Alert } from "react-native";

export const signOutAlert = (signOut: () => void) => {
  Alert.alert(
    "Log Out",
    "Are you sure you want to log out?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ],
    { cancelable: true }
  );
};

