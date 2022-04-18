// https://github.com/s-kris/vite-ssr-starter/blob/master/server/index.ts
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { Router } from 'express'
import { IncomingMessage, ServerResponse } from 'http'
import { createRequire } from 'module'
import type { NextAuthOptions } from 'next-auth'

const require = createRequire(import.meta.url)

const NextAuth = require('next-auth').default as typeof import('next-auth').default

/**
 * Should match the following paths:
 * /api/auth/signin
 * /api/auth/signin/:provider
 * /api/auth/callback/:provider
 * /api/auth/signout
 * /api/auth/session
 * /api/auth/csrf
 * /api/auth/providers
 * /api/auth/_log
 *
 * See: https://next-auth.js.org/getting-started/rest-api
 */
const authActions = /^\/api\/auth\/(session|signin\/?\w*|signout|csrf|providers|callback\/\w+|_log)$/

const router = Router()

/** Compatibility layer for `next-auth` for `express` apps.  */
export default function NextAuthMiddleware(options: NextAuthOptions) {
  return router
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(cookieParser())
    .all(authActions, (req: IncomingMessage, res: ServerResponse, next) => {
      if (req.method !== 'POST' && req.method !== 'GET') {
        return next()
      }
      //@ts-ignore
      req.query.nextauth = req.path.split('/').slice(3)
      //@ts-ignore
      NextAuth(req, res, options)
    })
}
