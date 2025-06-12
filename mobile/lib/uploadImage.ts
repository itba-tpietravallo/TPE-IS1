// uri: string (ruta local de la imagen en el dispositivo)
// userId: string (opcional, para personalizar el nombre del archivo)
import * as FileSystem from "expo-file-system";

export async function uploadImageToStorage(uri: string, userId: string = "anon"): Promise<string> {
	const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;

	const apiUrl = "/api/v1/upload";
	//const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") + "/api/v1/upload";
	//const apiUrl = "http://192.168.0.10:8081/api/v1/upload";

	const res = await fetch(apiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ fileName }),
	});
	console.log("Status:", res.status); //debug
	console.log("Texto:", await res.text());

	if (!res.ok) throw new Error("No se pudo obtener la URL de subida");
	const { signedPUTURL, downloadURL } = await res.json();

	//lee el archivo como binario
	const fileData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
	const fileBuffer = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

	const uploadRes = await fetch(signedPUTURL, {
		method: "PUT",
		headers: { "Content-Type": "application/octet-stream" },
		body: fileBuffer,
	});
	if (!uploadRes.ok) throw new Error("Error al subir la imagen al bucket");

	return downloadURL;
}
