// src/config/auth.js
export const SALT_ROUNDS = 10; // bcrypt 的盐值轮数

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

export const JWT_SECRET = process.env.JWT_SECRET; // JWT_SECRET 必须从环境变量获取

const authConfig = {
  SALT_ROUNDS,
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d", // JWT 过期时间
};

export const JWT_EXPIRES_IN = authConfig.JWT_EXPIRES_IN;
export default authConfig;
