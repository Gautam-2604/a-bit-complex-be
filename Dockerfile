FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Generate Prisma client at runtime and then start the application
CMD ["sh", "-c", "npx prisma generate && npm start"]