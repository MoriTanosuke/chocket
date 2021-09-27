About this project
==================

This is a simple chat application build with [NodeJS][0] and [Socket.IO][1].

Build Status
------------

[![CI to Docker Hub](https://github.com/MoriTanosuke/chocket/actions/workflows/main.yml/badge.svg)](https://github.com/MoriTanosuke/chocket/actions/workflows/main.yml)

Run on docker
=============

You can run this project locally via [Docker][3] with the following commands:

````bash
docker build -t chocket .
docker run --rm -p 8888:8888 chocket
````

Now you can access the application at http://localhost:8888.

[0]: http://nodejs.org/
[1]: http://socket.io/
[3]: https://docker.com
