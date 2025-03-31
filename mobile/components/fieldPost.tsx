import { ScreenHeight } from "@rneui/themed/dist/config";
import React from "react";
import { StyleSheet, Text, View, ImageBackground, Image } from "react-native";

interface props {
  name: string;
  sport: string;
  location: string;
}
function FieldPost(props: props) {
  const { name, sport, location } = props;
  return (
    <View>
      <ImageBackground
        style={styles.container}
        imageStyle={{ borderRadius: 15, opacity: 0.9 }}
        source={require("@/assets/images/tenis.jpeg")}
      >
        <View style={styles.topContent}>
          <Text style={styles.title}>{props.name}</Text>
          <Text style={styles.sport}>{props.sport}</Text>
        </View>
        <View style={styles.bottomContent}>
          <Image
            style={styles.icon}
            source={require("@/assets/images/cancha.png")}
          />
          <Text style={styles.text}>{props.location}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    justifyContent: "space-between",
    flexDirection: "column",
    margin: 10,
    width: ScreenHeight * 0.4,
    height: ScreenHeight * 0.4,
  },
  topContent: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 40,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#000",
    marginTop: 1,
  },
  sport: {
    fontSize: 16,
    color: "#fff",
    marginTop: 1,
    fontWeight: "bold",
  },
  icon: {
    width: 25,
    height: 25,
    borderRadius: 25,
  },
});

export default FieldPost;
