#!/bin/bash

echo "🚀 Deploying Workflow Automation System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost:5000/api/health &> /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

echo "🎉 Deployment completed!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000/api"
echo "📊 Health Check: http://localhost:5000/api/health"
