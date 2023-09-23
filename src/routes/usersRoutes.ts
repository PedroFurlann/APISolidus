import { prisma } from "../lib/prisma";
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import * as yup from 'yup'

export default async function usersRoutes(app: FastifyInstance) {

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

    
}