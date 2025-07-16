import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

// 定义我们想附加到 request 对象上的 user 属性的类型
// 确保这里的属性和您在生成 JWT 时放入的 payload 一致
export interface UserPayload {
  id: number; // 或者 string，取决于您的数据库
  username: string;
  email: string;
  // iat 和 exp 是 @fastify/jwt 自动添加的
  iat: number;
  exp: number;
}

// 扩展 Fastify 的 Request 类型，让 TypeScript 知道 request.user 的存在和类型
declare module "fastify" {
  interface FastifyRequest {
    user: UserPayload;
  }
}

// --- 这是您的认证钩子函数的正确、简化版本 ---
// 添加 export 关键字，使其可以被其他模块导入
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // @fastify/jwt 插件会自动从请求中 (包括 cookie) 寻找 token 并验证
    // 您只需要调用这个函数即可。
    // 如果验证成功，它会自动将解码后的 payload 附加到 request.user
    await request.jwtVerify();
  } catch (err) {
    // 如果 request.jwtVerify() 失败 (比如没有 token 或 token 无效),
    // 它会抛出一个错误，我们在这里捕获它并发送 401 响应。
    reply.log.warn("JWT Authentication failed", err);
    reply.code(401).send({ message: "Unauthorized" });
  }
}

// --- 这是将 authenticate 函数注册为 Fastify 插件的推荐方式 ---
// 您可以创建一个名为 src/plugins/auth.ts 的文件，并将以下代码放入其中
async function authPlugin(fastify: any, options: any) {
  // 使用 decorate 方法将 authenticate 函数附加到 fastify 实例上
  // 这样在其他地方就可以通过 server.authenticate 来引用它
  fastify.decorate("authenticate", authenticate);
}

export default fp(authPlugin);
