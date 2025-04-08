import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

interface PopUpReservaProps {
  onClose: () => void;

  name: string;
  sport: string;
  location: string;
  images: string[];
}

function PopUpReserva({
  onClose,
  name,
  sport,
  location,
  images,
}: PopUpReservaProps) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const [isModalVisible, setIsModalVisible] = useState(false);

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
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              justifyContent: "center",
            }}
          >
            {name}
          </Text>
          <Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>
            {sport}
          </Text>
          <Text style={{ fontSize: 20 }}>{location}</Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Image
            style={{ width: 120, height: 120, marginTop: 10, marginRight: 10 }}
            source={{ uri: images[0] }}
          />
          <Modal
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              justifyContent: "center",
              margin: 20,
              overflow: "hidden",
              flex: 1,
            }}
            visible={isModalVisible}
            transparent={true}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                flexDirection: "column",
                margin: 10,
              }}
            ></View>
          </Modal>
        </TouchableOpacity>
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
            minuteInterval={30}
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
    color: "#00ff00",
    overflow: "hidden",
  },
});

export default PopUpReserva;
