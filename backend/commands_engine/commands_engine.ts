import { Server, Socket } from 'socket.io'
import { SocketChat } from '../socket_channels'
import { RedisClientType } from 'redis'
import { Pool } from 'pg'
import { playerIdentifiers } from '../types'
import * as functions from './functions'

type CommandPathObject = { keyword: string, paths?: CommandPathObject[], function?: functions.CommandPathFunction }



export const commandRouter: CommandPathObject = {
    keyword: '/',
    paths: [
        {
            keyword: 'waitqueue',
            paths: [
                {
                    keyword: 'join',
                    paths: [
                        {
                            keyword: '#user_id',
                            paths: [
                                {
                                    keyword: '#nickname',
                                    function: functions.joinQueue
                                }
                            ]
                        }
                    ]
                },
                {
                    keyword: 'clear',
                    function: functions.clearQueue
                }
            ]
        },
        {
            keyword: 'matches',
            paths: [
                {
                    keyword: 'get',
                    function: functions.getMatch
                }
            ]
        }
    ]
}



export function executeCommand(keywords: string[], keywordIndex: number, pathObject: CommandPathObject, server: Server, client: Socket, redisConnection: RedisClientType, postgreConnection: Pool, waitingQueue: playerIdentifiers[], socketChat: SocketChat) {
    if (pathObject.keyword === keywords[keywordIndex] || pathObject.keyword.startsWith('#')) {
        if (pathObject.paths && keywords[keywordIndex + 1]) {
            for (const path of pathObject.paths) {
                if (pathObject.keyword === keywords[keywordIndex] || pathObject.keyword.startsWith('#')) {
                    return executeCommand(keywords, keywordIndex + 1, path, server, client, redisConnection, postgreConnection, waitingQueue, socketChat)
                }
            }
        }

        if (pathObject.function && !keywords[keywordIndex + 1]) {
            return pathObject.function(server, client, waitingQueue, redisConnection, postgreConnection, keywords)
        }
    }

    return socketChat.to_sender.invalid_action(client, 'Invalid syntax')
}