import { Abort, getContext } from "telefunc";
import type { DefaultSession, Session } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export {
  getUser,
  getTodoItem,
  ensureTodoExistence,
  ensureUserIsValid,
  ensureAuthorization,
};

function getUser() {
  const context = getContext<{ session: Session | null }>();

  if (context.session) {
    // cache = context.session.user
    return context.session.user;
  }
}

async function getTodoItem(id: number) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) {
    throw Abort(); // See https://telefunc.com/permissions
  }
  return todo;
}

async function ensureTodoExistence(id: number) {
  // `getTodoItem()` will `throw Abort()` if the to-do doesn't exist
  await getTodoItem(id);
}

async function ensureUserIsValid() {
  const user = getUser();

  if (!user) {
    throw Abort();
  }
}

async function ensureAuthorization(id: number) {
  const user = getUser()!;
  const todo = await getTodoItem(id);

  if (user.email !== todo.authorEmail) {
    throw Abort();
  }
}
