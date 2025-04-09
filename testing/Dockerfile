FROM mcr.microsoft.com/playwright:v1.51.1-noble
# Set working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./
# Install the project dependencies
RUN npm ci
# Install Playwright browsers (chromium, firefox, webkit)
RUN npx playwright install --with-deps
# Default command to run tests
CMD ["npx", "playwright", "test"]