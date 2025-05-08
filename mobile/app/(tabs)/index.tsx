import CanchasFeed from "./canchas";
import { Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

export default function Index() {
	// return (
	// 	<View>
	// 		<MapView
	// 			googleMapId={"AIzaSyBw6wwGh_tfBhOikkUtc8uibxX1GPbr1ew"}
	// 			provider={PROVIDER_GOOGLE}
	// 			region={{
	// 				latitude: 37.78825,
	// 				longitude: -122.4324,
	// 				latitudeDelta: 0.0922,
	// 				longitudeDelta: 0.0421,
	// 			}}
	// 			style={{ width: "100%", height: 300 }}
	// 		/>
	// 	</View>
	// );
	return <CanchasFeed />;
}
