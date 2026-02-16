# open-resume-platform
A containerized Spring Boot &amp; React platform for dynamic CV generation. Features a microservice architecture using Pandoc for high-fidelity PDF/Docx export and modular content versioning.

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

````bash (Connect with)
docker exec -it pandoc_container sh
````

### 
./gradlew document-generator:bootrun

./gradlew build
cd document-generator
docker build --build-arg JAR_FILE=build/libs/\*.jar -t document-generator-gateway .

-> Creates image with tag "document-generator-gateway"

run:
docker run -p 8080:8080 document-generator-gateway
       
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

## Network Topology

**Servers in the network**
app: Spring boot application that serves the react front-end.
gateway: Spring boot microservice that takes an api call with markdown and calls the pandoc server. it then returns the docx file.
pandoc server: The pandoc server that can return a docx file with parameters.

### Pandoc server

Returns the binary blob of the docx file streamed.

**Headers**
Transfer-Encoding: chunked
Content-Type: application/octet-stream

### The gateway
There won't be any persistence of the file on this server so, to prevent using up memory unncessarily, the file data will be streamed back in the reponse in the same way - as a binary blob.
However, this time we will put the correct Content-Type header

**Headers**
Content-Type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

### The main spring boot application should
This will want the option of saving the file to the db and so will be kept in memory as a complete binary array anyway.
So the entire file binary data in the response will be read into a byte[].

This byte[] can then be saved in the database, along with the hash.

#### Response to the react application.
When the frontend react application calls on this application for a given file, the response will return the binary data in a complete response.
We don't want to Base64 encode the data so this will be a complete response

**Headers**
Content-Type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
(so it knows that it's a docx file.)

Content-Disposition: "attachment; filename=\"" + fileName + "\""
(so that the browser knows to save to the file with the given file name.)