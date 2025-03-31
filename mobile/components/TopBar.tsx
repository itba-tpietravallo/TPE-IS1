import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

function TopBar() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Image
            style={styles.image}
            source={require("@/assets/images/profile.png")}
          />
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
    justifyContent: "flex-end",
    padding: 10,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});

export default TopBar;
