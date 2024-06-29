## High performance web application framework built on uWebSockets.js

### Overview

This is a web application framework that leverages the high-performance capabilities of the uWebSockets.js http server. It is designed to provide an API that is similar to Express, making it easy to use while also utilizing the performance benefits of uWebSockets.js.

### Key Features

- **High Performance:** Built on top of the uWebSockets.js library, this project is designed to be fast and memory efficient.
- **Express-like API:** A similar api to Express.
- **Middleware Support:** Support for the use of middleware functions to process requests and responses.
- **Route grouping:** Routes can be grouped together and have exclusive middlewares for each group individual.
- **Static file serving:** Serve static files with ease.
- **Streaming support:** Stream data to the client.
- **Performant data Parsing:** Optimized request body parsing to handle data efficiently.

### Benchmarks

Benchmarks where done using Apache JMeter on a Windows 11 PC, WSL 2 ubuntu 22.04, AMD Ryzen 5 5600X 3,7GHz 6-core 12-thread CPU, 32GB RAM

"Hello world" plain text response for each request for 100 concurrent users, 1 seconds ramp-up period, 60 seconds test duration.

#### Results sorted in descending order by average throughput requests/second

#### uWebSockets.js

```
74420.095 requests/second
```

#### This project

```
72475.875 requests/second
```

#### hyper-express

```
65598.721 requests/second
```

#### Bun

```
62731.935 requests/second
```

#### Express.js

```
8912.592 requests/second
```
