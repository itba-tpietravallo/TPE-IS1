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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

interface PopUpReservaProps {
  onClose: () => void;

  name: string;
  sport: string;
  location: string;
  images: string[];
  description: string;
}

function PopUpReserva({
  onClose,
  name,
  sport,
  location,
  images,
  description,
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

      <View style={styles.mainInfo}>
        <View style={styles.topInfo}>
          <View style={{ flex: 1, paddingRight: 10, alignItems: "center" }}>
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
          </View>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Image
              style={{
                width: 120,
                height: 120,
                marginTop: 10,
                marginRight: 10,
                borderRadius: 15,
              }}
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
              {/* <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                flexDirection: "column",
                margin: 10,
                }}
                ></View> */}
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.8)", // Semi-transparent background
                  padding: 20,
                }}
              >
                {images.map((uri, index) => (
                  <Image
                    key={index}
                    style={{
                      width: ScreenWidth * 0.8,
                      height: ScreenWidth * 0.8,
                      borderRadius: 10,
                      marginBottom: 20,
                    }}
                    source={{ uri: uri }}
                    resizeMode="contain"
                  />
                ))}
              </View>
            </Modal>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            style={{ width: 25, height: 25 }}
            source={require("@/assets/images/cancha.png")}
          />
          <Text style={{ fontSize: 16, fontStyle: "italic" }}>{location}</Text>
        </View>
      </View>
      <Text style={{ padding: 20, paddingBottom: 0, fontSize: 18 }}>
        Descripción:
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "gray",
          flexWrap: "wrap",
          padding: 20,
          paddingTop: 0,
        }}
      >
        {description}
      </Text>
      <View style={styles.selection}>
        <TouchableOpacity onPress={() => setShowDate(true)}>
          <Text style={styles.select}>Seleccionar fecha:</Text>
          <Text style={styles.selected}>
            {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDate && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(event, time) => {
              if (time) {
                setShowDate(false);
                setSelectedTime(time);
              }
            }}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity onPress={() => setShowTime(true)}>
          <Text style={styles.select}>Seleccionar horario:</Text>
          <Text style={styles.selected}>
            {" "}
            {selectedTime.toLocaleTimeString()}
          </Text>
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
    width: ScreenWidth * 0.9,
  },
  mainInfo: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  topInfo: {
    paddingTop: 5,
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selection: {
    padding: 20,
    gap: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  select: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#747775",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 20,
    flexDirection: "row",
  },
});

export default PopUpReserva;
