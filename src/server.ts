import fastify from 'fastify'
import { env } from './env'
import { usersRoutes } from './routes/users'

const app = fastify()

app.register(usersRoutes, {
  prefix: '/users'
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server is running on port 3000')
  })
