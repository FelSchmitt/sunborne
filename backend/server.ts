import express, { Request, Response } from 'express'
import http from 'http'
import cors from 'cors'
const crypto = require('crypto')
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'
import { createClient, RedisClientType } from 'redis'
import dotenv from 'dotenv'
import { Pool } from 'pg'
const argon2 = require('argon2')
const nodemailer = require('nodemailer')
import cron from 'node-cron'
dotenv.config()

import { verifyToken } from './middlewares'
import { playerIdentifiers } from './types'
import * as channels from './socket_channels'
import { serverMailMessage } from './email_message'

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
        const messages: { code: [number, number], message: string }[] = []

        const idQuery = await pool.query(`SELECT account_id FROM USERS WHERE account_id = $1`, [req.body.account_id])


        if (idQuery.rows.length > 0) messages.push({ code: [0, 0], message: 'account id already exists' })

        if (req.body.id.length < 6 || !req.body.id) messages.push({ code: [0, 1], message: 'account id too short' })

        if (req.body.id?.length > 20) messages.push({ code: [0, 2], message: 'account id too long' })

        if (req.body.password.length < 10 || !req.body.password) messages.push({ code: [1, 0], message: 'password too short' })

        if (req.body.password?.length > 45) messages.push({ code: [1, 1], message: 'password too long' })

        if (req.body.nickname.length < 5 || !req.body.nickname) messages.push({ code: [2, 1], message: 'nickname too short' })

        if (req.body.nickname?.length > 30) messages.push({ code: [2, 2], message: 'nickname too long' })

        if (messages.length > 0) {
            res.status(422).send({ messages: messages })
        }
        else {
            const verifyCode = String.fromCharCode(...Array.from({ length: 8 }, () => 47 + crypto.randomInt(1, 76)))
            const passwordHash = await argon2.hash(req.body.password)
            const codeHash = await argon2.hash(verifyCode)

            const unvalidatedUser = await pool.query(`INSERT INTO users (
                account_id,
                password_hash,
                nickname,
                register_date,
                status,
                activation_code) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    req.body.account_id,
                    passwordHash,
                    req.body.user_nickname,
                    new Date().toISOString().split('T')[0],
                    'inactive',
                    codeHash
                ]
            )

            const info = await emailTransporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: process.env.SMTP_TEST_EMAIL,
                subject: 'Sunborne Account Verification Code',
                text: serverMailMessage(verifyCode, false),
                html: serverMailMessage(verifyCode, true),
            })

            console.log(`e-mail sent: ${info.messageId}`)

            res.status(201).send({ message: 'unverified register created', id: req.body.id })
        }
    }
    catch (error) {
        res.status(500).send({ serverError: error })
        console.error(error)
    }
})



expressServer.post('/register/validate/activation', async (req: Request, res: Response) => {
    try {
        if (!req.body.code || !req.body.id) {
            res.status(403).send({ message: 'missing credentials' })
            return
        }

        const query = await pool.query(`SELECT * FROM USERS where account_id = $1`, [req.body.id])

        if (query.rows.length === 0) {
            res.status(404).send({ message: 'register not found or expired' })
            return
        }

        const codesMatch = await argon2.verify(query.rows[0].activation_code, req.body.code)

        if (!codesMatch) {
            res.status(403).send({ message: 'invalid code' })
            return
        }

        const activationQuery = await pool.query(
            `UPDATE USERS SET status = 'active', activation_code = NULL, expire_time = NULL WHERE account_id = $1`, [req.body.id]
        )

        res.status(201).send(
            {
                message: 'account succcessfully validated',
                account_id: query.rows[0].account_id,
                user_nickname: query.rows[0].nickname
            }
        )
    }
    catch (error) {
        res.status(500).send({ serverError: error })
        console.error(error)
    }
})



expressServer.post('/login/validate', async (req: Request, res: Response) => {
    try {
        if (!req.body.account_id || !req.body.password) {
            res.status(403).send({ message: 'missing credentials' })
            return
        }

        const messages: { code: number, message: string }[] = []
        const query = await pool.query(`SELECT * FROM users WHERE account_id = $1 AND status != 'inactive'`, [req.body.account_id])

        if (query.rows.length === 0) {
            messages.push({ code: 0, message: 'user not found' })
        }

        const passwordIsCorrect: boolean = await argon2.verify(query.rows[0].password_hash, req.body.password)

        if (!passwordIsCorrect) {
            messages.push({ code: 1, message: 'password incorrect' })
        }

        if (messages.length > 0) {
            res.status(422).send({ messages })
            return
        }

        const token = jwt.sign({ access_token: query.rows[0].access_token }, process.env.SECRET_KEY, { expiresIn: '10m' })

        const cardIds = query.rows[0].account_cards ?? []
        const deckIds = query.rows[0].account_decks ?? []

        const cardsQuery = cardIds.length
            ? await pool.query(`SELECT * FROM game_cards WHERE card_id = any($1)`, [cardIds])
            : { rows: [] }
        const decksQuery = deckIds.length
            ? await pool.query(`SELECT * FROM user_decks WHERE deck_id = any($1)`, [deckIds])
            : { rows: [] }

        res.send({
            account_id: query.rows[0].account_id,
            user_nickname: query.rows[0].nickname,
            cards: cardsQuery.rows,
            decks: decksQuery.rows,
            access: token,
        })
    }
    catch (error) {
        res.status(500).send({ serverError: error })
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

        cron.schedule('* * * * *', async () => {
            await pool.query(`DELETE FROM users WHERE expire_time < NOW()`)
        })
    }
    catch (error) {
        console.log(`an error occured: ${error.message}`)
    }

    server.listen(3001, () => console.log('backend server running on http://localhost:3001'))
}

initServer()