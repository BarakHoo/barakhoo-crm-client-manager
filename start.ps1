# Start frontend, backend and database using Docker Compose
docker-compose up --build -d
Write-Host "Services started. Visit frontend at http://localhost:5173 and backend at http://localhost:8080"

docker-compose ps
