import { useInsertFieldReview } from "@lib/autogen/queries";
import { Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

export default function StarRating({ onRate, value = 0 }: { onRate: (rating: number) => void; value?: number }) {
	const [rating, setRating] = useState(value);

	useEffect(() => {
		setRating(value);
	}, [value]);

	const handleStarClick = (starIndex: number) => {
		const newRating = rating === starIndex ? 0 : starIndex;
		setRating(newRating);
		onRate(newRating);
	};

	return (
		<View style={styles.container}>
			<View style={[styles.row, { justifyContent: "center" }]}>
				<View style={styles.starRow}>
					{[1, 2, 3, 4, 5].map((starIndex) => (
						<TouchableOpacity
							key={starIndex}
							onPress={() => handleStarClick(starIndex)}
							accessibilityRole="radio"
							accessibilityState={{ selected: rating === starIndex }}
							accessibilityLabel={`Rate ${starIndex} star${starIndex !== 1 ? "s" : ""}`}
						>
							<Star
								size={32}
								color={starIndex <= rating ? "#FACC15" : "#D1D5DB"}
								fill={starIndex <= rating ? "#FACC15" : "none"}
							/>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		padding: 24,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
	},
	starRow: {
		flexDirection: "row",
	},
	submitButton: {
		marginLeft: 16,
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: "#E5E7EB",
		borderRadius: 8,
	},
	submitText: {
		fontSize: 16,
		color: "#262626",
	},
});
