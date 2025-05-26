export const __GET_PUBLIC_ENV = (env?: "production" | "development") => {
	if (env == undefined) {
		env = process.env.VERCEL_ENV as "production" | "development";
	}

	const DATABASE_ENDPOINT =
		(env ?? process.env.VERCEL_ENV) === "production"
			? process.env.PROD_SUPABASE_URL!
			: process.env.DEV_SUPABASE_URL!;

	const DATABASE_ANON_KEY =
		env === "production" ? process.env.PROD_SUPABASE_ANON_KEY! : process.env.DEV_SUPABASE_ANON_KEY!;

	const IMAGE_BUCKET_URLS = JSON.parse(
		(env === "production" ? process.env.IMAGE_BUCKET_URLS : process.env.IMAGE_BUCKET_URLS_DEV) ||
			'["https://infra-tpe-is1-itba-matchpoint-matchpointimagesbucket-eftkorha.s3.amazonaws.com/","https://storage.googleapis.com/matchpoint-images-c4b3845"]',
	) as string[];

	const URL_ORIGIN = env === "production" ? "https://matchpointapp.com.ar" : "https://dev.matchpointapp.com.ar/";

	return {
		DATABASE_ENDPOINT,
		DATABASE_ANON_KEY,
		IMAGE_BUCKET_URLS,
		URL_ORIGIN,
	};
};
