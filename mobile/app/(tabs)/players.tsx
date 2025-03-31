import React from "react";
import { Button, Text, View } from "react-native";
import { StyleSheet } from "react-native";

function PlayerFeed() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 30, textAlign: "center", marginTop: "20%" }}>
        Acá se van a mostrar los jugadores disponibles y/o los equipos
        disponibles
      </Text>
    </View>
  );
}

export default PlayerFeed;
