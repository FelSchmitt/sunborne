import { Scene, Light, Object3D, Raycaster, BoxGeometry, Mesh, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'

type PositionRotationScale = [number, number, number, number, number, number, number, number, number] // [position x, y, z; rotation x, y, z; scale x, y, z]

const vectorProperties: ('position' | 'rotation' | 'scale')[] = [
    'position',
    'rotation',
    'scale'
]

const dimensions: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']



export function resetScene(scene: Scene, loader: GLTFLoader, light: Light) {
    scene.children.splice(0)

    loader.load(
        'models/game_table.glb',
        function (gltf) {
            gltf.scene.name = 'table'
            scene.add(gltf.scene)
            console.log('table model loaded')
        },
        function (progress) {
            console.log(`${progress.loaded} of ${progress.total} loaded`)
        },
        function (error) {
            console.error(error)
            alert(`table model failed: ${error}`)
        }
    )

    loader.load(
        'models/carpet.glb',
        function (gltf) {
            gltf.scene.name = 'carpet'
            scene.add(gltf.scene)
            console.log('carpet model loaded')
        },
        function (progress) { },
        function (error) {
            console.error(error)
            alert(`carpet model failed: ${error}`)
        }
    )

    scene.add(light)
}



export function updateObjectVectorValue(object: any, input: HTMLInputElement) {
    object[input.dataset.vector as string][input.dataset.value as string] = input.valueAsNumber
}



export function getObjectVectorsValues(object: Object3D, inputs: NodeListOf<HTMLInputElement>) {
    for (const input of inputs) {
        if (input.dataset.vector === 'position') {
            if (input.dataset.value === 'x') {
                input.value = String(object.position.x)
            }
            else if (input.dataset.value === 'y') {
                input.value = String(object.position.y)
            }
            else if (input.dataset.value === 'z') {
                input.value = String(object.position.z)
            }
        }
        else if (input.dataset.vector === 'rotation') {
            if (input.dataset.value === 'x') {
                input.value = String(object.rotation.x)
            }
            else if (input.dataset.value === 'y') {
                input.value = String(object.rotation.y)
            }
            else if (input.dataset.value === 'z') {
                input.value = String(object.rotation.z)
            }
        }
    }
}



export function addSceneObject(loader: GLTFLoader, scene: Scene, filename: string, transform: PositionRotationScale, clickBox?: PositionRotationScale, hoverBox?: PositionRotationScale, objectName?: string) {
    loader.load(
        `models/${filename}.glb`,

        (gltf) => {
            gltf.scene.name = objectName ?? 'object'

            if (clickBox) {
                const geometry = new BoxGeometry(clickBox[6], clickBox[7], clickBox[8])
                const box = new Mesh(geometry)

                for (let index = 1; index < 7; ++index) {
                    const propertyIndex = Math.ceil(index / 3) - 1

                    box[vectorProperties[propertyIndex]][dimensions[(index - 1) - 3 * propertyIndex]] = clickBox[index - 1]
                }

                box.layers.enable(1)
                box.layers.disable(0)

                for (let index = 1; index < 10; ++index) {
                    const propertyIndex = Math.ceil(index / 3) - 1

                    gltf.scene[vectorProperties[propertyIndex]][dimensions[(index - 1) - 3 * propertyIndex]] = transform[index - 1]
                }

                gltf.scene.add(box)
            }

            if (hoverBox) {
                const geometry = new BoxGeometry(hoverBox[6], hoverBox[7], hoverBox[8])
                const box = new Mesh(geometry)

                for (let index = 1; index < 7; ++index) {
                    const propertyIndex = Math.ceil(index / 3) - 1

                    box[vectorProperties[propertyIndex]][dimensions[(index - 1) - 3 * propertyIndex]] = hoverBox[index - 1]
                }

                box.layers.enable(2)
                box.layers.disable(0)

                for (let index = 1; index < 10; ++index) {
                    const propertyIndex = Math.ceil(index / 3) - 1

                    gltf.scene[vectorProperties[propertyIndex]][dimensions[(index - 1) - 3 * propertyIndex]] = transform[index - 1]
                }

                gltf.scene.add(box)
            }

            scene.add(gltf.scene)
        },

        (progress) => { },

        (error) => {
            console.error(error)
            alert(`${filename} model failed: ${error}`)
        }
    )
}