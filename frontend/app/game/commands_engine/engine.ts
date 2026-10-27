import { Scene, TextureLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Socket } from 'socket.io-client'
import * as functions from './functions'
import { receiveChatMessage } from '../socket_channels'

type CommandPathObject = { keyword: string, paths?: CommandPathObject[], function?: functions.CommandPathFunction }



export const commandRouter: CommandPathObject = {
    keyword: '/',
    paths: [
        {
            keyword: 'renderloop',
            paths: [
                {
                    keyword: 'toggle',
                    function: functions.toggleRenderLoop
                }
            ]
        },
        {
            keyword: 'clearchat',
            function: functions.clearChat
        },
        {
            keyword: 'scene',
            paths: [
                {
                    keyword: 'load',
                    paths: [
                        {
                            keyword: 'object',
                            paths: [
                                {
                                    keyword: '#filename',
                                    function: functions.loadObject
                                }
                            ]
                        }
                    ]
                },
                {
                    keyword: 'list',
                    paths: [
                        {
                            keyword: 'all',
                            function: functions.listAllObjectsInConsole
                        }
                    ]
                }
            ]
        }
    ]
}



export function executeCommand(keywords: string[], keywordIndex: number, pathObject: CommandPathObject, scene: Scene, loader: GLTFLoader, textureLoader: TextureLoader, socket: Socket, renderLoop: Function) {
    if (pathObject.paths && keywords[keywordIndex + 1]) {
        for (const path of pathObject.paths) {
            if (pathObject.keyword === keywords[keywordIndex] || pathObject.keyword.startsWith('#')) {
                return executeCommand(keywords, keywordIndex + 1, path, scene, loader, textureLoader, socket, renderLoop)
            }
        }
    }

    if (pathObject.function && !(keywords[keywordIndex + 1])) {
        return pathObject.function(keywords, scene, loader, textureLoader, socket, renderLoop)
    }

    receiveChatMessage({ sender: 'Server', color: '#ff7000', text: 'Invalid Syntax' })
}