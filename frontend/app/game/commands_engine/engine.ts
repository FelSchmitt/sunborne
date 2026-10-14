import { Scene, TextureLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Socket } from 'socket.io-client'
import * as functions from './functions'

type CommandPathObject = { keyword: string, paths?: CommandPathObject[], function?: functions.CommandPathFunction }



export const commandRouter: CommandPathObject = {
    keyword: '/',
    paths: [
    ]
}



export function executeCommand(keywords: string[], keywordIndex: number, pathObject: CommandPathObject, scene: Scene, loader: GLTFLoader, textureLoader: TextureLoader, socket: Socket) {
    if (pathObject.paths && keywords[keywordIndex + 1]) {
        for (const path of pathObject.paths) {
            if (pathObject.keyword === keywords[keywordIndex] || pathObject.keyword.startsWith('#')) {
                return executeCommand(keywords, keywordIndex + 1, path, scene, loader, textureLoader, socket)
            }
        }
    }

    if (pathObject.function && !keywords[keywordIndex + 1]) {
        return pathObject.function(keywords, scene, loader, textureLoader, socket)
    }
}