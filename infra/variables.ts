/// <reference path="./.sst/platform/config.d.ts" />

export default {
	// Vercel
	VERCEL_PROJECT_NAME: "tpe-is1-itba",
	VERCEL_PROJECT_ID: "prj_ldCfxyRRWv1oORFBTKw00tAslNea",
	// GCP
	GCP_PROJECT_NAME: {
		PRODUCTION: "tpe-is1-itba-matchpoint",
		DEVELOPMENT: "tpe-is1-itba-matchpoint-dev",
	},
	GCP_STORAGE_REGION: "SOUTHAMERICA-EAST1",
	GCP_DEFAULT_CORS: [
		{
			origins: ["*"],
			methods: ["*"],
			maxAgeSeconds: 0,
			responseHeaders: ["*"],
		},
	],
	GCP_BUCKET_STORAGE_CLASS: "STANDARD" as gcp.storage.BucketArgs["storageClass"],
	// AWS
	AWS_PROFILES: {
		PRODUCTION: "matchpoint-prod",
		DEVELOPMENT: "matchpoint-dev",
	},
	AWS_REGION: {
		PRODUCTION: "sa-east-1",
		DEVELOPMENT: "us-east-1",
	} as { [key: string]: aws.Region },
	AWS_DEFAULT_CORS: {
		allowHeaders: ["*"],
		allowOrigins: ["*"],
		allowMethods: ["DELETE", "GET", "HEAD", "POST", "PUT"] as ["DELETE", "GET", "HEAD", "POST", "PUT"],
		exposeHeaders: [],
		maxAge: "0 seconds" as const,
	},
};
