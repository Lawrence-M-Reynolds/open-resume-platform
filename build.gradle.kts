plugins {
	id("org.springframework.boot") version "4.0.2" apply false
}


allprojects {
	group = "com.reynolds"
	version = "0.0.1-SNAPSHOT"
	description = "A containerized Spring Boot & React platform for dynamic CV generation. Features a microservice architecture using Pandoc for high-fidelity PDF/Docx export and modular content versioning."

	repositories { mavenCentral() }
}

subprojects {
	apply(plugin = "java")

	configure<JavaPluginExtension> {
		toolchain {
			languageVersion = JavaLanguageVersion.of(21)
		}
	}

	plugins.withType<JavaPlugin> {
		dependencies {
			val bom = platform("org.springframework.boot:spring-boot-dependencies:4.0.2")
			"implementation"(bom)
			"annotationProcessor"(bom)
		}
	}

	tasks.withType<Test> {
		useJUnitPlatform()
	}
}