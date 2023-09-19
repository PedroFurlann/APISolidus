import Fastify from 'fastify'
import cors from '@fastify/cors'
import registerRoute from './routes/register'

const app = Fastify()


app.register(cors)
app.register(registerRoute)

app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => {
  console.log('HTTP Server running!')
})