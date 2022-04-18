import { PrismaClient } from "@prisma/client";
import { shield } from "telefunc";
import { ensureUserIsValid, getUser } from "../telefunc/utils";

const t = shield.type

const prisma = new PrismaClient();

export { onNewTodo };

const onNewTodo = shield(
  [{ title: t.string, content: t.string }],
  async ({ title, content }) => {
    await ensureUserIsValid()

    const user = getUser()!;

    await prisma.todo.create({
      data: {
        author: user.name!,
        authorEmail: user.email!,
        title,
        content,
        completed: false,
      },
    });
  }
);
