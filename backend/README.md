# CRM Backend (Spring Boot)

Quick backend for the cold-calls CRM implemented with Spring Boot.
By default this scaffold is configured for MySQL. An H2 configuration remains available for quick tests.

How to run

- Build: mvn -f backend/ clean package
-- Run: mvn -f backend/ spring-boot:run  OR java -jar backend/target/crm-backend-0.0.1-SNAPSHOT.jar
-- The API root: http://localhost:8080/api/clients

MySQL setup

1. Create a database: CREATE DATABASE crmdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
2. Update backend/src/main/resources/application.properties with your MySQL username/password.

If you prefer H2 for quick testing, enable the H2 block in application.properties.

Docker

- docker build -t crm-backend:local backend/
- docker run -p 8080:8080 crm-backend:local

Frontend

The repository includes a minimal React frontend in ./frontend. To run it:

1. cd frontend
2. npm install
3. npm run dev

