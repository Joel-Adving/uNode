## High performance web application framework built on uWebSockets.js

### Overview

This project leverages the high-performance capabilities of the uWebSockets.js c++ http server. It is designed to provide an API that is similar to Express, making it easy to use while also utilizing the performance benefits of uWebSockets.js.

### Key Features

- **High Performance:** Built on top of the uWebSockets.js library, this project is designed to be fast and memory efficient.
- **Express-like API:** A similar api to Express.
- **Middleware Support:** Support for the use of middleware functions to process requests and responses.
- **Route grouping:** Routes can be grouped together and have exclusive middlewares for each group individual.
- **Static file serving:** Serve static files with ease.
- **Streaming support:** Stream data to the client.
- **Performant data Parsing:** Optimized request body parsing to handle data efficiently.

### Benchmarks

All tests where done using Apache JMeter on a Windows 11 PC, WSL 2 ubuntu 22.04, AMD Ryzen 5 5600X 3,7GHz 6-core 12-thread CPU, 32GB RAM

100 concurrent users, 1 seconds ramp-up period, 60 seconds test duration.

"Hello world" plain text response.

### Result

```
74662.875 requests/second
```

## Comparison with other relevant frameworks

#### Go net/http

```
131820.081 requests/second
```

#### ASP.NET Core minimal API

```
123631.414 requests/second
```

#### uWebSockets.js

```
76586.927 requests/second
```

#### This project (uWebSockets.js)

```
74662.609 requests/second
```

#### hyper-express (uWebSockets.js)

```
65598.721 requests/second
```

#### Bun - (buns http server is also built on uWebSockets.js)

```
64097.835 requests/second
```

#### ElysiaJS

```
63300.917 requests/second
```

#### Node.js standard http library

```
32322.931 requests/second
```

#### Express.js

```
9322.392 requests/second
```
