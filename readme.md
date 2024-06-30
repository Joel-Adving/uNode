# uNode

uNode is a high-performance Node.js framework built on top of uWebSockets.js, providing a fast and efficient solution for building web servers and applications.

## Features

- Blazing fast performance with uWebSockets.js
- Simple and intuitive API
- Route groups
- Middleware support
- Static file serving
- Streaming support
- Handling of cookies and request bodies

## Installation

```bash
npm i "@oki.gg/unode"
```

## Examples

Minimalistic chainable API

```ts
import { App } from '@oki.gg/unode'

new App().get('/', () => 'Hello World!').listen(3000)
```

Or more verbose traditional way

```ts
import { App } from '@oki.gg/unode'

const app = new App()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
```

#### Route groups

```ts
import { App, Group } from '@oki.gg/unode'
const app = new App()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
```

### Benchmark

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

#### uNode (This project (uWebSockets.js))

```

74662.875 requests/second

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
