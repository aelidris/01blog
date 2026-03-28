# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the jar and skip tests to save time
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Create uploads folder for your blog images
RUN mkdir uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]