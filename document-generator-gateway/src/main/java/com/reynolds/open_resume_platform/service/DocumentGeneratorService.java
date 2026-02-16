package com.reynolds.open_resume_platform.service;

import com.reynolds.open_resume_platform.dto.FileType;
import com.reynolds.open_resume_platform.dto.Files;
import com.reynolds.open_resume_platform.dto.PandocCvRequest;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.lang.invoke.MethodHandles;


@Service
public class DocumentGeneratorService {

    private static final Logger logger = LoggerFactory
            .getLogger(MethodHandles.lookup().lookupClass());

    private final RestClient restClient;

    public DocumentGeneratorService(RestClient restClient) {
        this.restClient = restClient;
    }

    public StreamingResponseBody callService() {
        Files files = new Files(getReferenceDoc());
        PandocCvRequest pandocCvRequest = new PandocCvRequest(getCvMarkdown(), FileType.DOCX, files);
        logger.debug("Preparing Pandoc request for streaming...");

        return outputStream -> {
            this.restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Accept", "application/octet-stream")
                    .body(pandocCvRequest)
                    .exchange((request, response) -> {
                        try (var inputStream = response.getBody()) {
                            inputStream.transferTo(outputStream);
                        } catch (Exception e) {
                            logger.error("Streaming failed", e);
                        }
                        return null;
                    });
        };
    }

    private static @NonNull String getCvMarkdown() {
        String cvMarkdown = """
                ::: {custom-style="Title"}
                Lawrence Reynolds
                :::
                
                ::: {custom-style="Subtitle"}
                Senior Java Developer (15 years)\\
                {EMAIL_PLACEHOLDER} \\| {PHONE_PLACEHOLDER} \\| Bracknell, UK\\
                [linkedin.com/in/lawrence-reynolds-52822a48](https://www.linkedin.com/in/lawrence-reynolds-52822a48)
                \\|
                [github.com/Lawrence-M-Reynolds](https://github.com/Lawrence-M-Reynolds)
                :::
                
                ::: {custom-style="date"}
                Availability: Immediate
                :::
                
                <!-- Core Java Developer profile. -->
                
                # Profile
                
                Senior Software Engineer with over 15 years of experience building and
                optimising mission-critical enterprise Java systems. Proven track record
                of enhancing application performance, solving complex architectural
                challenges, and delivering robust API integrations in high-traffic
                environments. Notably diagnosed and fixed critical performance issues,
                significantly reducing server CPU usage. Passionate about code quality,
                applying best practices, and guiding less experienced developers.
                
                # Technical Skills
                
                **Core Languages:** Java (8-17), SQL, JavaScript, Python.
                
                **Frameworks:** Spring, Spring MVC, OSGi.
                
                **Tools & DevOps:** Docker, Git, Maven, Gradle, Jenkins, Bamboo, AWS,
                Microsoft Azure, Splunk.
                
                **Servers:** Apache Tomcat, Apache HTTP Server.
                
                **Databases:** Oracle, MySQL, Apache Jackrabbit.
                
                <!-- Latest employment positions - post AEM roles -->
                
                # Employment
                
                ## Career Sabbatical (Sep 2025 -- Present)
                
                Undertaking a planned career break focused on personal development.
                
                **Completed the Coursera Specialisation "Deep Learning" with Andrew Ng**
                
                Completed a comprehensive five-course curriculum covering the
                theoretical foundations and practical applications of modern deep
                learning. Key areas of study included:
                
                - Fundamentals of Neural Networks, implementing deep learning algorithms
                  from scratch using **Python** and **NumPy**.
                - Hyperparameter tuning, regularisation (Dropout, L2), and optimisation
                  algorithms (Adam, Mini-batch gradient descent).
                - Training complex architectures, including Convolutional Neural
                  Networks (CNNs) and Sequence Models (RNNs, Transformers) using
                  **TensorFlow** and **Keras**.
                
                ## Open GI -- Lead Software Engineer (Sep 2024 -- Aug 2025)
                
                *Worcester, United Kingdom*
                
                Lead Java Developer responsible for enhancing the core Payment
                Processing Module and extending the Insurance Quote Request Gateway to
                support a new Quote Engine Service.
                
                **Payment Processing Module**
                
                - Designed and developed the Spring-based backend architecture for the
                  new Pay-by-Link functionality, enabling customers to pay via the
                  provider's website.
                - Refactored a legacy SOAP-only shared library to support RESTful
                  services, enabling support for arbitrary HTTP methods and resource
                  paths.
                - Designed and implemented MySQL schema changes, including new tables
                  and stored procedures.
                - Implemented a new SOAP endpoint to process Pay-by-Link-related
                  messages from broker back-office systems.
                - Diagnosed critical configuration flaws in the provider's test
                  environment that had previously blocked progress. Led the
                  collaboration with the provider to successfully resolve the issues.
                
                **Quote Gateway**
                
                - Extended the handler logic to route quotes for specific brokers to a
                  new backend quote system.
                - Set up a new Azure deployment pipeline for the updated handler
                  configuration.
                
                **Operational Improvements**
                
                - Formalised a robust manual validation protocol for database rollbacks,
                  establishing a reliable method to verify schema consistency following
                  a rollback.
                - Implemented a real-time monitoring solution for failed quote requests
                  by integrating a stored procedure with Microsoft Teams workflows for
                  instant alerting.
                
                ***Technologies:** Java 11, Spring, MySQL, Gradle, Apache Tomcat, Apache
                HTTP Server, Microsoft Azure.*
                
                <!-- Previous AEM roles -->
                
                ## IG Index -- Senior Software Developer (Apr 2022 -- May 2024)
                
                *London, United Kingdom*
                
                Lead AEM Backend Java Developer for the high-traffic IG.com platform.
                Managed and developed the strategy to complete the version upgrade of
                the AEM platform (6.4 to 6.5).
                
                **AEM 6.4 to 6.5 migration**
                
                - Created a sophisticated implementation of an ACS Commons OnDeploy
                  script to migrate over 10,000 "designs" data nodes from '/etc' to
                  '/apps' in the JCR, while taking automatic backups in case of failure.
                  Thorough and well-planned testing led to a zero-defect production
                  release.
                - Led the planning and execution of the custom components and
                  functionality migration, notably refactoring container components
                  (tabs, accordions) to align with the Adobe Core Components standard.
                - Guided other developers on how to migrate component dialogs, including
                  the migration of the WYSIWYG component.
                
                **Development of New Features and Performance/Support fixes**
                
                - Mentored other developers on how to utilise the Sling and OSGi
                  frameworks as well as the Apache Jackrabbit content repository.
                - Adapted and refactored the OnDeploy script used in the migration to
                  make other repository content changes. This replaced an existing
                  Python script that was increasing HTTP traffic due to API calls and
                  causing data inconsistencies across servers.
                - Proposed and implemented a new caching strategy using Sling URL
                  selectors to replace legacy parameter-based calls. This enabled Apache
                  HTTP Server caching via TTL headers instead of the standard AEM flush
                  mechanism, significantly improving API response times.
                - Diagnosed a severe performance bottleneck affecting content authors by
                  isolating a recursive JSP method that triggered redundant, high-cost
                  backend queries. Eliminating this method call significantly reduced
                  CPU usage and improved page load speeds.
                - Diagnosed critical test environment crashes using Splunk log analysis
                  to pinpoint and resolve a Servlet deadlock.
                - Guided frontend developers with JavaScript, NPM build, and AEM script
                  configuration issues.
                - Identified and bridged a critical infrastructure knowledge gap within
                  the team by reverse-engineering the server configuration. Created
                  comprehensive technical documentation on the configuration and
                  deployment processes.
                - Created various Splunk queries to analyse the logs for general
                  diagnostics and to identify issues such as long-running requests.
                
                ***Technologies:** Java 11, Java 17, Maven, OSGi, Splunk, Sling, Apache
                Jackrabbit, AEM 6.5, Apache HTTP Server, Bamboo, JavaScript.*
                
                ## Digitalum -- Senior Java Developer (Feb 2020 -- Apr 2022)
                
                *Lummen, Belgium*
                
                **Bridgestone E-commerce Website**
                
                Delivered the brand's first e-commerce rollout in France ("First Stop"),
                integrating AEM with a Magento backend via GraphQL.
                
                - Developed backend AEM Java code. For example, I added a servlet as an
                  endpoint to interact with the DriveRight API, allowing vehicles to be
                  looked up by license plate.
                - Implemented a retriever for a custom Magento entity, addressing
                  extensibility limitations in the out-of-the-box code by developing
                  multiple Java lambdas.
                - Implemented the "Delegate Pattern" required for some of the commerce
                  integration code. I contributed to a thread on testing this in the
                  Adobe AEM forum.
                - Worked on various frontend tasks, including vanilla JavaScript and
                  React with Apollo, which were used for e-commerce functionality.
                
                **Yamaha Motor E-commerce Website**
                
                Developed full-stack features for the apparel e-commerce platform using
                AEM, HTML/JS, and AWS Serverless architecture.
                
                - Replaced the Adobe CIF code with custom AWS Lambdas to interact with
                  the backend Commerce Tools system.
                - Developed new features, including: displaying related items for
                  different products using custom fields set in Commerce Tools, and
                  building Vue.js product listings.
                - Introduced the product discount features to the website.
                - Used the Groovy console to make updates to properties in the AEM JCR.
                - Refactored complex frontend JavaScript and recovered an inconsistent
                  git repository due to missing commits from a previous migration.
                
                **Firestone E-commerce Website**
                
                Established the corporate website infrastructure, coordinating directly
                with client teams to define deployment strategies.
                
                - Planned and documented the deployment process for the client's
                  infrastructure team to follow.
                - Configured the Sling mappings in AEM and aligned them with the
                  dispatcher configurations.
                - Developed 'Inheritance-aware' components (e.g., Social Share),
                  enabling child pages to dynamically inherit configuration from parent
                  nodes.
                - Set up the dispatchers and the Varnish configuration in the client's
                  environment, liaising with their team to gather the required
                  information on the existing infrastructure process.
                
                **Bose E-commerce Website**
                
                Optimized the existing retail site and led the migration from AEM 5.6 to
                6.5.
                
                - Developed various components that set links so that authors could
                  specify URL parameters to append. This change was applied to the rich
                  text plugin and to other components that use the pathfield dialog
                  component.
                - Updated and developed components for the AEM 6.5 migration. Notably
                  guiding the frontend team using experience from Black Sun with
                  migrating the WYSIWYG component, which had notoriously complex
                  configuration and JavaScript.
                - Diagnosed and resolved a critical server-side defect caused by Edge
                  Side Includes (ESI) in the Dispatcher, which created inconsistencies
                  with backend Java logic.
                - Optimized Multi-Site Manager (MSM) rollout configurations to ensure
                  correct URL translation and localization across internal site
                  variations.
                - Migrated the logic to process Hybris product data imports to a Kafka
                  consumer class. This involved translating from an old API to a new one
                  that had been developed so that the old import process could still be
                  used.
                - Resolved complex security configuration issues, notably diagnosing
                  missing role privileges for administrative staff.
                - Designed and implemented a custom Error Monitoring Dashboard, allowing
                  administrators to view error messages occurring from failed Kafka
                  messages.
                
                ***Technologies:** Java 1.8, Maven, AWS Lambdas, OSGi, Sling, Apache
                Jackrabbit, AEM 6.5, GraphQL, Apache HTTP Server, Jenkins, JavaScript,
                Vue.js, React, Varnish.*
                
                ## IBM iX -- Senior Java Developer (Oct 2018 -- Jan 2020)
                
                *Bracknell, United Kingdom*
                
                Served as lead developer on an AEM website implementation for NSK,
                quickly assuming responsibility for mentoring junior developers and
                conducting code reviews. Key tasks included:
                
                - Configured dispatchers (Apache caches), including the use of TTL
                  instead of the usual AEM flush mechanism.
                - Identified critical issues at code review regarding threading,
                  logging, and security.
                - Led a project to create a tool that would analyse components on an AEM
                  instance and automatically generate example pages.
                - Developed complex AEM Workflows for multi-lingual translation and
                  review, integrating a customized 'page diff' tool to streamline the
                  editorial approval process.
                - Developed a forms component utilizing Sling Servlets and requiring
                  complex backend validation, secure data processing, and automated
                  email integration.
                - Developed content fragments for scheduling customer events that could
                  be displayed on the main website and added to site visitors'
                  calendars.
                - Prototyped a headless AEM implementation with React. [Contributed an
                  approved solution to using Experience Fragments to the official Adobe
                  forum](https://experienceleaguecommunities.adobe.com/t5/adobe-experience-manager/aem-6-4-with-spa-editor-how-to-use-the-experience-fragments/td-p/322742).
                - Identified and applied optimisations, notably improving a frontend
                  JavaScript search component by reducing the number of asynchronous
                  calls to fetch data from the backend servlet.
                
                ***Technologies:** Java 1.8, Maven, OSGi, Sling, Apache Jackrabbit, AEM
                6.5, Apache HTTP Server, CI/CD, JavaScript.*
                
                ## Black Sun Plc -- Java Developer (Apr 2016 -- Aug 2018)
                
                *London, United Kingdom*
                
                Core Developer delivering enterprise-scale Content Management solutions
                for high-profile clients, including Temasek, Burberry, and Compass
                Group. Served as a Senior Developer for a multi-tenant AEM platform
                hosting 20+ sites and Lead Developer for the Inchcape Connect Intranet.
                
                **Core Engineering & Delivery**
                
                - Selected as a key developer for a critical onsite delivery in
                  Singapore (Temasek Review), configuring the initial environment and
                  establishing the core JavaScript architecture.
                - Collaborated with client stakeholders and project managers to
                  translate business requirements into technical specifications.
                - Acted as the sole maintainer of technical documentation, creating
                  in-depth developer guides and handover instructions for client teams.
                - Provided technical support for remote stakeholders, notably diagnosing
                  a reported error for a remote user, deducing via code and browser data
                  analysis alone that the user was on an undisclosed touchscreen device.
                
                **AEM Platform**
                
                Key Backend Developer for the Temasek corporate website and a
                multi-tenant platform hosting 20+ sites.
                
                - Resolved dependency and service binding issues with the OSGi bundles.
                - Developed components to integrate with external APIs, including a
                  Twitter feed, news aggregator, and share price feed.
                - Managed the server infrastructure, maintaining Author, Publisher, and
                  Dispatcher instances alongside load balancer configuration.
                - Led the migration to Touch UI, creating new admin consoles and
                  coordinating with the frontend team for the websites.
                - Delivered successful production rollouts for major corporate websites,
                  including Burberry and Compass Group.
                - Hardened application security to align with OWASP standards,
                  implementing defenses against Clickjacking, Log Injection, and
                  Cross-Site Scripting (XSS).
                
                **Inchcape Connect Intranet**
                
                Implemented using Liferay, an open-source CMS built with portlets.
                
                - Collaborated with the Lead Architect to engineer the UAT
                  infrastructure, configuring the database, application servers, and web
                  tier.
                - Managed the platform configuration, establishing site structures, user
                  roles, and permissions to meet business requirements.
                - Developed bespoke portlets, including an "Ask Exec Team" workflow
                  system. This involved designing custom database entities, implementing
                  Lucene search indexers, and building role-based permission logic.
                - Coordinated the release cycle, managing deployments of new features
                  and applying critical core product patches.
                - Resolved defects in both custom code and the core product, documenting
                  reproduction steps and liaising directly with the vendor (Liferay) to
                  implement fixes.
                - Diagnosed and fixed client-side JavaScript issues, including resolving
                  HTTP request limitations (URL length) and asynchronous chat data
                  failures.
                
                ***Technologies:** Java 1.6, Maven, OSGi, Sling, Apache Jackrabbit, AEM
                6.2, JavaScript, Apache HTTP Server, MySQL, HTML, Liferay 6.*
                
                <!-- Java roles before AEM -->
                
                ## Thomson Reuters -- Java Developer (Sep 2014 -- Mar 2016)
                
                *London, United Kingdom*
                
                Joined the team to work on implementing a new court management (CMS) and
                electronic filing (EFile) system in the Royal Courts of Justice. These
                were built upon products still under development in the US.
                
                **Custom Feature Implementation**
                
                - Engineered configuration and code changes to enable support for both
                  Oracle database and MSSQL.
                - Implemented code and configuration changes to enable communication
                  between the CMS and EFile systems.
                - Integrated payment functionality to allow customers to provide account
                  numbers.
                - Developed a custom feature, allowing case parties to be added to a
                  filing for a case.
                - Enabled law firms to have multiple addresses, ensuring that the new
                  data structure was synchronised between the EFile and CMS.
                - Facilitated the migration to Liquibase and implemented the necessary
                  scripts for the RCJ environment.
                
                **Coordinated the CMS/EFile Release**
                
                - Prepared database scripts.
                - Resolved issues during deployment.
                - Documented the changes and the release process.
                
                **Defect Resolution & Core Product Support**
                
                - Liaised with the US team to resolve issues.
                - Debugged and fixed a customised Spring BeanWrapper, which was
                  incorrectly binding values from specific date fields.
                - Fixed Hibernate queries and stored procedures (both Oracle and SQL
                  Server).
                - Identified long-running issues related to the changing core product
                  that impacted the RCJ's implementation.
                
                ***Technologies:** Java 1.6, Maven, Spring MVC, Hibernate, Liquibase,
                FreeMarker templates, Custom tags, JavaScript, GIT, JIRA, Stash,
                Jenkins, SQL Server, Oracle.*
                
                ## BNP Paribas -- Java Developer (Mar 2013 -- Jun 2014)
                
                *London, United Kingdom*
                
                Managed the end-to-end development of "Headcount," an internal
                application for monitoring fixed-income staff, and led the migration and
                first production rollout of the "Scorecard" project.
                
                - Resolved critical stability issues, identifying and fixing Java
                  heap/out-of-memory errors.
                - Automated data synchronization by implementing a Quartz scheduler to
                  process and update records from external database feeds.
                - Developed a bulk-import feature using Apache POI, enabling the parsing
                  of complex Excel datasets to update the Oracle database.
                - Managed database schema changes, applying DDL and DML scripts for new
                  features and performance improvements.
                - Documented a legacy database architecture, reverse-engineering the
                  schema to produce detailed Entity-Relationship Diagrams (ERDs) and
                  stored procedure documentation.
                - Led a database migration of spreadsheet-based business data.
                  Collaborated with stakeholders to map the data to the schema.
                  Developed, documented, and rigorously tested robust SQL scripts,
                  ensuring a successful release the first time.
                
                ***Technologies:** Java 1.5, Maven, Spring MVC, POI, Quartz, JUnit,
                Oracle, WAS 6.1, JQGrid, JSP, JavaScript.*
                
                ## Waitrose -- Java Developer (Dec 2011 -- Sep 2012)
                
                *Bracknell, UK*
                
                Delivered change requests and resolved critical defects within the
                backend Java integration layer and database schemas.
                
                ***Technologies:** Java 1.5, WebSphere Commerce 6, Struts, Ibatis.*
                
                # Education
                
                **Postgraduate Certificate in Applied Computing (Distinction)** \\|
                *University of Brighton / FDM Academy (2011 -- 2012)*
                
                Developed an algorithmic counterpoint composition tool using the Command
                design pattern and Java Sound API.
                
                **MSc Laser Photonics and Modern Optics** \\| *University of Manchester
                (2004 -- 2005)*
                
                **BSc (Hons) Physics (2.2)** \\| *Sheffield Hallam University (2000 --
                2003)*
                
                # Interests
                
                - **Tennis:** Active club player.
                - **Music:** Studying music theory and composition.
                
                """;
//        cvMarkdown = "TEST OVERRIDE";
        return cvMarkdown;
    }

    private static String getReferenceDoc() {
        return "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";
    }
}
