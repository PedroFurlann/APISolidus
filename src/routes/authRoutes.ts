import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import * as yup from 'yup'
import { generateToken } from '../providers/generateToken';

export default async function authRoutes(app: FastifyInstance) {

    app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
  
      const registerSchema = yup.object({
        name: yup.string().trim().required("O nome é obrigatório."),
        email: yup.string().trim().email("Digite um email válido").required("o email é obrigatório."),
        password: yup.string().trim().min(6, "A senha deve ter no mínimo 6 caracteres").required("a senha é obrigatória."),
      });
  
      const { name, email, password } = await registerSchema.validate(request.body);
  
      try {
        const existingUser = await prisma.user.findFirst({    
          where: {
            email,
          }
        });
  
        if (existingUser) {
          return reply.status(400).send({ error: 'Email já está em uso.' });
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
        return reply.status(200).send({ message: "Usuário criado com sucesso" });
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return reply.status(500).send({ error: 'Erro ao criar usuário' });
      }
    });

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