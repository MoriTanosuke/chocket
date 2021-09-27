About this project
==================

This is a simple chat application build with [NodeJS][0] and [Socket.IO][1]. You can see it live at [http://glacial-retreat-2445.herokuapp.com/][2].

If you want your own chat, you can deploy to Heroku: 

[![deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Build Status
------------

[![Build Status](https://secure.travis-ci.org/MoriTanosuke/chocket.png?branch=master)](http://travis-ci.org/MoriTanosuke/chocket)
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
[2]: http://glacial-retreat-2445.herokuapp.com/
[3]: https://docker.com
