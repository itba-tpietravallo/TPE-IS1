export const __GET_PUBLIC_ENV = (env?: "production" | "development") => {
	const DATABASE_ENDPOINT =
		(env ?? process.env.VERCEL_ENV) === "production"
			? process.env.PROD_SUPABASE_URL!
			: process.env.DEV_SUPABASE_URL!;

	const DATABASE_ANON_KEY =
		env === "production" ? process.env.PROD_SUPABASE_ANON_KEY! : process.env.DEV_SUPABASE_ANON_KEY!;

	const IMAGE_BUCKET_URLS = JSON.parse(
		(env === "production" ? process.env.IMAGE_BUCKET_URLS : process.env.IMAGE_BUCKET_URLS_DEV) || "[]",
	) as string[];

	const URL_ORIGIN =
		env === "production"
			? "https://matchpointapp.com.ar"
			: "https://tpe-is1-itba-p9nkukv55-tomas-pietravallos-projects-3cd242b1.vercel.app/";

	return {
		DATABASE_ENDPOINT,
		DATABASE_ANON_KEY,
		IMAGE_BUCKET_URLS,
		URL_ORIGIN,
	};
};
