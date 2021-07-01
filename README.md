# Jenkins Job DSL Playground

http://job-dsl.herokuapp.com/

An app for debugging Groovy scripts using the [Jenkins Job DSL](https://github.com/jenkinsci/job-dsl-plugin). Allows the user to create jobs with the DSL and view the generated XML.

Powered by [Ratpack](https://github.com/ratpack/ratpack). 

You can run the app locally with:

```bash
./gradlew run
```

Or build a dockker image using the locally included Dockerfile.

```
docker build -t dsl-playground .
docker run -p 5050:5050 dsl-playground
```

https://github.com/ewypych/docker-job-dsl-playground
