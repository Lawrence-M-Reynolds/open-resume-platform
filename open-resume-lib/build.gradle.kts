plugins {
    `java-library`
}

dependencies {
    implementation(libs.guava)

    compileOnlyApi("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // Use JUnit Jupiter for testing.
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
