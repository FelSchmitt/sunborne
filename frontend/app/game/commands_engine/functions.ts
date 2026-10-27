import { Scene, TextureLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Socket } from 'socket.io-client'
import { receiveChatMessage } from '../socket_channels'
import { addSceneObject } from '../scene_utils'

export type CommandPathFunction = (keywords: string[], scene: Scene, loader: GLTFLoader, textureLoader: TextureLoader, socket: Socket, renderLoop: Function) => void



export const toggleRenderLoop: CommandPathFunction = (keywords, scene, loader, textureLoader, socket, renderLoop) => {
    scene.userData.loop ? scene.userData.loop = false : scene.userData.loop = true; renderLoop()

    receiveChatMessage({ sender: 'Server', color: '#40e040', text: `Toggled render loop (now ${scene.userData.loop ? 'running' : 'paused'})` })
}



export const clearChat: CommandPathFunction = (keywords, scene, loader, textureLoader, socket, renderLoop) => {
    const chat = document.getElementById('test-chat') as HTMLDivElement

    chat.innerHTML = ''
}



export const loadObject: CommandPathFunction = (keywords, scene, loader, textureLoader, socket, renderLoop) => {
    loader.load(
        `models/${keywords[4]}.glb`,
        (gltf) => {
            scene.add(gltf.scene)
            receiveChatMessage({ sender: 'Server', color: '#40e040', text: 'object loaded successfully' })
        },
        (progress) => { },
        (error) => {
            receiveChatMessage({ sender: 'Server', color: '#ff7000', text: 'failed to load object' })
        }
    )
}



export const listAllObjectsInConsole: CommandPathFunction = (keywords, scene, loader, textureLoader, socket, renderLoop) => {
    console.log(scene.children)
}