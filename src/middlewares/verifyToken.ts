import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export default async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Formato de token inválido' });
  }

  const jwtToken = token.slice(7); 

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY || "");
    (request as any).user = decoded
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido' });
  }
}