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

function TopBar() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}> MatchPoint</Text>
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
    justifyContent: "space-between",
    padding: 10,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins",
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#f18f04",
    marginLeft: 10,
  },
});

export default TopBar;
