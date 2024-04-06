import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import verifyToken from '../middlewares/verifyToken';
import { prisma } from '../lib/prisma';
import * as yup from 'yup'


export default async function messagesRoutes(app: FastifyInstance) {

  app.addHook('onRequest', verifyToken) 

  app.post('/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const addMessageSchema = yup.object({
      content: yup.string().trim().required("O conteúdo da mensagem é obrigatório."),
      isUserMessage: yup.boolean().required("É obrigatória a verificação se a mensagem é do usuário"), 
    });

    const { content, isUserMessage } = await addMessageSchema.validate(request.body);
    const userId = (request as any).user.id;

    try {
      await prisma.messages.create({
        data: {
          content,
          isUserMessage,
          userId,
        },
      });

      return reply.status(200).send({ message: "Mensagem adicionada com sucesso!" });
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      return reply.status(500).send({ message: 'Erro ao adicionar mensagem.' });
    }
  });

  app.get('/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.id; 

    try {
      const messages = await prisma.messages.findMany({
        where: {
          userId,
        },
      });

      return reply.status(200).send({ messages });
    } catch (error) {
      console.error('Erro ao buscar mensagens.', error);
      return reply.status(500).send({ message: 'Erro ao buscar mensagens.' });
    }
  });

  app.delete('/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.id; 

    try {
      await prisma.messages.deleteMany({
        where: {
          userId
        }
      })

      return reply.status(200).send({ message: 'Histórico de mensagens deletado com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar histórico de mensagens.', error);
      return reply.status(500).send({ message: 'Erro ao deletar histórico de mensagens.' });
    }
  });
}