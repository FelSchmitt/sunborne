import { Server, Socket } from 'socket.io'
import { RedisClientType } from 'redis'
import { Pool } from 'pg'
import { playerIdentifiers, MatchObject, GameCard } from '../types'
import { socketChat, joinWaitingQueue, getMatchFromSocketId } from '../socket_channels'

export type CommandPathFunction = (server: Server, client: Socket, waitingQueue: playerIdentifiers[], redisConnection: RedisClientType, postgreConnection: Pool, keywords: string[]) => any






export const clearQueue: CommandPathFunction = (server, client, waitingQueue, redisConnection, postgreConnection, keywords) => {
    waitingQueue.splice(0)
    socketChat.to_everyone.notification(server, 'Opponents waiting queue cleared', '')
}



export const joinQueue: CommandPathFunction = (server, client, waitingQueue, redisConnection, postgreConnection, keywords) => {
    joinWaitingQueue({ id: keywords[3], socket_id: client.id, nickname: keywords[4] }, waitingQueue, redisConnection, server)
    socketChat.to_sender.command_success(client, 'Player added to waiting queue')
}



export const getMatch: CommandPathFunction = async (server, client, waitingQueue, redisConnection, postgreConnection, keywords) => {
    const match = await getMatchFromSocketId(client.id, redisConnection)

    if (match) { client.emit('console_data', match) }
    else { socketChat.to_sender.command_error(client, 'Match not found or you are not in one') }
}