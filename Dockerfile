# Following best practices from:
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# Please read the link above before making any modifications to this file.

###############
# Build Stage # 
###############

FROM node:latest AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Run "npm ci" first so node_modules container layers are cached. This should
# allow us to quickly iterate changes to the code without having to wait for
# "npm ci" every time we commit.
WORKDIR /usr/src/app/frontend
COPY --chown=node:node frontend/package*.json ./
RUN npm ci --only=production
WORKDIR /usr/src/app/backend
COPY --chown=node:node backend/package*.json ./
RUN npm ci --only=production

# Run "npm build" steps after "npm ci" to take advantage of caching.
WORKDIR /usr/src/app
COPY --chown=node:node domain_model domain_model
WORKDIR /usr/src/app/frontend
COPY --chown=node:node frontend .
RUN npm run build
WORKDIR /usr/src/app/backend
COPY --chown=node:node backend .
RUN npm run-script build

####################
# Production Stage #
####################

FROM node:16.19.1-bullseye-slim
ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/domain_model domain_model
COPY --chown=node:node --from=build /usr/src/app/frontend/build /usr/src/app/frontend/build
COPY --chown=node:node --from=build /usr/src/app/backend/build /usr/src/app/backend/build
CMD ["dumb-init", "node", "backend/build/backend/src/index.js"]

EXPOSE 5000
