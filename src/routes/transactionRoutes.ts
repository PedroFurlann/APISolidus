import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import verifyTokenMiddleware from '../middlewares/verifyToken';
import { prisma } from '../lib/prisma';
import * as yup from 'yup'

interface TransactionParams {
  id: string;
}

enum TransactionType {
  PROFIT = 'PROFIT',
  LOSS = 'LOSS',
}

export default async function transactionRoutes(app: FastifyInstance) {
  
  app.addHook('onRequest', verifyTokenMiddleware);

  app.post('/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
    const createTransactionSchema = yup.object({
      title: yup.string().trim().required("O título é obrigatório."),
      type: yup.string().trim().required("O tipo é obrigatório."), 
      category: yup.string().trim().required("A categoria é obrigatória."),
      amount: yup.number().required("O valor é obrigatŕio."),
    });

    const { title, type, category, amount } = await createTransactionSchema.validate(request.body);
    const userId = (request as any).user.id;
    const adjustedAmount = type === TransactionType.PROFIT ? amount : -amount;


    try {
      const newTransaction = await prisma.transactions.create({
        data: {
          title,
          type,
          category,
          amount: adjustedAmount,
          userId,
        },
      });

      return reply.status(200).send({ transaction: newTransaction });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return reply.status(500).send({ error: 'Erro ao criar transação' });
    }
  });

  app.get('/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.id; 

    try {
      const transactions = await prisma.transactions.findMany({
        where: {
          userId,
        },
      });

      return reply.status(200).send({ transactions });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return reply.status(500).send({ error: 'Erro ao buscar transações' });
    }
  });

  app.get('/transactions/:id', async (request: FastifyRequest<{ Params: TransactionParams }>, reply: FastifyReply) => {

    const transactionId = parseInt(request.params.id, 10);
    const userId = (request as any).user.id; 

    try {
      const transaction = await prisma.transactions.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

      if (!transaction) {
        return reply.status(404).send({ error: 'Transação não encontrada' });
      }

      return reply.status(200).send({ transaction });
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return reply.status(500).send({ error: 'Erro ao buscar transação' });
    }
  });

  app.delete('/transactions/:id', async (request: FastifyRequest<{ Params: TransactionParams }>, reply: FastifyReply) => {
    const transactionId = parseInt(request.params.id, 10);
    const userId = (request as any).user.id; 

    try {
      const transaction = await prisma.transactions.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

      if (!transaction) {
        return reply.status(404).send({ error: 'Transação não encontrada' });
      }

      await prisma.transactions.delete({
        where: {
          id: transactionId,
        },
      });

      return reply.status(200).send({ message: 'Transação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return reply.status(500).send({ error: 'Erro ao deletar transação' });
    }
  });
}