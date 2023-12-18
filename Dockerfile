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
COPY --chown=node:node shared shared
COPY --chown=node:node package*.json ./
WORKDIR /usr/src/app/frontend
COPY --chown=node:node frontend .
ENV REACT_APP_FEATURED_ELECTIONS 4e7b3f9d-ce53-4b25-8747-b5927c6745aa,753bb873-12de-4aca-af25-e96ec72f0b49,18ad9f37-94a8-4fed-a784-83761c692052
ENV REACT_APP_KEYCLOAK_URL https://auth.star.vote:8443/realms/STARVotingDev/protocol/openid-connect
ENV REACT_APP_FF_METHOD_STAR_PR true
ENV REACT_APP_FF_METHOD_RANKED_ROBIN true
ENV REACT_APP_FF_METHOD_APPROVAL true
ENV REACT_APP_FF_CANDIDATE_DETAILS true
ENV REACT_APP_FF_MULTI_RACE true
ENV REACT_APP_FF_MULTI_WINNER true
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
COPY --chown=node:node --from=build /usr/src/app/shared shared
COPY --chown=node:node --from=build /usr/src/app/domain_model domain_model
COPY --chown=node:node --from=build /usr/src/app/frontend/build /usr/src/app/frontend/build
COPY --chown=node:node --from=build /usr/src/app/backend/build /usr/src/app/backend/build
COPY --chown=node:node --from=build /usr/src/app/backend/node_modules /usr/src/app/backend/node_modules
COPY --chown=node:node --from=build /usr/src/app/package*.json ./
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
EXPOSE 5000
