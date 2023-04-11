FROM node:16


# for both front and backend,
# copy appropriate package, npm install
WORKDIR /app/frontend

COPY /frontend/package*.json ./

RUN npm install

WORKDIR /app/backend

COPY /backend/package*.json ./

RUN npm install


# copy all files
WORKDIR /app

COPY . .


# build the frontend
WORKDIR /app/frontend

RUN npm run build


# start the backend
WORKDIR /app/backend

EXPOSE 5000

CMD [ "npm", "start" ]
