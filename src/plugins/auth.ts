// src/plugins/auth.ts (保持这个版本)

import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

// 用户 payload 类型定义
export interface UserPayload {
  id: number;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// 扩展 FastifyRequest 类型
declare module "fastify" {
  interface FastifyRequest {
    user: UserPayload;
  }
}

// 认证钩子函数
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // 这里的 jwtVerify 依赖于你在 app.ts 中注册的 @fastify/jwt
    await request.jwtVerify();
  } catch (err) {
    reply.log.warn("JWT Authentication failed", err);
    reply.code(401).send({ message: "Unauthorized" });
  }
}

// fastify 插件，用于添加 server.authenticate
async function authPlugin(fastify: any) {
  fastify.decorate("authenticate", authenticate);
}

// ❌ 不要在这里写 fastify.register(jwt, ...)

export default fp(authPlugin);
