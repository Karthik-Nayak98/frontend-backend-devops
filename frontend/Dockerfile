# Stage 1: Build Stage
FROM node:22-alpine as builder

WORKDIR /frontend

COPY package*.json ./

# Install all dependencies (including dev) to build
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production stage
FROM node:22-slim

WORKDIR /frontend

# Copy only package files first
COPY package*.json ./

# Install prod dependencies only and install vite globally
RUN npm install --omit=dev && npm install -g vite

# Copy build output from builder stage
COPY --from=builder /frontend/dist ./dist

EXPOSE 3000 

CMD ["npm", "run", "preview"]