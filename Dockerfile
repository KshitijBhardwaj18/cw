FROM 575751781540.dkr.ecr.us-east-1.amazonaws.com/node:22-alpine AS base

WORKDIR /app

COPY package.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/admin-web/package.json ./apps/admin-web/package.json
COPY apps/org-web/package.json ./apps/org-web/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/casl/package.json ./packages/casl/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/mail/package.json ./packages/mail/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY package-lock.json* ./
COPY package-lock.json* ./
 
RUN npm install --legacy-peer-deps

COPY . .

RUN npm install -g bun

RUN npm run db:generate

RUN npm run package && npm run build

CMD npm run db:deploy && npm run start