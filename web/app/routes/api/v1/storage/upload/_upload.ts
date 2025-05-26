import { Storage } from "@google-cloud/storage";
import { __GET_PUBLIC_ENV } from "@lib/getenv.server";

import { ActionFunctionArgs } from "@remix-run/node";

const FOLDER = process.env.VERCEL_ENV == "production" ? `user-data` : `user-data-dev`;

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
	);
}

export const action = async ({ request }: ActionFunctionArgs) => {
	let { fileName } = (await request.json()) || ({ fileName: "" } as { fileName: string });

	const bucketUrl = __GET_PUBLIC_ENV().IMAGE_BUCKET_URLS.find((url) => url.includes("google"))![0];
	const bucket = bucketUrl.replaceAll("https://storage.googleapis.com/", "");

	if (!fileName) {
		return new Response("File name is required", { status: 400 });
	}

	const options = {
		version: "v4",
		action: "write",
		expires: Date.now() + 15 * 60 * 1000, // 15 minutes
		contentType: "application/octet-stream",
	} as const;

	const credentials = atob(process.env.GCP_PRODUCTION_API_KEY || "{}");
	const credentialsObject = JSON.parse(credentials);

	const storage = new Storage({
		credentials: credentialsObject,
	});

	const ext = fileName.split(".")[fileName.split(".").length - 1] || "jpg";

	fileName = `${FOLDER}/${uuidv4()}.${ext}`;

	const [url] = await storage.bucket(bucket).file(fileName).getSignedUrl(options);

	return new Response(
		JSON.stringify({ signedPUTURL: url, downloadURL: `https://storage.googleapis.com/${bucket}/${fileName}` }),
		{
			status: 200,
			statusText: "OK",
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
				"Access-Control-Allow-Origin": "*",
			},
		},
	);
};

export const loader = async ({ request }: ActionFunctionArgs) => {
	return new Response("OK", {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
	});
};
