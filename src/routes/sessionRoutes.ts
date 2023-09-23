import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateToken } from "../providers/generateToken";
import * as yup from 'yup'
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';

export default async function sessionRoutes(app: FastifyInstance) {
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const loginSchema = yup.object({
      email: yup.string().trim().email("Digite um email válido").required("O email é obrigatório."),
      password: yup.string().trim().min(6, "A senha deve ter no mínimo 6 caracteres").required("A senha é obrigatória."),
    });

    try {
      const { email, password } =  await loginSchema.validate(request.body);

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Email ou senha inválidos' });
      }

      if (password === null || typeof password !== 'string') {
        return reply.status(401).send({ error: 'A senha não pode ser nula' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password || '');

      if (!passwordMatch || !user) {
        return reply.status(401).send({ error: 'Email ou senha inválidos' });
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
      console.error('Erro ao realizar login:', error);
      return reply.status(500).send({ error: 'Erro ao realizar login' });
    }
  });
}