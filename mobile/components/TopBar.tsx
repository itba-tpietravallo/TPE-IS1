import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type User = {
  id: string;
  full_name: string;
  avatar_url: string;
};

function TopBar() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching user:", error);
          } else {
            setUser(data);
          }
        });
    });
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 30, height: 30, resizeMode: "contain" }}
          />
          <Text style={styles.title}> Match</Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Poppins",
              fontWeight: "bold",
              color: "#223332",
              marginLeft: 0,
              paddingLeft: 0,
            }}
          >
            Point
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Image style={styles.image} source={{ uri: user?.avatar_url }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    borderRadius: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins",
    fontWeight: "bold",
    color: "#f18f04",
    marginRight: 0,
    paddingRight: 0,
  },
});

export default TopBar;
