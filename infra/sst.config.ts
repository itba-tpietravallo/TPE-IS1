/// <reference path="./.sst/platform/config.d.ts" />

// aws sso login --sso-session=matchpoint-sso-sst

export default $config({
	app(input) {
		return {
			name: "infra",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					profile: input.stage === "production" ? "matchpoint-prod" : "matchpoint-dev",
					region: "us-east-1",
				},
				gcp: {
					project: "tpe-is1-itba-matchpoint",
					region: "SOUTHAMERICA-EAST1",
					version: "8.31.0"
				}
			},
		};
	},
	async run() {
		/// <reference path="./.sst/platform/config.d.ts" />
		const GCP_PROJECT_NAME = "tpe-is1-itba-matchpoint";
		const GCP_STORAGE_REGION = "SOUTHAMERICA-EAST1"
		const DEFAULT_CORS = [
			{
				"origins": ["*"],
				"methods": ["*"],
				"maxAgeSeconds": 3600,
				"responseHeaders": ["*"]
			}
		];
		const bucket = new sst.aws.Bucket("MyBucket"); 

		const gcpBucket = new gcp.storage.Bucket("test-sst-bucket", {
			location: GCP_STORAGE_REGION,
			storageClass: "STANDARD",
			publicAccessPrevention: "inherited",
			project: GCP_PROJECT_NAME,
			cors: DEFAULT_CORS,
			softDeletePolicy: {
				retentionDurationSeconds: 0,
			},
		});

		return {
			name: bucket.name,
			gcp: gcpBucket.name,
		}

	},
});
