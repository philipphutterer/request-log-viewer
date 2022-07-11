# WIP: Request Log Viewer

The idea for this web application is to be able to view the HTTP requests send
by any website on any device with ease.
On desktop devices one can use the developer tools of most common browsers,
but I don't know of such a thing for mobile devices (e.g. smartphones, tablets)
that works seemlessly.

It is meant to be served on small computer like a Raspberry Pi 4 that is
capable of running a chromium instance.

## Installation

```console
git clone https://github.com/philipphutterer/request-log-viewer
cd request-log-viewer
npm install
```

## Development

Start the [express](http://expressjs.com/) server

```console
npm start
```

Linting can be done using

```console
npm run lint
```

