import { Request, Response, NextFunction } from 'express'
import { pool } from './server'
import { createCipheriv, createDecipheriv, scryptSync, randomBytes, randomInt } from 'node:crypto'

const cryptKey = scryptSync(process.env.SECRET_KEY, String.fromCharCode(...Array.from({ length: 20 }, () => 33 + randomInt(0, 93))), 32)



export function serverMailMessage(verificationCode: string, html: boolean) {
    if (html) {
        return `
        <h2>Greetings</h2>
        <br />
        <p>Use the code below to verify and complete your new account on Sunborne:</p>
        <br />
        <h3>${verificationCode}</h3>
        <br />
        <p>If you did not request this, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
        `
    }
    else {
        return `
        Greetings,\n\n
        Use the code below to verify and complete your new account on Sunborne:\n\n
        ${verificationCode}\n\n
        If you did not request this, you can safely ignore this email. Someone may have entered your email address by mistake.
        `
    }
}



export function generateToken(userId: string, lifetime: number) {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', cryptKey, iv)

    const data = JSON.stringify({ user_id: userId, expire_time: Date.now() + 60_000 * lifetime })

    let encryptedData = cipher.update(data, 'utf8', 'hex')
    encryptedData += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}.${authTag}.${encryptedData}`
}



export function validateToken(token: string) {
    try {
        const [ivHex, authTagHex, encryptedData] = token.split('.')

        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(authTagHex, 'hex')

        const decipher = createDecipheriv('aes-256-gcm', cryptKey, iv)
        decipher.setAuthTag(authTag)

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        const data = JSON.parse(decrypted)

        if (Date.now() > data.expire_time) { return false }
        else { return true }
    }
    catch {
        return false
    }
}