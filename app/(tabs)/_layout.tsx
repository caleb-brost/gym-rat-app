import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from "expo-router";

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return <FontAwesome6 name={name} size={24} style={{ marginBottom: -3 }} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="exercises" // default tab
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color }) => <TabBarIcon name="dumbbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
        }}
      />
    </Tabs>
  );
}
