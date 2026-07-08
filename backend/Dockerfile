FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
# Build the application jar (skip tests for faster builds)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
# Add a small wait script to ensure MySQL is reachable before starting the app
COPY wait-for-db.sh /app/wait-for-db.sh
# install netcat and dos2unix, ensure script uses LF and is executable
RUN apk add --no-cache netcat-openbsd dos2unix \
	&& dos2unix /app/wait-for-db.sh || true \
	&& chmod +x /app/wait-for-db.sh

# Use sh to run the script to avoid exec issues from CRLF/shebang differences
ENTRYPOINT ["sh", "/app/wait-for-db.sh"]
