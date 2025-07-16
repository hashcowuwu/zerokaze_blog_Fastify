// src/modules/admin/admin.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { AdminService } from "./admin.service";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../../config/auth";

// AdminService 实例将在每个处理函数中动态创建

export const getUsersHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const adminService = new AdminService(request.server.pg);
    const users = await adminService.getAllUsers();
    reply.send(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    reply
      .status(500)
      .send({ message: error.message || "Failed to fetch users" });
  }
};

export const createUserHandler = async (
  request: FastifyRequest<{
    Body: { username: string; email: string; password?: string; role?: string };
  }>,
  reply: FastifyReply,
) => {
  try {
    // 对用户的密码进行哈希处理
    const { password, ...otherData } = request.body;
    const password_hash = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : undefined;
    const userData = { ...otherData, password_hash };
    const adminService = new AdminService(request.server.pg);
    const newUser = await adminService.createUser(userData);
    reply.status(201).send(newUser);
  } catch (error: any) {
    console.error("Error creating user:", error);
    reply
      .status(500)
      .send({ message: error.message || "Failed to create user" });
  }
};

export const updateUserHandler = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: {
      username?: string;
      email?: string;
      password?: string;
      role?: string;
    };
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    // 如果请求中包含新密码，对其进行哈希处理
    const { password, ...otherData } = request.body;
    let userData = otherData;
    if (password) {
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      userData = { ...otherData, password_hash };
    }
    const adminService = new AdminService(request.server.pg);
    const updatedUser = await adminService.updateUser(parseInt(id), userData);
    if (updatedUser) {
      reply.send(updatedUser);
    } else {
      reply.status(404).send({ message: "User not found" });
    }
  } catch (error: any) {
    console.error("Error updating user:", error);
    reply
      .status(500)
      .send({ message: error.message || "Failed to update user" });
  }
};

export const deleteUserHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const adminService = new AdminService(request.server.pg);
    const success = await adminService.deleteUser(parseInt(id));
    if (success) {
      reply.status(204).send();
    } else {
      reply.status(404).send({ message: "User not found" });
    }
  } catch (error: any) {
    console.error("Error deleting user:", error);
    reply
      .status(500)
      .send({ message: error.message || "Failed to delete user" });
  }
};

export const getDashboardHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    // 你的仪表盘逻辑
    const user = request.user;
    if (!user) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const dashboardData = {
      message: "Welcome to the Admin Dashboard",
      userId: user.id,
      userName: user.username,
    };
    reply.send(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    reply.status(500).send({ message: "Failed to fetch dashboard data" });
  }
};

// ... 其他控制器处理函数
