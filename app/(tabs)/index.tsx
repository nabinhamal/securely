import ListsHeading from "@/components/ListsHeading";
import SubscriptionsCard from "@/components/SubscriptionsCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const userName = user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0] || "User";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <Image 
                  source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                  className="home-avatar" 
                />
                <View className="ml-4">
                  <Text className="text-muted-foreground text-sm font-sans-medium">Welcome back,</Text>
                  <Text className="text-2xl font-sans-bold text-primary">{userName}</Text>
                </View>
              </View>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Upcoming Bill</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  Due {formatSubscriptionDateTime(HOME_BALANCE.nextRenewalDate)}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListsHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming subscriptions
                  </Text>
                }
              />
            </View>
            <ListsHeading title={"All Subscriptions"} />
          </>
        }
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionsCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((prev) =>
                prev === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions</Text>
        }
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}

