import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";

export function generateToken(userId: number, app: FastifyInstance) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY || "", {
    expiresIn: "2h",
  }); 
  return token;
}
