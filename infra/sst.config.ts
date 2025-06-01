/// <reference path="./.sst/platform/config.d.ts" />
// aws sso login --sso-session=matchpoint-sso-sst
// aws sts get-caller-identity --profile=matchpoint-dev
export default $config({
	async app(input) {
		(await import("dotenv")).config();
		const vars = (await import("./variables")).default;
		return {
			name: "infra",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					profile:
						input.stage === "production" ? vars.AWS_PROFILES.PRODUCTION : vars.AWS_PROFILES.DEVELOPMENT,
					region: input.stage === "production" ? vars.AWS_REGION.PRODUCTION : vars.AWS_REGION.DEVELOPMENT,
				},
				gcp: {
					project:
						input.stage === "production"
							? vars.GCP_PROJECT_NAME.PRODUCTION
							: vars.GCP_PROJECT_NAME.DEVELOPMENT,
					region: vars.GCP_STORAGE_REGION.toLowerCase(),
					version: "8.31.0",
				},
				vercel: {
					version: "1.15.0", // note: resource-vercel-v3.2.1/pulumi-resource-vercel is very much broken, using 1.15.0 for now
					apiToken: process.env.VERCEL_API_TOKEN, // note: vercel does not read this automatically, needs to be passed in
				},
			},
		};
	},
	async run() {
		(await import("dotenv")).config();
		const vars = (await import("./variables")).default;

		const imageBuckets = await createPublicStorageBuckets("matchpoint-images", vars);

		new vercel.ProjectEnvironmentVariable("vercel-env-var-image-bucket", {
			projectId: vars.VERCEL_PROJECT_ID,
			key: $app.stage === "production" ? "IMAGE_BUCKET_URLS" : "IMAGE_BUCKET_URLS_DEV",
			value: $util.jsonStringify(imageBuckets.map((b) => b.url)),
			targets: ["production", "development", "preview"],
		});

		new vercel.ProjectEnvironmentVariable("vercel-env-var-google-maps", {
			projectId: vars.VERCEL_PROJECT_ID,
			key: "GOOGLE_MAPS_WEB_API_KEY",
			value: process.env.GOOGLE_MAPS_WEB_API_KEY || "",
			targets: ["production", "development", "preview"],
		});

		return {
			imageBuckets: imageBuckets.map((b) => b.url),
		};
	},
});
async function createPublicStorageBuckets(name: string, vars: typeof import("./variables").default) {
	const awsBucket = new sst.aws.Bucket(name, {
		cors: vars.AWS_DEFAULT_CORS,
		access: "public",
	});

	const gcpBucket = new gcp.storage.Bucket(name, {
		location: vars.GCP_STORAGE_REGION.toLowerCase(),
		storageClass: vars.GCP_BUCKET_STORAGE_CLASS,
		publicAccessPrevention: "inherited",
		cors: vars.GCP_DEFAULT_CORS,
		softDeletePolicy: {
			retentionDurationSeconds: 0,
		},
	});

	gcpBucket.onObjectFinalized(name, {
		location: vars.GCP_STORAGE_REGION.toLowerCase(),
		bucket: gcpBucket,
		callback: async (event) => {
			await fetch(new URL(event.name, 'https://matchpointapp.com.ar/pubsub/').toString(), {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	});

	new gcp.storage.BucketAccessControl("matchpoint-images-access-policy", {
		bucket: gcpBucket.name,
		entity: "allUsers",
		role: "READER",
	});
	
	return [
		{ bucket: awsBucket, url: awsBucket.domain.apply((d) => `https://${d}/`) },
		{
			bucket: gcpBucket,
			url: gcpBucket.name.apply((b) => `https://storage.googleapis.com/${b}`),
		},
	];
}
