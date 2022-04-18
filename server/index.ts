import express, { Express } from "express";
import { createPageRenderer } from "vite-plugin-ssr";
import { config } from "dotenv";
import * as vite from "vite";
import NextAuth from "./auth";
import { telefunc, provideTelefuncContext } from "telefunc";
import $fetch from "node-fetch";
import { getSession } from "next-auth/client";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import {stringify} from '@brillout/json-s/stringify'

const require = createRequire(import.meta.url)

const Providers = require('next-auth/providers').default as typeof import('next-auth/providers').default

const __dirname = dirname(fileURLToPath(import.meta.url));

// @ts-ignore
globalThis.fetch = $fetch;

// load .env file
config();

const isProduction = process.env.NODE_ENV === "production";
const root = `${__dirname}/..`;

startServer();

async function startServer() {
  const app = express();
  installTelefunc(app);
  await installFrontend(app);
  start(app);
}

function start(app: Express) {
  const port = process.env.PORT || 3000;
  app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

function installTelefunc(app: Express) {
  app.use(express.text());
  app.all("/_telefunc", async (req, res) => {
    const { originalUrl: url, method, body } = req;

    const session = await getSession({ req });

    provideTelefuncContext({
      session,
    });
    const httpResponse = await telefunc({ url, method, body });
    res
      .status(httpResponse.statusCode)
      .type(httpResponse.contentType)
      .send(httpResponse.body);
  });
}

async function installFrontend(app: Express) {
  let viteDevServer: vite.ViteDevServer | null = null;

  if (process.env.NODE_ENV === "production") {
    const root = __dirname;
    app.use(express.static(`${root}/dist/client`));
  } else {
    const vite = await import("vite");
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: "ssr" },
    });
    app.use(viteDevServer.middlewares);
  }

  app.use(
    NextAuth({
      providers: [
        Providers.GitHub({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
      ],
    })
  );

  const renderPage = createPageRenderer({ viteDevServer, isProduction, root });

  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;
    const session = await getSession({ req });

    const pageContextInit = {
      url,
      session,
    };
    const pageContext = await renderPage(pageContextInit);
    const { httpResponse } = pageContext;
    if (!httpResponse) return next();
    const { bodyNodeStream: stream, statusCode, contentType } = httpResponse;
    res.status(statusCode).type(contentType);
    stream.pipe(res);
  });
}
