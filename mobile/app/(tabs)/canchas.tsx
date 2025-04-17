import FieldPost from "@/components/fieldPost";
import { ScrollView, Text, View, SafeAreaView, StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";

type Field = {
	// lat: number;
	// long: number;
	// dist_meters: number;
	id: string;
	owner: string;
	avatar_url: string;
	// ----------
	name: string;
	images: string[];
	sports: string[];
	street_number: string;
	street: string;
	neighborhood: string;
	description: string;
};

function CanchasFeed() {
	const [fields, setFields] = useState<Field[]>([]);

	// useEffect(() => {
	//   supabase
	//     .rpc("nearby_fields", {
	//       lat: -34.601, // @todo get user location
	//       long: -58.382,
	//       lim: 10,
	//     })
	//     .then(({ data, error }) => {
	//       if (error) {
	//         console.error("Error fetching fields:", error);
	//       } else {
	//         console.log("Fetched fields:", data);
	//         setFields(data);
	//       }
	//     });
	// }, []);
	useEffect(() => {
		supabase
			.from("fields")
			.select("*")
			.then(({ data, error }) => {
				if (error) {
					console.error("Error fetching fields:", error);
				} else {
					setFields(data);
				}
			});
	}, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#f2f4f3",
			}}
		>
			<ScrollView
				horizontal={false}
				contentContainerStyle={{ flexDirection: "column", paddingBottom: 100 }}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				{fields.map((field) => (
					<FieldPost
						name={field.name}
						sport={field.sports[0]}
						location={`${field.street} ${field.street_number}, ${field.neighborhood}`}
						key={field.id}
						images={field.images}
						description={field.description}
					/>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8f8f8",
		justifyContent: "center",
		alignItems: "center",
		borderColor: "#ccc",
		borderRadius: 10,
		padding: 120,
	},
	buttonContainer: {
		marginTop: 10,
		padding: 10,
		borderRadius: 15,
		backgroundColor: "#CC0000",
	},
});

export default CanchasFeed;
