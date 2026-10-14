import { Scene, TextureLoader } from 'three'
import { Socket, io } from 'socket.io-client'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { GeneratedEvent, MatchObject } from '../types'



export const socketConnection = io('http://localhost:3001')



export function sendChatMessage() {
    const input = document.getElementById('message-input') as HTMLInputElement

    socketConnection.emit('chat', { sender: localStorage.getItem('id') ?? 'unlogged_user', text: input.value })

    input.value = ''
}



export function receiveChatMessage(message: { sender: string, color: string, text: string }) {
    const chat = document.getElementById('test-chat') as HTMLDivElement
    const chatContainer = document.getElementById('chat-container') as HTMLDivElement
    chat.innerHTML += `<p class="mb-2"><span style="color: ${message.color}; font-weight: 700">${message.sender}:</span>${message.text}</p>`
    chatContainer.classList.remove('closed')
}



export function logDataInConsole(data: any) { console.log(data) }



export function setScene(match: MatchObject, scene: Scene, loader: GLTFLoader, textureLoader: TextureLoader) {
}



export function moveResponse(resultQueue: GeneratedEvent[], scene: Scene, loader: GLTFLoader, textureLoader: TextureLoader) {
}