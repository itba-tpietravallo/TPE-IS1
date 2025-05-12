import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  Platform,
} from "react-native";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import { useLocation, getNearbyFieldsByLoc } from "@lib/location";
import PopUpReserva from "@components/PopUpReserva";

type Field = {
  id: string;
  name: string;
  street: string;
  street_number: string;
  neighborhood: string;
  description: string;
  sports: string[]
  images: string[];
  price: number;
  lat: number;
  long: number;
};

export default function Map() {
  const { location, errorMsg } = useLocation();

  // Default/fallback region: Buenos Aires, Argentina
  const fallbackRegion: Region = {
    latitude: -34.5778,
    longitude: -58.4264,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const { data } = getNearbyFieldsByLoc(
    location?.coords.latitude || fallbackRegion.latitude,
    location?.coords.longitude || fallbackRegion.longitude
  );

  // Once we have location, use it; otherwise fallback
  const [region, setRegion] = useState<Region>(fallbackRegion);

  const onRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMarkerPress = (field: Field): void => {
    setSelectedField(field);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : !location || !data ? (
        <>
          <ActivityIndicator size="large" />
          <Text>Loading...</Text>
        </>
      ) : (
        <>
          <MapView
            style={{ width: "100%", height: "100%" }}
            initialRegion={{
              latitude: location.coords.latitude || fallbackRegion.latitude,
              longitude: location.coords.longitude || fallbackRegion.longitude,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            onRegionChange={onRegionChange}
          >
            <YourLocationMarker
              lat={location.coords.latitude}
              long={location.coords.longitude}
            />

            {data.map((field: Field) => (
              <Marker
                key={field.id}
                coordinate={{
                  latitude: field.lat,
                  longitude: field.long,
                }}
                title={field.name}
                onPress={
                  Platform.OS === "android"
                    ? () => handleMarkerPress(field)
                    : undefined
                }
              >
                <CustomMarkerView
                  field={field}
                  onPress={() => handleMarkerPress(field)}
                  styles={styles}
                />
              </Marker>
            ))}
          </MapView>

          {/* show modal only when selectedField stops being null */}
          {selectedField && (
            <FieldModal
              field={selectedField}
              visible={isModalVisible}
              onClose={() => {
                setIsModalVisible(false);
                setSelectedField(null);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

function YourLocationMarker({ lat, long }: { lat: number; long: number }) {
  return (
    <Marker
      coordinate={{
        latitude: lat,
        longitude: long,
      }}
      title="You"
      pinColor="blue"
    >
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("@/assets/images/person.png")}
          style={{ width: 30, height: 30 }}
        />
        {Platform.OS !== "android" && (
          <Text style={styles.youMarker}>Tu ubicación</Text>
        )}
      </View>
    </Marker>
  );
}

function CustomMarkerView({
  field,
  onPress,
  styles,
}: {
  field: Field;
  onPress: () => void;
  styles: any;
}) {
  if (Platform.OS === "android") {
    return (
      // On Android, the Callout component does not behave reliably, so we've limited its usage.
      // When a user taps a marker, it opens directly without displaying the field’s name as a tooltip.
      <></>
    );
  } else {
    return (
      <Callout onPress={onPress}>
        <View style={styles.callout}>
          <Text>{field.name}</Text>
          <Image
            style={styles.image}
            source={require("@/assets/images/arrow_open.png")}
          />
        </View>
      </Callout>
    );
  }
}

function FieldModal({
  field,
  visible,
  onClose,
}: {
  field: Field;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      style={styles.modal}
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <PopUpReserva
          fieldId={field.id}
          onClose={onClose}
          name={field.name}
          location={`${field.street} ${field.street_number}, ${field.neighborhood}`}
          sport={field.sports}
          images={field.images}
          description={field.description}
          price={field.price}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 10,
    height: 10,
    resizeMode: "contain",
    marginLeft: 5,
  },
  callout: {
    flexDirection: "row",
    alignItems: "center",
  },
  youMarker: {
    fontSize: 12,
    marginTop: 2,
    backgroundColor: "white",
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: "hidden",
    textAlign: "center",
  },
});
