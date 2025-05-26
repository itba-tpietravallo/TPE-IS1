import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, Pressable } from "react-native";

type SelectorProps<T> = {
	title?: string;
	options: T[];
	onSelect: (option: T) => void;
	initialLabel?: string;
	getLabel: (option: T) => string;
};

export default function Selector<T>({ title, options, onSelect, initialLabel, getLabel }: SelectorProps<T>) {
	const [modalVisible, setModalVisible] = useState(false);
	const [selected, setSelected] = useState<T | null>(null);

	const handleSelect = (option: T) => {
		setSelected(option);
		onSelect(option);
		setModalVisible(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{title}</Text>
			<TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selector} activeOpacity={0.8}>
				<Text style={styles.selectorText}>{selected ? getLabel(selected) : initialLabel}</Text>
			</TouchableOpacity>

			<Modal
				visible={modalVisible}
				animationType="fade"
				transparent={true}
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
					<View style={styles.modalContent}>
						<Text style={styles.optionsTitle}>¿Quién va a jugar?</Text>
						<FlatList
							data={options}
							keyExtractor={(item, index) => `${getLabel(item)}-${index}`}
							renderItem={({ item, index }) => {
								const isSelected = selected && getLabel(item) === getLabel(selected);
								return (
									<TouchableOpacity
										onPress={() => handleSelect(item)}
										style={[
											styles.option,
											index === options.length - 1 && { borderBottomWidth: 0 },
										]}
									>
										<Text
											style={[
												styles.optionText,
												isSelected && { color: "#f18f01", fontWeight: "bold" },
											]}
										>
											{getLabel(item)}
										</Text>
									</TouchableOpacity>
								);
							}}
						/>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		padding: 20,
	},
	title: {
		fontWeight: "bold",
		fontSize: 16,
		marginBottom: 10,
	},
	optionsTitle: {
		fontWeight: "bold",
		fontSize: 20,
		marginBottom: 10,
	},
	selector: {
		paddingVertical: 8,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		backgroundColor: "transparent",
	},
	selectorText: {
		fontSize: 16,
		color: "#555",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		width: "80%",
		maxHeight: "50%",
		elevation: 5,
	},
	option: {
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	optionText: {
		fontSize: 16,
		color: "#333",
	},
});
