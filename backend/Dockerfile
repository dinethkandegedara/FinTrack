# ==============================================================================
# Stage 1: Build the Spring Boot Fat JAR using Maven
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-25-noble AS builder

WORKDIR /build

# Cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and compile
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Minimal Runtime Stage
# ==============================================================================
FROM eclipse-temurin:25-jre-noble AS runtime

WORKDIR /app

# Create a non-privileged application user for security
RUN groupadd -r fintrack && useradd -r -g fintrack -m -s /bin/bash fintrack

# Copy the executable jar from the build stage
COPY --from=builder /build/target/*.jar app.jar

# Adjust ownership
RUN chown -R fintrack:fintrack /app

USER fintrack

# Expose HTTP port
EXPOSE 8080

# Configure JVM memory settings and container awareness
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
