'use client'

import { useEffect } from 'react'
import * as three from 'three'
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js'
import * as channels from './socket_channels'
import * as sceneUtils from './scene_utils'
import { keyboardCommandsHandler } from './keyboard_commands'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { GeneratedEvent } from '../types'
import { executeCommand, commandRouter } from './commands_engine/engine'
import { ParticleEmitter } from './actions/particles'
import { AnimationPlayer } from './actions/animations'

import { ObjectVectorsMenu } from './menu_tools/ObjectVectorsMenu'



export default function GameScreen() {
    useEffect(() => {
        const gameScreen = document.getElementById('gamescreen') as HTMLCanvasElement
        const renderer = new three.WebGLRenderer({ canvas: gameScreen })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)

        const scene = new three.Scene()
        const camera = new three.PerspectiveCamera(75, gameScreen.width / gameScreen.height, 1, 300)
        const cameraControl = new OrbitControls(camera, renderer.domElement)
        const composer = new EffectComposer(renderer)
        const renderPass = new RenderPass(scene, camera)
        const outline = new OutlinePass(new three.Vector2(window.innerWidth, window.innerHeight), scene, camera)
        const loader = new GLTFLoader()
        const textureLoader = new three.TextureLoader()
        const audioLoader = new three.AudioLoader()
        const raycaster = new three.Raycaster()
        const timer = new three.Timer()
        const listener = new three.AudioListener()

        const light = new three.DirectionalLight('#ffffff', 8)
        const ambientLight = new three.AmbientLight('#ffe84c', 3)
        const activeEmitters: ParticleEmitter[] = []
        const activeAnimations: AnimationPlayer[] = []

        light.position.x = 1
        light.position.y = 1
        light.position.z = 1
        outline.edgeStrength = 5.0
        outline.edgeGlow = 0.6
        outline.edgeThickness = 3.0
        outline.visibleEdgeColor.set('#2fc4ff')
        outline.hiddenEdgeColor.set('#15556e')
        composer.addPass(renderPass)
        composer.addPass(outline)
        camera.add(listener)

        const mousePosition: three.Vector2 = new three.Vector2()
        let selectedObject: three.Object3D | null = null
        const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('.vectorinput')
        scene.userData.loop = true

        sceneUtils.addSceneObject(loader, scene, 'table', activeAnimations, 'table')
        sceneUtils.addSceneObject(loader, scene, 'carpet', activeAnimations, 'carpet')

        camera.position.setX(-12)
        camera.position.setY(28)
        scene.add(light)
        scene.add(ambientLight)
        composer.render()



        function renderLoop() {
            if (scene.userData.loop) {
                cameraControl.update()

                for (const emitter of activeEmitters) {
                    emitter.updateLifetime()

                    if (emitter.expired) { activeEmitters.splice(activeEmitters.indexOf(emitter), 1) }
                    else { emitter.updateParticles() }
                }

                for (const anim of activeAnimations) { anim.update() }

                composer.render()

                requestAnimationFrame(renderLoop)
            }
        }



        function detectVectorInputChange(this: HTMLInputElement) {
            selectedObject && sceneUtils.updateObjectVectorValue(selectedObject, this)
        }

        // window.addEventListener('keydown', keyboardCommandsHandler)
        document.getElementById('get-object-vectors')?.addEventListener('click', () => { selectedObject && sceneUtils.getObjectVectorsValues(selectedObject, inputs) })
        for (const input of inputs) { input.addEventListener('change', detectVectorInputChange) }

        document.getElementById('chat-button')?.addEventListener('click', () => {
            const input = document.getElementById('message-input') as HTMLInputElement
            const text = input.value

            if (text.startsWith('/')) {
                const keywords = text.replace('/', '').split(' ')

                if (text.startsWith('/server')) {
                    channels.socketConnection.emit('chat', { sender: localStorage.getItem('id') ?? 'unlogged_user', text: text.replace('/server', '/ ') })
                }
                else {
                    executeCommand(keywords, 0, commandRouter, scene, loader, textureLoader, channels.socketConnection, renderLoop)
                }
            }
            else {
                channels.socketConnection.emit('chat', { sender: localStorage.getItem('id') ?? 'unlogged_user', text: text })
            }

            input.value = ''
        })



        channels.socketConnection.on('chat', channels.receiveChatMessage)
        channels.socketConnection.on('move_response', (resultQueue: GeneratedEvent[]) => { channels.moveResponse(resultQueue, scene, loader, textureLoader) })
        channels.socketConnection.on('console_data', channels.logDataInConsole)

        renderLoop()
    }, [])



    return (
        <>
            <canvas id='gamescreen'></canvas>

            <div id='chat-container' className='closed absolute w-[20vw] h-[50vh] border-4 border-zinc-500 flex flex-col justify-evenly items-center'>
                <div id='test-chat' className='w-[90%] h-[80%] bg-[#888] flex flex-col overflow-y-scroll'></div>

                <input type='text' id='message-input' className='bg-white border-[3px] border-[#4784ff] w-[90%]' />
                <button id='chat-button' className='bg-[#9d47ff60] border-[3px] border-[#9d47ff] rounded-[5px] w-[90%] p-0.75 text-white font-bold'>SEND</button>
            </div>

            {/* <ObjectVectorsMenu /> */}
        </>
    )
}