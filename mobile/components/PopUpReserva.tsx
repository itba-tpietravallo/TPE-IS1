import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface PopUpReservaProps {
  onClose: () => void;

  name: string;
  sport: string;
  location: string;
}

function PopUpReserva({ onClose, name, sport, location }: PopUpReservaProps) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  return (
    <View style={styles.modalView}>
      <TouchableOpacity
        style={{ padding: 10, alignItems: "flex-end" }}
        onPress={onClose}
      >
        <Image
          style={{ width: 20, height: 20, marginTop: 10 }}
          source={require("@/assets/images/close.png")}
        />
      </TouchableOpacity>
      <View
        style={{
          paddingTop: 5,
          padding: 20,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>{name}</Text>
          <Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>
            {sport}
          </Text>
          <Text style={{ fontSize: 20 }}>{location}</Text>
        </View>
        <Image
          style={{ width: 100, height: 100, marginTop: 10, marginRight: 10 }}
          source={require("@/assets/images/tenis.jpeg")}
        />
      </View>
      <Text style={{ padding: 20, paddingBottom: 0 }}>Descripción:</Text>
      <Text
        style={{
          fontSize: 16,
          color: "gray",
          flexWrap: "wrap",
          padding: 20,
          paddingTop: 0,
        }}
      >
        fdaskljfadkljfklasdjfklasdjflkasdjfklasjdfsdmlkasjdmcksaldmcaskdlñfms.dfkñsadjfasdfmalskñldf
      </Text>
      <View style={{ padding: 20, gap: 30 }}>
        <TouchableOpacity onPress={() => setShowDate(true)}>
          <Text>Seleccionar fecha: {selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDate && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              if (date) {
                setShowDate(false);
                setSelectedDate(date);
              }
            }}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity onPress={() => setShowTime(true)}>
          <Text>Seleccionar horario: {selectedTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>

        {showTime && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={(event, time) => {
              if (time) {
                setShowTime(false);
                setSelectedTime(time);
              }
            }}
          />
        )}
      </View>

      <View style={{ padding: 20 }}>
        <Button title="Reservar" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    margin: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView2: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "80%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default PopUpReserva;
