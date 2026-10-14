import { Server, Socket } from 'socket.io'
import { RedisClientType } from 'redis'
import { MatchObject, MoveRequest, playerIdentifiers, GameCard } from './types'
import { testCards } from './test_cards'
import { validateAction } from './match_engine/game_modes_rules'
import { createMatchEventsQueue } from './match_engine/events_queue'
import { executeCommand, commandRouter } from './commands_engine/commands_engine'
import { redisClient, pool, waitingQueue } from './server'

type SocketChatToEveryone = Record<string, (server: Server, message: string, senderId: string) => void>

type SocketChatToSender = Record<string, (client: Socket, message: string) => void>

export type SocketChat = {
    to_everyone: SocketChatToEveryone
    to_sender: SocketChatToSender
}



export const socketChat: SocketChat = {
    to_everyone: {
        user_message: (server, message, senderId) => {
            server.emit('chat', { sender: senderId, color: '#40b0ff', text: message })
        },

        server_error: (server, message, senderId) => {
            server.emit('chat', { sender: 'Server', color: '#ff5500', text: `Server error: ${message}` })
        },

        notification: (server, message, senderId) => {
            server.emit('chat', { sender: 'Server', color: '#ffee00', text: message })
        },
    },

    to_sender: {
        invalid_action: (client, message) => {
            client.emit('chat', { sender: 'Server', color: '#ffaa00', text: message })
        },

        notification: (client, message) => {
            client.emit('chat', { sender: 'Server', color: '#ffee00', text: message })
        },

        command_success: (client, message) => {
            client.emit('chat', { sender: 'Server', color: '#40e040', text: message })
        },

        command_error: (client, message) => {
            client.emit('chat', { sender: 'Server', color: '#ff7000', text: message })
        },
    }
}






async function generateCardUuid(redisConnection: RedisClientType): Promise<string> {
    return `${await redisConnection.DBSIZE()}_${Date.now() + Math.round(Math.random() * 1_000_000)}_${Math.round(Math.random() * 100)}`
}



function createMatch(playersIds: playerIdentifiers[], handCards: GameCard[][], matchId: string): MatchObject {
    const mode = playersIds[0].mode ?? 'classic'
    const startMana = mode === 'destiny' ? 2 : 1

    const players = playersIds.map((player, index) => ({
        id: player.id,
        socket_id: player.socket_id,
        nickname: player.nickname,
        hand_cards: handCards[index],
        table_cards: [],
        deck: [],
        mana_level: startMana,
        mana_capacity: startMana,
        ...(mode === 'destiny' ? { favorable_rolls_streak: 0 } : {}),
        ...(mode === 'ritual' ? { soul_vessel_life: 20, ritual_energy: 3 } : {}),
        ...(mode === 'eclipse' ? { life_pool: 30 } : {}),
    }))

    const base: MatchObject = {
        match_id: matchId,
        mode,
        player1: players[0],
        player2: players[1],
        current_turn_player: (['player1', 'player2'][Math.round(Math.random())]) as 'player1' | 'player2',
        start_time: new Date().toISOString(),
        total_turns_count: 0,
        graveyard: []
    }

    if (mode === 'eclipse') {
        base.eclipse_timer = 12
        base.eclipse_active = false
        base.eclipse_current_max_count = 0
    }

    if (mode === 'chaos') {
        base.chaos_deck = []
        base.chaos_deck_exhausted_count = 0
        base.chaos_draws_per_turn = 1
        base.current_chaos_effects = []
    }

    if (mode === 'destiny') {
        base.action_die = null
        base.fate_die = null
        base.mercy_roll_used = false
        base.reversal_coin = false
        base.reversal_coin_counter = 0
    }

    return base
}



export async function getMatchFromSocketId(socketId: string, redisConnection: RedisClientType): Promise<MatchObject | null> {
    const result: any = await redisConnection.ft.search('index:matches', `@sockets_ids:{${socketId}}`)
    if (result.total === 0) return null
    return result.documents[0].value as MatchObject
}



export function broadcastUserMessage(message: { sender: string, text: string }, socketServer: Server, client: Socket) {
    if (message.text.startsWith('/')) {
        executeCommand(message.text.split(' '), 0, commandRouter, socketServer, client, redisClient, pool, waitingQueue, socketChat)
    }

    else {
        console.log(`Message from frontend: ${message.text}`)
        socketChat.to_everyone.user_message(socketServer, message.text, message.sender)
    }
}



export async function joinWaitingQueue(identifiers: playerIdentifiers, waitingQueue: playerIdentifiers[], redisConnection: RedisClientType, socketServer: Server) {
    waitingQueue.push(identifiers)

    if (waitingQueue.length >= 2) {
        const playersIds = [waitingQueue.shift(), waitingQueue.shift()]
        const matchId = `match:${Date.now()}_${Math.round(Math.random() * 100)}`

        const uuids = await Promise.all(Array.from({ length: testCards.length * 2 }, () => generateCardUuid(redisConnection)))

        const handsCards = playersIds.map((player, index) =>
            testCards.map((card, cardIndex) => (
                {
                    uuid: uuids[index * testCards.length + cardIndex],
                    card_id: card.card_id,
                    mana_cost: card.mana_cost,
                    base_life: card.base_life,
                    life: card.base_life,
                    attack_damage: card.attack_damage,
                    life_modifiers: [],
                    attack_modifiers: [],
                    mana_cost_modifiers: [],

                    classes: card.classes.map(cardClass => (
                        cardClass.functionIndex ?
                            { name: cardClass.name, functionIndex: cardClass.functionIndex, trigger: cardClass.trigger } :
                            { name: cardClass.name }
                    )),

                    abilities: card.abilities.map(ability => (
                        { instructions: ability.instructions, trigger: ability.trigger, replace_default_event: ability.replace_default_event }
                    )),

                    custom_properties: [],
                    can_attack: false,
                    rarity: card.rarity,
                }
            ))
        )

        const match = createMatch(playersIds, handsCards, matchId)

        await redisConnection.json.set(matchId, '$', match)

        socketServer.to([playersIds[0].socket_id, playersIds[1].socket_id]).socketsJoin(matchId)
    }
}



export async function moveRequest(request: MoveRequest, socketServer: Server, client: Socket, redisConnection: RedisClientType) {
    try {
        const match = await getMatchFromSocketId(client.id, redisConnection)

        if (!match) {
            return socketChat.to_sender.invalid_action(client, 'You are not in a match')
        }

        const requestIsFromPlayer1 = match.player1.socket_id === client.id

        const player = requestIsFromPlayer1 ? match.player1 : match.player2
        const opponent = requestIsFromPlayer1 ? match.player2 : match.player1

        const result = validateAction(match, player, opponent, request)
        if (!result.ok) {
            return socketChat.to_sender.invalid_action(client, result.message)
        }

        const moveResults = createMatchEventsQueue(match, player, opponent, request)

        for (const result of moveResults) {
            if (result.source) result.source_uuid = result.source.uuid

            if (result.target) result.target_uuid = result.target.uuid

            delete result.function
            delete result.source
            delete result.target
        }

        socketServer.to([match.player1.socket_id, match.player2.socket_id]).emit('move_response', moveResults)

        await redisConnection.json.set(match.match_id, '$', JSON.stringify(match))

        if (match.winner_id) {
            socketServer.to(match.match_id).emit('match_over', { winner_id: match.winner_id })
        }
    }
    catch (error) {
        socketChat.to_everyone.server_error(socketServer, error, '')
        console.error(error)
    }
}