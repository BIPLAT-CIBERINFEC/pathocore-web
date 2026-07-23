FROM node:22-bookworm-slim AS dev

WORKDIR /app

EXPOSE 3000

CMD ["sh", "-lc", "if [ ! -x node_modules/.bin/next ]; then npm install --no-audit --no-fund; fi; npm run dev -- --hostname 0.0.0.0 --port 3000"]


FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund --prefer-offline --fetch-retries=3 --fetch-timeout=60000


FROM deps AS build

ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ARG NEXT_PUBLIC_MEPRAM_API_BASE_URL=/api/clinical/v1
ARG NEXT_PUBLIC_PATHOCORE_API_URL=/api/clinical/v1
ARG NEXT_PUBLIC_KEYCLOAK_URL=
ARG NEXT_PUBLIC_KEYCLOAK_REALM=ciberisciii_datahub
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=pathocore-web
ARG NEXT_PUBLIC_USE_CASE_DATA_MODE=live
ARG NEXT_PUBLIC_USE_CASE_ALERTS_CONTACT_EMAIL=
ARG AUTH_SECRET=change_me_at_runtime

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_MEPRAM_API_BASE_URL=${NEXT_PUBLIC_MEPRAM_API_BASE_URL}
ENV NEXT_PUBLIC_PATHOCORE_API_URL=${NEXT_PUBLIC_PATHOCORE_API_URL}
ENV NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
ENV NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM}
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}
ENV NEXT_PUBLIC_USE_CASE_DATA_MODE=${NEXT_PUBLIC_USE_CASE_DATA_MODE}
ENV NEXT_PUBLIC_USE_CASE_ALERTS_CONTACT_EMAIL=${NEXT_PUBLIC_USE_CASE_ALERTS_CONTACT_EMAIL}
ENV AUTH_SECRET=${AUTH_SECRET}

COPY . .
RUN npm run build


FROM node:22-bookworm-slim AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

USER node

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
