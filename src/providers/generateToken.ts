import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

export function generateToken(userId: number, app: FastifyInstance): string {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY || 'your-secret-key', {
    expiresIn: '8h', // Tempo de expiração do token (1 hora neste exemplo)
  });

  return token;
}