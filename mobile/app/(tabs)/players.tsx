import React from "react";
import { Button, Text, View, Image } from "react-native";
import { StyleSheet } from "react-native";

function PlayerFeed() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={require("@/assets/images/herramienta.png")} />
      <Text style={{ fontSize: 30, textAlign: "center", marginTop: "20%" }}>
        Proximamente!
      </Text>
    </View>
  );
}

export default PlayerFeed;
