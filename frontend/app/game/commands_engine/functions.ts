import { Scene, TextureLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Socket } from 'socket.io-client'

export type CommandPathFunction = (keywords: string[], scene: Scene, loader: GLTFLoader, textureLoader: TextureLoader, socket: Socket) => void