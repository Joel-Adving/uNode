# uNode

uNode is a high-performance Node.js web api framework built on top of uWebSockets.js with multi-threading support. It is designed to be simple, fast, and easy to use. uNode is inspired by Express.js and ASP.NET Core minimal API. 

## Features

- Blazing fast performance
- Multi-threading
- Simple and intuitive API
- Route groups
- Middleware
- File serving
- Streaming
- Cookies  
- Request body parsing

## Installation

```bash
npm i "@oki.gg/unode"
```

### Important Note on Async Request Handling

uNode is built on top of uWebSockets.js, which has specific constraints regarding asynchronous operations within route handlers. You must not access the request object (req) after using await or  returning a promise. This is due to the fact that the request object is not valid after the asynchronous operation completes.

Attempting to access the request object after an asynchronous operation will result in an error like the following:
  
```bash
Error: uWS.HttpRequest must not be accessed after await or route handler return. See documentation for uWS.HttpRequest and consult the user manual.
```

### Workaround

To work around this limitation, extract all necessary information from the request object before performing any asynchronous operations. Here is an example:

```ts
.get('/', async (req, res) => {
  const someHeader = req.getHeader('someHeader')
  const body = await req.body()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  res.json({ someHeader, body })
})
```

## Documentation

#### Minimalistic chainable API

```ts
new App()
  .get('/', () => 'Hello World!')
  .listen(3000)
```

#### Or a more verbose traditional way

```ts
const app = new App()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
```

#### Multi-threaded server

```ts
const app = new App({ threads: 4 }) // defaults to 1 thread if not specified
```

#### Request body parsing and JSON response

```ts
app.post('/', async (req, res) => {
  const body = await req.body()
  res.json(body)
})	
```

#### Route groups

```ts
const group = new Router()
  .get('', () => 'Get all')
  .post('', () => 'Created')
  .get('/:id', () => 'Get by id')
  .delete('/:id', () => 'Deleted')

app
  .group('/api', group)
  .listen(3000)
```

#### Middleware

```ts
app.use((req, res, next) => {
  console.log('Middleware')
  next()
})
```

#### Sending files

```ts
app.get('/file', (req, res) => {
  res.sendFile('path/to/file')
})
```

#### Static file serving from a directory

```ts
app.get('/*', serveStatic('path/to/directory'))
```

#### Params and query

```ts
app.get('/:id', (req, res) => {
  const id = req.params.id
  const query = req.getQueryParams()
  res.json({ id, query })
})
```

#### Cookies

```ts
app.get('/', (req, res) => {
  // Get cookie
  const cookie = req.getCookie('name')
  // Set cookie
  res.setCookie('name', 'value', {
    maxAge: 3600,
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  })
  res.send(cookie)
})
```

## Performance Benchmark

All tests where done using Apache JMeter on a Windows 11 PC, WSL 2 ubuntu 22.04, AMD Ryzen 5 5600X 3,7GHz 6-core 12-thread CPU, 32GB RAM

100 concurrent users, 1 seconds ramp-up period, 60 seconds test duration.

"Hello world" plain text response.

### Result

```
160091.185 requests/second (multi-threaded, 4 threads)
77227.514 requests/second (single-threaded)
```

## Comparison with other relevant frameworks

#### uNode (multi-threaded, 4 threads) (uWebSockets.js)

```
160091.185 requests/second
```

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
78089.792 requests/second
```

#### uNode (single-threaded) (uWebSockets.js)

```
77227.514 requests/second
```

#### hyper-express (uWebSockets.js)

```
65598.721 requests/second
```

#### Bun (Buns http server is also built on uWebSockets.js)

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
