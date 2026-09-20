import express, { Request, Response } from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Server, Socket } from 'socket.io'
import { createClient, RedisClientType } from 'redis'
import dotenv from 'dotenv'
import { Pool } from 'pg'
const argon2 = require('argon2')
const nodemailer = require('nodemailer')
import cron from 'node-cron'
dotenv.config()

import { generateToken, validateToken } from './middlewares'
import { playerIdentifiers } from './types'
import * as channels from './socket_channels'
import { serverMailMessage } from './middlewares'

const corsConfig = { origin: 'http://localhost:3000', credentials: true }

export const pool = new Pool({
    user: process.env.USER,
    host: 'localhost',
    database: 'sunborne',
    password: process.env.DATABASE_PASSWORD,
    port: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
})

const expressServer = express()
const server = http.createServer(expressServer)
const socketServer = new Server(server, { cors: corsConfig })
const redisClient: RedisClientType = createClient()



expressServer.use(cors(corsConfig), cookieParser(), express.json(), express.static('./assets'))



expressServer.post('/register/validate/fields', async (req: Request, res: Response) => {
    try {
        const messages: { field: [number, number], message: string }[] = []

        const idQuery = await pool.query(`SELECT account_id FROM USERS WHERE account_id = $1`, [req.body.id])


        if (idQuery.rows.length > 0) messages.push({ field: [0, 0], message: 'account id already exists' })

        if (req.body.id.length < 6 || !req.body.id) messages.push({ field: [0, 1], message: 'account id too short' })

        if (req.body.id?.length > 20) messages.push({ field: [0, 2], message: 'account id too long' })

        if (req.body.password.length < 10 || !req.body.password) messages.push({ field: [1, 3], message: 'password too short' })

        if (req.body.password?.length > 45) messages.push({ field: [1, 4], message: 'password too long' })

        if (req.body.nickname.length < 5 || !req.body.nickname) messages.push({ field: [2, 5], message: 'nickname too short' })

        if (req.body.nickname?.length > 30) messages.push({ field: [2, 6], message: 'nickname too long' })

        if (messages.length > 0) {
            res.status(422).send({ messages: messages, ok: false })
        }
        else {
            const verifyCode = String.fromCharCode(...Array.from({ length: 8 }, () => 47 + Math.round(Math.random() * 75)))
            const passwordHash = await argon2.hash(req.body.password)
            const codeHash = await argon2.hash(verifyCode)

            await redisClient.json.SET(`user_validation:${req.body.id}`, '$', {
                code: codeHash,
                attempts: 0,
                id: req.body.id,
                password: passwordHash,
                nickname: req.body.nickname
            })
            await redisClient.EXPIRE(`user_validation:${req.body.id}`, 900)

            const info = await emailTransporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: process.env.SMTP_TEST_EMAIL,
                subject: 'Sunborne Account Verification Code',
                text: serverMailMessage(verifyCode, false),
                html: serverMailMessage(verifyCode, true),
            })

            console.log(`e-mail sent: ${info.messageId}`)

            res.cookie('validation_process_id', req.body.id, { httpOnly: true, secure: false, sameSite: 'lax' })
            res.status(201).send({ message: 'unverified register created', ok: true })
        }
    }
    catch (error) {
        res.status(500).send({ server_error: error })
        console.error(error)
    }
})



expressServer.post('/register/validate/activation', async (req: Request, res: Response) => {
    try {
        if (!req.body.code || !req.cookies.validation_process_id) {
            res.status(401).send({ message: 'missing credentials', ok: false })
            return
        }

        const account = await redisClient.json.GET(`user_validation:${req.body.id}`) as Record<string, any>
        const code = req.cookies.validation_process_id

        if (!account) {
            res.status(404).send({ field_message: 0, message: 'register not found, expired or is already validated', ok: false })
            return
        }

        const codesMatch = await argon2.verify(account.code, code)

        if (!codesMatch) {
            await redisClient.json.NUMINCRBY(`user_validation:${req.body.id}`, '$.attempts', 1)

            if (account.attempts >= 5) {
                await redisClient.DEL([`user_validation:${req.body.id}`])
                res.clearCookie('validation_process_id')
                res.status(410).send({ message: 'max attempts count reached', ok: false })
            }
            else { res.status(401).send({ field_message: 1, message: 'invalid code', ok: false }) }

            return
        }

        await pool.query(`INSERT INTO users (account_id, password_hash, nickname, register_date, status) 
            VALUES ($1, $2, $3, $4, $5)`,
            [
                account.id,
                account.password,
                account.nickname,
                new Date().toISOString().split('T')[0],
                'active'
            ]
        )

        await redisClient.DEL([`user_validation:${req.body.id}`])
        res.clearCookie('validation_process_id')

        const refreshToken = generateToken(account.id, 43_200)
        const accessToken = generateToken(account.id, 20)

        res.cookie('refresh_access', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 2_592_000_000 })
        res.cookie('access', accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1_200_000 })
        res.send(
            {
                message: 'account succcessfully validated',
                account_id: account.id,
                user_nickname: account.nickname,
                ok: true
            }
        )
    }
    catch (error) {
        res.status(500).send({ server_error: error })
        console.error(error)
    }
})



expressServer.post('/login/validate', async (req: Request, res: Response) => {
    try {
        if (!req.body.account_id || !req.body.password) {
            res.status(401).send({ message: 'missing credentials', ok: false })
            return
        }

        const query = await pool.query(`SELECT * FROM users WHERE account_id = $1`, [req.body.id])

        if (query.rows.length === 0) {
            res.status(404).send({ field: 0, message: 'user not found', ok: false })
            return
        }

        const passwordIsCorrect: boolean = await argon2.verify(query.rows[0].password_hash, req.body.password)

        if (!passwordIsCorrect) {
            res.status(401).send({ field: 1, message: 'password incorrect', ok: false })
            return
        }

        const refreshToken = generateToken(query.account_id, 43_200)
        const accessToken = generateToken(query.account_id, 20)

        const cardIds = query.rows[0].account_cards ?? []
        const deckIds = query.rows[0].account_decks ?? []

        const cardsQuery = cardIds.length ? await pool.query(`SELECT * FROM game_cards WHERE card_id = any($1)`, [cardIds]) : { rows: [] }
        const decksQuery = deckIds.length ? await pool.query(`SELECT * FROM user_decks WHERE deck_id = any($1)`, [deckIds]) : { rows: [] }

        res.cookie('refreshAccess', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 2_592_000_000 })
        res.cookie('access', accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1_200_000 })
        res.status(200).send({
            account_id: query.rows[0].account_id,
            user_nickname: query.rows[0].nickname,
            cards: cardsQuery.rows,
            decks: decksQuery.rows,
            ok: true
        })
    }
    catch (error) {
        res.status(500).send({ server_error: error })
        console.error(error)
    }
})



const waitingQueue: playerIdentifiers[] = []

socketServer.on('connection', (client: Socket) => {
    console.log(`client ${client.id} connected`)

    client.on('disconnect', () => {
        console.log(`client ${client.id} disconnected`)
    })

    client.on('chat', (message) => { channels.broadcastUserMessage(message, socketServer) })
    client.on('find_opponent', (ids) => { channels.joinWaitingQueue({ id: ids.id, socket_id: client.id, nickname: ids.nickname }, waitingQueue, redisClient, socketServer) })
    client.on('move_request', (request) => { channels.moveRequest(request, socketServer, client, redisClient) })
    client.on('clear_waiting_queue', () => { channels.clearWaitingQueue(waitingQueue, socketServer) })
    client.on('get_match', () => { channels.getMatch(client, redisClient) })
})



async function initServer(): Promise<void> {
    redisClient.on('error', (error: Error) => console.log(`Redis error: ${error}`))
    await redisClient.connect()

    try {
        await redisClient.ft.create(
            'index:matches',
            { "$.['player1', 'player2'].socket_id": { type: 'TAG', AS: 'sockets_ids' } },
            { ON: 'JSON', PREFIX: 'match:' }
        )
    }
    catch (error) {
        console.log(`an error occured: ${error.message}`)
    }

    server.listen(3001, () => console.log('backend server running on http://localhost:3001'))
}

initServer()