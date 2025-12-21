# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Pass build-time arguments
ARG VITE_TOKEN_ADDRESS
ARG VITE_FAUCET_ADDRESS
ARG VITE_RPC_URL

ENV VITE_TOKEN_ADDRESS=$VITE_TOKEN_ADDRESS
ENV VITE_FAUCET_ADDRESS=$VITE_FAUCET_ADDRESS
ENV VITE_RPC_URL=$VITE_RPC_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]