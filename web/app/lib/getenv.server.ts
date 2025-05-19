export const __GET_PUBLIC_ENV = (env: "production" | "development") => {
	const DATABASE_ENDPOINT = env === "production" ? process.env.PROD_SUPABASE_URL! : process.env.DEV_SUPABASE_URL!;

	const DATABASE_ANON_KEY =
		env === "production" ? process.env.PROD_SUPABASE_ANON_KEY! : process.env.DEV_SUPABASE_ANON_KEY!;

	const IMAGE_BUCKET_URLS = JSON.parse(
		(env === "production" ? process.env.IMAGE_BUCKET_URLS : process.env.IMAGE_BUCKET_URLS_DEV) || "[]",
	) as string[];

	return {
		DATABASE_ENDPOINT,
		DATABASE_ANON_KEY,
		IMAGE_BUCKET_URLS,
	};
};
