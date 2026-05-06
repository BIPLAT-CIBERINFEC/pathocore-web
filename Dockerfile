FROM node:22-bookworm-slim AS dev

WORKDIR /app

EXPOSE 3000

CMD ["sh", "-lc", "if [ ! -d node_modules ]; then npm install --no-audit --no-fund --prefer-offline; fi; npm run dev -- --host 0.0.0.0 --port 3000"]


FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund --prefer-offline --fetch-retries=3 --fetch-timeout=60000


FROM deps AS build

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_KEYCLOAK_URL=
ARG VITE_KEYCLOAK_REALM=ciberisciii_datahub
ARG VITE_KEYCLOAK_CLIENT_ID=pathocore-web
ARG VITE_USE_CASE_DATA_MODE=simulated
ARG VITE_USE_CASE_ALERTS_CONTACT_EMAIL=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}
ENV VITE_USE_CASE_DATA_MODE=${VITE_USE_CASE_DATA_MODE}
ENV VITE_USE_CASE_ALERTS_CONTACT_EMAIL=${VITE_USE_CASE_ALERTS_CONTACT_EMAIL}

COPY . .
RUN npm run build


FROM node:22-bookworm-slim AS prod

WORKDIR /app

RUN npm install --global serve@14

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
