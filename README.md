## Spring Boot Project Structure Explained
```
.
|-- README.md (For documentation)
`-- demo ( Project name)
    |-- HELP.md (Info abt directory structure, removable)
    |-- mvnw (UNIX)(Runs maven commands without having maven installed)
    |-- mvnw.cmd (WIN)(Runs maven commands without having maven installed)
    |-- pom.xml (Project Object Model.xml, has config details dependencies, etc., Like package.json)
    `-- src
        |-- main (has main class of the project from which it starts executing)
        |   |-- java
        |   |   `-- com
        |   |       `-- example
        |   |           `-- demo
        |   |               `-- DemoApplication.java
        |   `-- resources ( static files to be used in html,css,etc)
        |       |-- application.properties (config files for springboot app)
        |       |-- static (has all static resources like images,html,css,js)(sercved directly by web browser)
        |       `-- templates(directory for thymeleaf, geenrates dynamic content)
        `-- test(for testing frameworks, generally not needed)
            `-- java
                `-- com
                    `-- example
                        `-- demo
                            `-- DemoApplicationTests.java
```                            
## Running the Project

- To run any springboot project, we need to build it first, i.e. install dependencies first, like `npm install` for Js-based apps. To do the equivalent here, we run this to build the project using the Maven Wrapper:
```
./mvnw clean install
```
- To run the main class file ( here, DemoApplication.java, generally inside the main directory of src folder), we run :
```
./mvnw spring-boot:run
```
- Then, springboot starts up, loads the `application.properties` file and you can see the application in your localhost.

## Execution Flow

- Main method in the main class file(DemoApplication.java here) executes.
- This calls `SpringApplication.run(DemoApplication.class,args)`, which starts the spring boot applications and shows the logo and everything when we run `./mvnw spring-boot:run`.

## Rules of SpringBoot

- The main class should have the annotation `@SpringBootApplication` and contain the main method(`public static void main(String args[])`). It should also import the package of the main file,eg (`package com.example.[project name]`) , `SpringApplication` and `SpringBootApplication`. Given is the template :
```demo.java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
```
- Annotations : 
    - They are text which give metadata to a java program, specifying what work that is doing.
    - They reduce boilerplate.
    - They mark a class to do a specific function.
    - They abstract off some imp methods so that they don't need to be written every time . They geerate boilerplate code at runtime.
- Controllers :
    - They are classes which handle HHTP requests and are generally indicated with annotations like `@RestContoller`.
    - They have methods which map to specific HTTP endpoints like GET, POST,etc. and indicate them with annotations like `@GetMapping`,etc.
    - They are used to handle HTTP requests in Spring Boot Applications.
    - they use annotations to function, mostly `@RestController` or `@Controller`.

## All Annotations and Controllers

| Name               | Type        | Use                                                                 |
|--------------------|-------------|---------------------------------------------------------------------|
| `@Component`       | Annotation  | Generic stereotype for any Spring-managed component.               |
| `@Service`         | Annotation  | Specialization of `@Component` for service layer.                   |
| `@Repository`      | Annotation  | Specialization of `@Component` for data access layer.               |
| `@Controller`      | Annotation  | Specialization of `@Component` for presentation layer (web controllers). |
| `@RestController`  | Controller  | Combines `@Controller` and `@ResponseBody` for RESTful web services.|
| `@RequestMapping`  | Annotation  | Maps HTTP requests to handler methods of MVC and REST controllers.  |
| `@GetMapping`      | Annotation  | Maps HTTP GET requests to specific handler methods.                 |
| `@PostMapping`     | Annotation  | Maps HTTP POST requests to specific handler methods.                |
| `@PutMapping`      | Annotation  | Maps HTTP PUT requests to specific handler methods.                 |
| `@DeleteMapping`   | Annotation  | Maps HTTP DELETE requests to specific handler methods.              |
| `@Autowired`       | Annotation  | Automatically injects dependencies.                                 |
| `@Configuration`   | Annotation  | Indicates that a class declares one or more `@Bean` methods.        |
| `@Bean`            | Annotation  | Indicates that a method produces a bean to be managed by the Spring container. |
| `@Transactional`   | Annotation  | Manages transaction boundaries.                                     |
| `@RequestParam`    | Annotation  | Binds a web request parameter to a method parameter.                |
| `@PathVariable`    | Annotation  | Binds a URI template variable to a method parameter.                |