import { supabase } from "@/lib/supabase";
import { Button, Image } from "@rneui/themed";

import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          marginBottom: 20,
          justifyContent: "space-between",
          alignContent: "flex-start",
        }}
      >
        <View style={{ padding: 20 }}>
          <Image
            source={require("@/assets/images/profile.png")}
            style={{ width: 100, height: 100 }}
          />
        </View>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>Nombre:</Text>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>Apellido:</Text>
      </View>
      <Button
        buttonStyle={styles.buttonContainer}
        title="Cerrar sesión"
        onPress={async () => {
          const { error } = await supabase.auth.signOut({ scope: "local" });
          if (error) {
            console.error("Error signing out:", error.message);
          }
          console.log("Signed out successfully");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#CC0000",
  },
});
