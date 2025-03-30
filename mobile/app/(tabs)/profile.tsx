import { supabase } from "@/lib/supabase";
import { Button } from "@rneui/themed";
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
		<Text>Edit app/(tabs)/profile.tsx to edit this screen.</Text>
		<Button buttonStyle={styles.buttonContainer} title="Click to Sign Out" onPress={async () => {
			const { error } = await supabase.auth.signOut({ 'scope': 'local' });
			if (error) {
				console.error("Error signing out:", error.message);
			}
			console.log("Signed out successfully");
		}}/>
	</View>
	);
};

const styles = StyleSheet.create({
	buttonContainer: {
		marginTop: 10,
		padding: 10,
		borderRadius: 15,
		backgroundColor: "#CC0000",
	}
})
