import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateToken } from '../providers/generateToken';

export default async function authRoutes(app: FastifyInstance) {

    app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
  
      const registerSchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      });
  
      const { name, email, password } = registerSchema.parse(request.body);
  
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

    app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6).nullable(),
      });

      try {
        const { email, password } = loginSchema.parse(request.body);
  
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