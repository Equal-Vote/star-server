FROM node:20-bookworm
# Set working directory inside the container
WORKDIR /app

# Install Playwright browsers (chromium, firefox, webkit)
RUN npx -y playwright@1.51.1 install --with-deps

RUN npm install
# Default command to run tests
CMD ["npx", "playwright", "test"]