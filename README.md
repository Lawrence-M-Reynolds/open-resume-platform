# open-resume-platform
A containerized Spring Boot &amp; React platform for dynamic CV generation. Features a microservice architecture using Pandoc for high-fidelity PDF/Docx export and modular content versioning.

## Running

./gradlew document-generator:bootrun

./gradlew build
cd document-generator
docker build --build-arg JAR_FILE=build/libs/\*.jar -t document-generator .

-> Creates image with tag "document-generator"

run:
docker run -p 8080:8080 document-generator
















## Build the docker containers
### Start all containers
````
docker-compose up -d
````

### Stop all containers
````
docker-compose down
````

### Monitor logs
````
docker-compose logs -f
````