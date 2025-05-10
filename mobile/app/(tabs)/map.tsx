import { useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Modal , Image} from "react-native";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import { useLocation, getNearbyFieldsByLoc } from "@lib/location";
import { router } from "expo-router";
import PopUpReserva from "@components/PopUpReserva";

export default function Map() {
  const { location, errorMsg } = useLocation();
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

type Field = {
  id: string;
  owner: string;
  name: string;
  location: unknown; // Adjusted to match the type in `data`
  street_number: string;
  street: string;
  neighborhood: string;
  sports: string[];
  description: string;
  city: string;
  avatar_url: string;
  images: string[];
  price: number;
  lat: number;
  long: number;
  dist_meters: number;
};


  

  // Default/fallback region: Buenos Aires, Argentina
  const fallbackRegion: Region = {
    latitude: -34.5778,
    longitude: -58.4264,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const { data } = getNearbyFieldsByLoc(location?.coords.latitude || fallbackRegion.latitude,
    location?.coords.longitude || fallbackRegion.longitude);

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
          {data.map((field : Field) => (
            <Marker
              key={field.id}
              coordinate={{
                // todo dar vuelta esto!!!!!!!!!!!!!!!
                latitude: field.long,
                longitude: field.lat,
              }}
            >
              <Callout onPress={() => handleMarkerPress(field)}>
                <View style={styles.callout} >
                  <Text>{field.name}</Text>
                  <Image style={styles.image}  source={require("@/assets/images/arrow_open.png")}/>
                </View>
              </Callout>
            </Marker>
          ))}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        </MapView>

        //show modal only when selectedField is not stops being null
        {selectedField && (
          <Modal
            style={styles.modal}
            visible={isModalVisible}
            transparent={true}
            onRequestClose={() => {
              setIsModalVisible(false);
              setSelectedField(null); 
            }}
          >
            <View style={styles.centeredView}>
              <PopUpReserva
                onClose={() => setIsModalVisible(false)}
                name={selectedField.name}
                fieldId={selectedField.id}
                location={`${selectedField.street} ${selectedField.street_number}, ${selectedField.neighborhood}`}
                sport={selectedField.sports}
                images={selectedField.images}
                description={selectedField.description}
                price={selectedField.price}
              />
            </View>
          </Modal>
        )}
      </>
    )}
  </View>
);
}




const styles = StyleSheet.create({
  container: {
    flex: 1,    
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
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
		flexDirection: 'row', 
    alignItems: 'center'
	},
});
