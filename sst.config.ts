/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "workforce-poc",
      removal: "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },

  async run() {

    const vpc = new sst.aws.Vpc("Vpc", {
      nat: "managed",
    });

  
    const db = new sst.aws.Postgres("Database", {
      vpc,
      scaling: { min: "0.5 ACU", max: "2 ACU" },
    });

    const redis = new sst.aws.Redis("Redis", {
      vpc,
      instance: "t4g.micro",
    });


    const bucket = new sst.aws.Bucket("Storage");


    const cluster = new sst.aws.Cluster("Cluster", { vpc });

    const sharedEnv = {
      NODE_ENV: "production",
      DATABASE_URL: $interpolate`postgresql://${db.username}:${db.password}@${db.host}:${db.port}/workforce?sslmode=require`,
      REDIS_URL: $interpolate`redis://${redis.host}:${redis.port}`,
      BETTER_AUTH_SECRET: "poc-secret-change-this-in-production-32bytes",
      BETTER_AUTH_URL: "https://api.workforce-poc.com",
      BETTER_AUTH_DOMAIN: "",
      ADMIN_FRONTEND_URL: "http://localhost:3000",
      ORG_PORTAL_BASE_URL: "http://localhost:3002",
      API_URL: "http://localhost:3001",
      CORS_URLS: "*",
      AWS_S3_REGION: "us-east-1",
      AWS_S3_ACCESS_KEY_ID: "",
      AWS_S3_SECRET_ACCESS_KEY: "",
      AWS_S3_BUCKET: bucket.name,
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: "465",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      SMTP_FROM: "",
      SMTP_FROM_NAME: "Workforce",
    };

    const api = new sst.aws.Service("Api", {
      cluster,
      cpu: "0.5 vCPU",
      memory: "1 GB",
      image: {
        dockerfile: "Dockerfile",
        context: ".",
      },
      command: [
        "sh", "-c",
        "npm run db:deploy && node apps/server/dist/src/main.js",
      ],
      environment: sharedEnv,
      loadBalancer: {
        ports: [{ listen: "80/http", forward: "3001/http" }],
      },
    });

    const frontends = new sst.aws.Service("Frontends", {
      cluster,
      cpu: "0.5 vCPU",
      memory: "1 GB",
      image: {
        dockerfile: "Dockerfile",
        context: ".",
      },
      command: [
        "sh", "-c",
        "npx turbo run start --filter=admin-web --filter=org-web",
      ],
      environment: {
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_API_URL: api.url,
        NEXT_PUBLIC_BETTER_AUTH_URL: api.url,
        PORT: "3000",
        NEXT_PUBLIC_ORG_PORTAL_PROTOCOL: "http",
        NEXT_PUBLIC_APP_DOMAIN: "localhost",
        NEXT_PUBLIC_LANDING_URL: "http://localhost:3000",
      },
      loadBalancer: {
        ports: [{ listen: "80/http", forward: "3000/http" }],
      },
    });

    new sst.aws.Service("Worker", {
      cluster,
      cpu: "0.25 vCPU",
      memory: "0.5 GB",
      image: {
        dockerfile: "Dockerfile",
        context: ".",
      },
      command: ["sh", "-c", "bun run apps/worker/src/main.ts"],
      environment: sharedEnv,
    });

  
    return {
      apiUrl: api.url,
      frontendsUrl: frontends.url,
      dbHost: db.host,
      redisHost: redis.host,
      bucketName: bucket.name,
    };
  },
});