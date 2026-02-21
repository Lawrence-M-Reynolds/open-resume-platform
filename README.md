# open-resume-platform

A containerized Spring Boot & React platform for dynamic CV generation. Features a microservice architecture using Pandoc for high-fidelity PDF/DOCX export and modular content versioning.

**Note:** This app has no authentication or rate limiting. For demo/portfolio use only; do not expose with sensitive data.

## Running

### Pandoc as Server (port 3030)

```bash
cd /home/lawrence-reynolds/development/Job-Application-Tools/cv-generator
```

```bash
docker rm pandoc_container
docker run --rm \
        --user $(id -u):$(id -g) \
       --volume "$(pwd):/data" \
       --volume $(pwd)/../Job-Application-Tools-Secure/cv-generator-config:/etc/cv-generator-config:ro \
       --name pandoc_container -d -p 3030:3030 pandoc/core server
```

Connect with:

```bash
docker exec -it pandoc_container sh
```

### Run portal or gateway locally (build + JAR)

Build from project root:

```bash
./gradlew build
```

Run the portal (default port 8080):

```bash
java -jar resume-builder-portal/build/libs/resume-builder-portal-0.0.1-SNAPSHOT.jar
```

Build and run the gateway Docker image:

```bash
cd document-generator-gateway
docker build --build-arg JAR_FILE=build/libs/*.jar -t document-generator-gateway .
```

Creates image with tag "document-generator-gateway".

Run:

```bash
docker run -p 8080:8080 document-generator-gateway
```

## Build the docker containers

### Start all containers

```bash
docker-compose up -d
```

### Stop all containers

```bash
docker-compose down
```

### Monitor logs

```bash
docker-compose logs -f
```

With Compose, the portal is on **http://localhost:8081** (mapped from 8080 in the container).

## Resume API

Base path: **`/api/v1/resumes`**

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/` | Create a resume (title ≥3 chars, markdown non-blank) |
| GET    | `/` | List all resumes |
| GET    | `/{id}` | Get one resume |
| PATCH  | `/{id}` | Update a resume |
| POST   | `/{id}/generate` | Generate DOCX for download |

When the portal is running, open **Swagger UI**: http://localhost:8080/swagger-ui.html (or port 8081 if using Docker Compose).

## Network Topology

**Servers in the network**

- **app (resume-builder-portal):** Spring Boot application that serves the React front-end and the resume API.
- **gateway (document-generator-gateway):** Spring Boot microservice that takes an API call with markdown and calls the Pandoc server. It then returns the DOCX file.
- **pandoc server:** The Pandoc server that can return a DOCX file with parameters.

### Pandoc server

Returns the binary blob of the DOCX file streamed.

**Headers**

- Transfer-Encoding: chunked
- Content-Type: application/octet-stream

### The gateway

There won't be any persistence of the file on this server. To prevent using up memory unnecessarily, the gateway reads the full response from Pandoc and returns it in the response with the correct Content-Type (no streaming).

**Headers**

- Content-Type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

### The main spring boot application

This will want the option of saving the file to the db and so will be kept in memory as a complete binary array anyway. So the entire file binary data in the response will be read into a byte[].

This byte[] can then be saved in the database, along with the hash.

#### Response to the react application

When the frontend React application calls on this application for a given file, the response will return the binary data in a complete response. We don't want to Base64 encode the data so this will be a complete response.

**Headers**

- Content-Type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" (so it knows that it's a docx file.)
- Content-Disposition: "attachment; filename=\"" + fileName + "\"" (so that the browser knows to save to the file with the given file name.)
