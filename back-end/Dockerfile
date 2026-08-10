FROM node:20-alpine

WORKDIR /app

# alpine ships no zone data, so a TZ env var alone would silently leave the container on UTC.
RUN apk add --no-cache tzdata

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies (devDependencies are needed for the TypeScript build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Uploads live here and are backed by a volume, so they survive rebuilds.
ENV UPLOAD_DIR=/app/uploads
RUN mkdir -p /app/uploads

# Suppresses Express' HTML error pages, which include stack traces.
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
