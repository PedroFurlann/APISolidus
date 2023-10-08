import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateToken } from "../providers/generateToken";
import * as yup from 'yup'
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from "../providers/emailSender";

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
        return reply.status(401).send({ message: 'Email ou senha inválidos.' });
      }

      if (password === null || typeof password !== 'string') {
        return reply.status(401).send({ message: 'A senha não pode ser nula.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password || '');

      if (!passwordMatch || !user) {
        return reply.status(401).send({ message: 'Email ou senha inválidos.' });
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
      return reply.status(500).send({ message: 'Erro ao realizar login.' });
    }
  });

  app.post('/forgot-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const emailSchema = yup.object({
      email: yup.string().trim().email("Digite um email válido").required("O email é obrigatório."),
    });

    try {
      const { email } = await emailSchema.validate(request.body);;
  
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
  
    if (!user) {
      return reply.status(404).send({ message: 'E-mail não encontrado.' });
    }
  
    const resetLink = `http://localhost:3000/recoveryPassword?email=${email}`;
  
    await sendPasswordResetEmail(email, resetLink);
  
    return reply.send({ message: 'E-mail de recuperação de senha enviado com sucesso.' });
    } catch (error) {
      console.error('Erro ao recuperar a senha:', error);
      return reply.status(500).send({ message: 'Erro ao recuperar a senha.' }); 
    }
  });

  app.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const resetPasswordSchema = yup.object({
      email: yup.string().trim().email("Digite um email válido").required("O email é obrigatório."),
      new_password: yup.string().trim().required("A senha é obrigatória.").min(6, "A senha deve ter no mínimo 6 carcateres.")
    });

    const { email, new_password } = await resetPasswordSchema.validate(request.body);

    // Verifique se o e-mail existe
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      return reply.status(404).send({ message: 'E-mail não encontrado.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(new_password, 6);

      await prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          password: hashedPassword,
        },
      });

      return reply.send({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      return reply.status(500).send({ message: 'Erro ao redefinir a senha.' });
    }
  });
}