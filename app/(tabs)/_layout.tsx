import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import { clsx } from "clsx";
import { Redirect, Tabs } from "expo-router";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";

const tabBar = components.tabBar;

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );
};
const TabLayout = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  // Wait for auth to load before rendering anything
  if (!isLoaded) {
    return null;
  }

  // Redirect to sign-in if user is not authenticated
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {isSignedIn ? (
        tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} icon={tab.icon} />
              ),
            }}
          />
        ))
      ) : null}

      {/* Conditionally render the logout button only when signed in */}
      {isSignedIn ? (
        <Tabs.Screen
          name="logout"
          options={{
            title: "Logout",
            // We use the add icon rotated 45deg to match the previous home screen signout icon
            tabBarIcon: ({ focused }) => (
              <View className="tabs-icon">
                <View className="tabs-pill">
                  <Image source={icons.add} resizeMode="contain" className="tabs-glyph" style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
              </View>
            ),
            tabBarButton: (props) => (
              <TouchableOpacity
                style={props.style}
                onPress={() => {
                  Alert.alert("Log Out", "Are you sure you want to log out?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Log Out", style: "destructive", onPress: () => signOut() },
                  ]);
                }}
              >
                {props.children}
              </TouchableOpacity>
            ),
          }}
        />
      ) : null}
    </Tabs>
  );
};

export default TabLayout;
