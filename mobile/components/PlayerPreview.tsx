import React from "react";
import { Text, View, Image } from "react-native";
import { supabase } from "@/lib/supabase";

import { getUserAvatar } from "@/lib/autogen/queries";

type PlayerPreviewProps = {
	player_name: string;
};

function PlayerPreview({ player_name }: PlayerPreviewProps) {
	const { data: player_avatar } = getUserAvatar(supabase, player_name);
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Image source={{ uri: "https://github.com/tomaspietravallo.png" }} />
			<View style={{ flex: 1, marginLeft: 12 }}>
				<Text style={{ fontSize: 16, fontWeight: "bold" }}>{player_name}</Text>
			</View>
		</View>
	);
}

export default PlayerPreview;
