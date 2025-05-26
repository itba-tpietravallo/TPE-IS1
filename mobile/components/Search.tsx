import { Database } from "@lib/autogen/database.types";
import { supabase } from "@lib/supabase";
import { Text } from "@rneui/themed";
import { PostgrestBuilder, PostgrestFilterBuilder } from "@supabase/postgrest-js";

import { JSXElementConstructor, memo, ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { AutocompleteDropdown, AutocompleteDropdownItem } from "react-native-autocomplete-dropdown";
import { useDebouncedCallback } from "use-lodash-debounce";

const defaultRenderItem = <Item extends AutocompleteDropdownItem>(item: Item, text: string) => (
	<Text style={{ color: "#000000", padding: 15, width: "100%" }}>{item.title}</Text>
);

/**
 * Generic search component.
 * This component takes in a query and performs optimistic & cached searches on it.
 *
 * The input MUST be a raw query (PostgrestFilterBuilder), not a useQuery hook/data.
 */
export default function Search<Item extends AutocompleteDropdownItem>(props: {
	placeholder: string;
	initialData: Item[];
	renderItem: (item: Item, searchText: string) => ReactElement<any, string | JSXElementConstructor<any>> | null;
	fetchData: (text: string) => PostgrestFilterBuilder<Database["public"], Item, Item[], string, never>;
	searchField: keyof Item & string;
	setSelectedItem?: (item: Item | null) => void;
}) {
	const [selectedItem, setSelectedItem] = useState(null as Item | null);
	const [loading, setLoading] = useState(false);

	const dropdownController = useRef(null as any);

	useEffect(() => {
		if (props.setSelectedItem) {
			props.setSelectedItem(selectedItem);
		}
	}, [selectedItem]);

	const [suggestionsList, setSuggestionsList] = useState([] as any[]) as [Item[], (items: Item[]) => void];

	const getSuggestionsList = useDebouncedCallback(
		useCallback(
			async (text: string) => {
				const filterToken = text.toLowerCase().trim();
				if (filterToken.length <= 2) {
					// @NOTE: .includes() works because search is .ilike("%string%")
					if (suggestionsList.length > 0) {
						setSuggestionsList(
							suggestionsList.filter((item) =>
								(item[props.searchField] as string)
									.toLowerCase()
									.trim()
									.includes(text.toLowerCase().trim()),
							),
						);
					}
					return;
				}
				setLoading(true);
				setSuggestionsList(
					[...suggestionsList].filter((item) =>
						(item[props.searchField] as string)?.toLowerCase().trim().includes(filterToken),
					),
				);
				const data = await props.fetchData(filterToken).ilike(props.searchField, `%${filterToken}%`).limit(3);
				if (!data.error) {
					const a =
						data.data.filter((item) =>
							(item[props.searchField] as string)?.toLowerCase().includes(text.toLowerCase()),
						) || [];
					const e2N = suggestionsList.map((i) => (i[props.searchField] as string).toLowerCase().trim());
					const a2N = a.map((i) => (i[props.searchField] as string).toLowerCase().trim());
					const changed = !(e2N.every((i) => a2N.includes(i)) && a2N.every((i) => e2N.includes(i)));

					if (changed) {
						setSuggestionsList(a.map((item) => ({ ...item, title: item[props.searchField] as string })));
					}
				}
				setLoading(false);
			},
			[suggestionsList],
		),
		200,
	);

	return (
		<View
			style={[
				{ flex: 1, flexDirection: "row", alignItems: "center", width: "100%" },
				Platform.select({ ios: { zIndex: 1 } }),
			]}
		>
			<AutocompleteDropdown
				clearOnFocus={false}
				closeOnBlur={false}
				closeOnSubmit={false}
				controller={(controller) => {
					dropdownController.current = controller;
				}}
				onChangeText={getSuggestionsList}
				onSelectItem={setSelectedItem as ((item: AutocompleteDropdownItem | null) => void) | undefined}
				direction={Platform.select({ ios: "down" })}
				suggestionsListMaxHeight={250}
				renderItem={
					(props.renderItem ?? defaultRenderItem<Item>) as (
						item: AutocompleteDropdownItem,
						text: string,
					) => ReactElement<any, string | JSXElementConstructor<any>> | null
				}
				containerStyle={{ width: "100%" }}
				suggestionsListTextStyle={{ color: "#fff" }}
				// debounce={200}
				inputHeight={35}
				// loading={loading}
				showChevron={true}
				dataSet={suggestionsList}
				useFilter={false}
				onClear={() => {
					setSelectedItem(null);
				}}
				textInputProps={{
					placeholder: props.placeholder ?? "Ingrese el nombre...",
					autoCorrect: false,
					autoCapitalize: "none",
					style: {
						width: "100%",
						color: "#000000",
						paddingLeft: 18,
					},
				}}
			/>
		</View>
	);
}
