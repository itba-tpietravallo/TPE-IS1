import { supabase } from "@/lib/supabase";

export async function uploadImageToStorage(uri: string, userId: string) {
	const response = await fetch(uri);
	const blob = await response.blob();
	const fileExt = uri.split(".").pop();
	const fileName = `${userId}_${Date.now()}.${fileExt}`;
	const filePath = `teams/${fileName}`;

	let { error } = await supabase.storage.from("matchpoint-images").upload(filePath, blob, {
		contentType: blob.type,
		upsert: true,
	});

	//if (error) throw error;
	if (error) {
		console.log("Upload error:", error);
		throw error;
	}

	const { data } = supabase.storage.from("matchpoint-images").getPublicUrl(filePath);

	return data.publicUrl;
}
