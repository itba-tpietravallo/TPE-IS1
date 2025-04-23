import TeamPost from "@/components/teamPost";
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

type Player = {
  id: string
  name: string
  number: number
  photo: string
}

type PropsTeam = {
  name: string;
  sport: string;
  description: string;
  players: Player[];
};

export default function TeamDetail(props: PropsTeam) {
  const { name, sport, description, players } = props;

  const handlePostTeam = () => {
      console.log("Me uni al equipo")
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TeamPost name={name} sport={sport} description={description} players={players} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f4f3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
    color: "#f18f01",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#a7a7a7",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#223332",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    color: "#223332",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#223332",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
    color: "#223332",
  },
  memberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  memberInput: {
    flex: 1,
    marginRight: 10,
    color: "#223332",
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  memberText: {
    fontSize: 16,
    color: "#223332",
  },
  removeText: {
    color: "red",
    fontSize: 14,
  },
  memberList: {
    maxHeight: 100,
    marginBottom: 15,
  },
  spacing: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    color: "black",
    flex: 1,
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "black",
  },
  publishButton: {
    backgroundColor: "black",
    padding: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginHorizontal: 100,
  },
  publishingButton: {
    backgroundColor: "#f18f01", // Cambia a naranja cuando se presiona
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  nationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  flag: {
    width: 20,
    height: 14,
    marginRight: 6,
  },
  nationality: {
    fontSize: 12,
    color: "#555",
  },
  number: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
