FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY pom.xml .
COPY .mvn .mvn

# Make mvnw executable
RUN chmod +x ./mvnw

# Copy source code
COPY src ./src

# Install dependencies
RUN ./mvnw install -DskipTests

# Expose port
EXPOSE 8080

# Start the application
CMD ["./mvnw", "spring-boot:run"]