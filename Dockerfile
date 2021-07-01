FROM openjdk:8
WORKDIR /usr/src
COPY . /usr/src
RUN /usr/src/gradlew build
CMD [ "./gradlew", "run" ]
