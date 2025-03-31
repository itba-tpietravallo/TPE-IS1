import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

function NavigationBar() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/players")}
      >
        <Image
          style={styles.image}
          source={require("@/assets/images/player.png")}
        />
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/canchas")}
      >
        <Image
          style={styles.image}
          source={require("@/assets/images/cancha.png")}
        />
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/torneos")}
      >
        <Image
          style={styles.image}
          source={require("@/assets/images/torneo.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center", // Alinea verticalmente los items
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  separator: {
    width: 1, // Ancho de la línea divisoria
    height: "60%", // Altura de la línea divisoria (ajusta según necesites)
    backgroundColor: "#ccc", // Color de la línea divisoria
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});

export default NavigationBar;
