import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { z } from 'zod';


export default async function registerRoute(app: FastifyInstance) {
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {

    const registerBody = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = registerBody.parse(request.body);

    try {
      const existingUser = await prisma.user.findFirst({    
        where: {
          email,
        }
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already in use' });
      }

      // Hash da senha antes de salvar no banco de dados
      const hashedPassword = await bcrypt.hash(password, 6);

      // Cria o novo usuário
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Retorna o novo usuário
      return reply.status(200).send({ message: "User created." });
    } catch (error) {
      console.error('Error creating user:', error);
      return reply.status(500).send({ error: 'Error creating user' });
    }
  });
}