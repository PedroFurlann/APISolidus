import Fastify from 'fastify'
import cors from '@fastify/cors'
import registerRoute from './routes/register'
import authenticateRoute from './routes/authenticate'

const app = Fastify()


app.register(cors)
app.register(registerRoute)
app.register(authenticateRoute )

app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => {
  console.log('HTTP Server running!')
})