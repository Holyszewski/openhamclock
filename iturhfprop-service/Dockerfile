FROM ubuntu:22.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js and utilities
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create directory for ITURHFProp
WORKDIR /opt/iturhfprop

# Download the latest release (v14.2) - binaries zip
RUN curl -L -o binaries.zip "https://github.com/ITU-R-Study-Group-3/ITU-R-HF/releases/download/v14.2/ITURHFProp_14_02.zip" \
    && unzip binaries.zip \
    && rm binaries.zip

# Download required data files
RUN curl -L -o data.zip "https://github.com/ITU-R-Study-Group-3/ITU-R-HF/releases/download/v14.2/Data.zip" \
    && unzip data.zip \
    && rm data.zip

# Make Linux binary executable and set library path
RUN chmod +x /opt/iturhfprop/ITURHFProp || true
ENV LD_LIBRARY_PATH=/opt/iturhfprop:$LD_LIBRARY_PATH

# List contents to verify
RUN echo "=== ITURHFProp files ===" && ls -la /opt/iturhfprop/ && echo "=== Data files ===" && ls -la /opt/iturhfprop/Data/ 2>/dev/null || ls -la /opt/iturhfprop/data/ 2>/dev/null || echo "Data dir not found"

# Set up the API service
WORKDIR /app
COPY package.json ./
RUN npm install --production

COPY server.js ./

# Environment - adjust DATA path based on actual structure
ENV PORT=3000
ENV ITURHFPROP_PATH=/opt/iturhfprop/ITURHFProp
ENV ITURHFPROP_DATA=/opt/iturhfprop/Data

EXPOSE 3000

CMD ["node", "server.js"]
