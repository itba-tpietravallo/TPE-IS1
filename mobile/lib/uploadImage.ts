import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

export async function uploadImageToStorage(uri: string, userId: string = "anon"): Promise<string> {
	const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;

	const BASE_API_URL =
		process.env.NODE_ENV === "production"
			? "https://prod.matchpointapp.com.ar"
			: "https://dev.matchpointapp.com.ar";

	const apiUrl = `${BASE_API_URL}/api/v1/storage/upload`;

	//const apiUrl = "https://dev.matchpointapp.com.ar/api/v1/storage/upload"; //hardcoded

	const res = await fetch(apiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ fileName }),
	});
	console.log("Status:", res.status);

	if (!res.ok) {
		const errorText = await res.text();
		console.log("Texto:", errorText);
		throw new Error("No se pudo obtener la URL de subida");
	}
	const { signedPUTURL, downloadURL } = await res.json();

	//lee el archivo como binario
	const fileData = await FileSystem.readAsStringAsync(uri, {
		encoding: FileSystem.EncodingType.Base64,
	});
	const fileBuffer = Buffer.from(fileData, "base64");

	const uploadRes = await fetch(signedPUTURL, {
		method: "PUT",
		headers: { "Content-Type": "application/octet-stream" },
		body: fileBuffer,
	});
	if (!uploadRes.ok) throw new Error("Error al subir la imagen al bucket");

	return downloadURL;
}
