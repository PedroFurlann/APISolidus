import Fastify from 'fastify'
import cors from '@fastify/cors'
import usersRoutes from './routes/usersRoutes'
import transactionsRoutes from './routes/transactionsRoutes'
import sessionRoutes from './routes/sessionRoutes'

const app = Fastify()


app.register(cors)
app.register(usersRoutes)
app.register(transactionsRoutes)
app.register(sessionRoutes)


app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => {
  console.log('HTTP Server running!')
})