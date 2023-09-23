import Fastify from 'fastify'
import cors from '@fastify/cors'
import authRoutes from './routes/authRoutes'
import transactionRoutes from './routes/transactionRoutes'

const app = Fastify()


app.register(cors)
app.register(authRoutes)
app.register(transactionRoutes)

app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => {
  console.log('HTTP Server running!')
})