import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateToken } from '../providers/generateToken';
import { prisma } from '../lib/prisma';


const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).nullable(),
});

export default async function authenticateRoute(app: FastifyInstance) {
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      if (password === null || typeof password !== 'string') {
        return reply.status(401).send({ error: 'Password cannot be null' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password || '');

      if (!passwordMatch || !user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        facebookId: user.facebookId,
      };

      const token = generateToken(user.id, app);

      return reply.send({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Error logging in:', error);
      return reply.status(500).send({ error: 'Error logging in' });
    }
  });
}