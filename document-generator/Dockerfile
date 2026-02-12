FROM eclipse-temurin:21-jre

# Create a system group and user without a password or home directory
RUN groupadd -r spring && useradd -r -g spring spring

# Switch to the non-root user for security
USER spring:spring

ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

ENTRYPOINT ["java","-jar","/app.jar"]