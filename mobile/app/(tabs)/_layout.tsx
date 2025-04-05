import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import NavigationBar from "../../components/NavigationBar";
import TopBar from "@/components/TopBar";

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <Slot />
      </View>
      <NavigationBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1, // Para que el contenido ocupe el espacio restante
  },
});
