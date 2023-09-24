FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install\
    && npm install typescript -g
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .
RUN tsc

EXPOSE 8000

CMD [ "node", "dist/main.js" ]
