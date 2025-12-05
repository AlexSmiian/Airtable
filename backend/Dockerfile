FROM node:18-alpine

WORKDIR /app

# Копіюємо package files
COPY package*.json ./

# Встановлюємо залежності В КОНТЕЙНЕРІ
RUN npm ci

# Копіюємо решту коду
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]