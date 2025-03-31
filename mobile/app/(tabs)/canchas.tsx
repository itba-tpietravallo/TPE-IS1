import FieldPost from "@/components/fieldPost";
import React from "react";
import { ScrollView, Text, View, SafeAreaView, StyleSheet } from "react-native";

function CanchasFeed() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ScrollView
        horizontal={false}
        contentContainerStyle={{ flexDirection: "column" }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <FieldPost
          name="Canchas 1"
          sport="tenis"
          location="ITBA Sede Rectorado"
        />
        <FieldPost name="cancha2" sport="tenis" location="dmskladmlk" />
        <FieldPost name="cancha3" sport="tenis" location="dmskladmlk" />
        <FieldPost name="cancha4" sport="tenis" location="dmskladmlk" />
        <FieldPost name="cancha5" sport="tenis" location="dmskladmlk" />
        <FieldPost name="cancha5" sport="tenis" location="dmskladmlk" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 120,
  },
  buttonContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#CC0000",
  },
});

export default CanchasFeed;
