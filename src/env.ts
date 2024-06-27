const port = Number(process.env.PORT)

if (!port) {
  throw new Error('PORT is not defined in .env')
}

export const env = {
  port
}
