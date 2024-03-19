# Following best practices from:
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# Please read the link above before making any modifications to this file.

###############
# Build Stage # 
###############

FROM node:20.11.1-bullseye-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Run "npm ci" first so node_modules container layers are cached. This should
# allow us to quickly iterate changes to the code without having to wait for
# "npm ci" every time we commit.
WORKDIR /usr/src/app
COPY --chown=node:node packages/frontend/package.json /usr/src/app/packages/frontend/
COPY --chown=node:node packages/backend/package.json /usr/src/app/packages/backend/
COPY --chown=node:node packages/shared/package.json /usr/src/app/packages/shared/
COPY --chown=node:node package*.json ./

# Run "npm build" steps after "npm ci" to take advantage of caching.
RUN npm ci --only=production
RUN npm i typescript

ENV REACT_APP_FEATURED_ELECTIONS 4e7b3f9d-ce53-4b25-8747-b5927c6745aa,753bb873-12de-4aca-af25-e96ec72f0b49,18ad9f37-94a8-4fed-a784-83761c692052
ENV REACT_APP_KEYCLOAK_URL https://auth.star.vote:8443/realms/STARVotingDev/protocol/openid-connect
ENV REACT_APP_TITLE dev.star.vote
ENV REACT_APP_FF_PUBLIC_ELECTIONS false
ENV REACT_APP_FF_ELECTION_ROLES false
ENV REACT_APP_FF_METHOD_STAR_PR false
ENV REACT_APP_FF_METHOD_RANKED_ROBIN false
ENV REACT_APP_FF_METHOD_APPROVAL false
ENV REACT_APP_FF_METHOD_RANKED_CHOICE false
ENV REACT_APP_FF_CANDIDATE_DETAILS false
ENV REACT_APP_FF_CANDIDATE_PHOTOS false
ENV REACT_APP_FF_MULTI_RACE false
ENV REACT_APP_FF_MULTI_WINNER false
ENV REACT_APP_FF_CUSTOM_REGISTRATION false
ENV REACT_APP_FF_VOTER_FLAGGING false
ENV REACT_APP_FF_ELECTION_TALLY false
ENV REACT_APP_FF_ELECTION_TESTIMONIALS false

COPY --chown=node:node . /usr/src/app/
RUN npm run build -ws

####################
# Production Stage #
####################

FROM node:20.11.1-bullseye-slim
ENV NODE_ENV production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/packages/shared/dist /usr/src/app/packages/shared/dist
COPY --chown=node:node --from=build /usr/src/app/packages/shared/package.json /usr/src/app/packages/shared/
COPY --chown=node:node --from=build /usr/src/app/packages/frontend/build /usr/src/app/packages/frontend/build
COPY --chown=node:node --from=build /usr/src/app/packages/backend/build /usr/src/app/packages/backend/build
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/package*.json ./
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
EXPOSE 5000
