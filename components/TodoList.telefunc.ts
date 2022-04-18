import { PrismaClient } from "@prisma/client";
import { shield, Abort } from "telefunc";
import {
  ensureAuthorization,
  ensureTodoExistence,
  ensureUserIsValid,
  getTodoItem,
  getUser,
} from "../telefunc/utils";

const t = shield.type;

const prisma = new PrismaClient();

export { onGetTodos, onToggleTodo, onDeleteTodo };

async function onGetTodos() {
  await ensureUserIsValid();

  const user = getUser()!;

  const todos = await prisma.todo.findMany({
    where: { authorEmail: user.email! },
  });

  return todos;
}

const onToggleTodo = shield([t.number], async (id) => {
  const todo = await getTodoItem(id);

  await ensureUserIsValid();

  await ensureAuthorization(id);

  await prisma.todo.update({
    where: {
      id,
    },
    data: {
      completed: !todo.completed,
    },
  });
});

const onDeleteTodo = shield([t.number], async (id) => {
  await ensureTodoExistence(id);

  await ensureUserIsValid();

  await ensureAuthorization(id);

  await prisma.todo.delete({
    where: {
      id,
    },
  });
});
