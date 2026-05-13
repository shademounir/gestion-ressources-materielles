FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
RUN npm ci --workspace backend --ignore-scripts

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY package*.json ./
COPY backend ./backend
WORKDIR /app/backend
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/package.json ./backend/package.json
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
