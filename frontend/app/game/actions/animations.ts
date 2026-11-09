import { AnimationClip, Object3D, Vector3, Quaternion } from 'three'



type AnimationTransform = {
    target: Object3D
    times: Float32Array
    values: Float32Array
    position?: Vector3
    quaternion?: Quaternion
    scale?: Vector3
    reset_position: Vector3
    reset_quaternion: Quaternion
    reset_scale: Vector3
}



export class AnimationPlayer {
    animation_name: string
    running: boolean
    duration: number
    current_frame: number
    transformations: AnimationTransform[]
    mode: 'forward' | 'backward' | 'alternate'
    timeline_direction: -1 | 1
    max_loops: number
    current_loop: number



    private getTarget(object: Object3D, names: string[], index: number): Object3D | undefined {
        for (const obj of object.children) {
            if (obj.name === names[index] && !names[index + 1]) { return obj }

            else if (obj.name === names[index] && names[index + 1]) {
                return this.getTarget(obj, names, index + 1)
            }
            else break
        }
    }



    constructor(clip: AnimationClip, object: Object3D, minTransformTimes: number = 1, mode: 'forward' | 'backward' | 'alternate' = 'forward', maxLoops: number = 1) {
        this.animation_name = clip.name
        this.running = false
        this.transformations = []
        this.mode = mode
        this.max_loops = maxLoops
        this.current_loop = 0
        this.duration = clip.duration


        for (const track of clip.tracks) {
            const names = track.name.split('.')
            const property = names.pop() as 'position' | 'quaternion' | 'scale'
            const target = this.getTarget(object, names, 0)

            if (target && track.times.length >= minTransformTimes) {
                const transform: AnimationTransform = {
                    target,
                    times: track.times,
                    values: track.values,
                    reset_position: target.position.clone(),
                    reset_quaternion: target.quaternion.clone(),
                    reset_scale: target.scale.clone()
                }

                if (property === 'quaternion') transform.quaternion = target['quaternion']
                else transform[property] = target[property]

                this.transformations.push(transform)

                if (track.times.length > this.duration) this.duration = track.times.length
            }
        }

        if (mode === 'forward' || mode === 'alternate') {
            this.current_frame = 0
            this.timeline_direction = 1
        }
        else {
            this.current_frame = this.duration
            this.timeline_direction = -1
        }
    }



    update() {
        if (this.running && this.current_loop < this.max_loops) {
            if (this.current_frame > this.duration && this.mode === 'forward') {
                this.current_frame = 0
                this.timeline_direction = 1
                this.current_loop++
            }
            else if (this.current_frame < 0 && this.mode === 'backward') {
                this.current_frame = this.duration
                this.timeline_direction = -1
                this.current_loop++
            }
            else if (this.current_frame > this.duration && this.mode === 'alternate') {
                this.current_frame = this.duration
                this.timeline_direction = -1
            }
            else if (this.current_frame < 0 && this.mode === 'alternate') {
                this.current_frame = 0
                this.timeline_direction = 1
                this.current_loop++
            }

            this.current_frame += this.timeline_direction

            for (const transform of this.transformations) {
                if (transform.values[this.current_frame * 3] && transform.position) {
                    transform.position.x = transform.values[this.current_frame * 3] + transform.reset_position.x
                    transform.position.y = transform.values[this.current_frame * 3 + 1] + transform.reset_position.y
                    transform.position.z = transform.values[this.current_frame * 3 + 2] + transform.reset_position.z
                }
                if (transform.values[this.current_frame * 4] && transform.quaternion) {
                    transform.quaternion.x = transform.values[this.current_frame * 4] + transform.reset_quaternion.x
                    transform.quaternion.y = transform.values[this.current_frame * 4 + 1] + transform.reset_quaternion.y
                    transform.quaternion.z = transform.values[this.current_frame * 4 + 2] + transform.reset_quaternion.z
                    transform.quaternion.w = transform.values[this.current_frame * 4 + 3]
                }
                if (transform.values[this.current_frame * 3] && transform.scale) {
                    transform.scale.x = transform.values[this.current_frame * 3] + transform.reset_scale.x
                    transform.scale.y = transform.values[this.current_frame * 3 + 1] + transform.reset_scale.y
                    transform.scale.z = transform.values[this.current_frame * 3 + 2] + transform.reset_scale.z
                }
            }
        }
    }



    play() {
        this.running = true
    }

    pause() {
        this.running = false
    }

    reset() {
        this.current_loop = 0

        switch (this.mode) {
            case 'forward':
                this.current_frame = 0
                this.timeline_direction = 1
            case 'backward':
                this.current_frame = this.duration
                this.timeline_direction = -1
            case 'alternate':
                this.current_frame = this.duration
                this.timeline_direction = -1
        }

        for (const transform of this.transformations) {
            if (transform.values[this.current_frame * 3] && transform.position) {
                transform.position.x = transform.reset_position.x
                transform.position.y = transform.reset_position.y
                transform.position.z = transform.reset_position.z
            }
            if (transform.values[this.current_frame * 4] && transform.quaternion) {
                transform.quaternion.x = transform.reset_quaternion.x
                transform.quaternion.y = transform.reset_quaternion.y
                transform.quaternion.z = transform.reset_quaternion.z
                transform.quaternion.w = transform.reset_quaternion.w
            }
            if (transform.values[this.current_frame * 3] && transform.scale) {
                transform.scale.x = transform.reset_scale.x
                transform.scale.y = transform.reset_scale.y
                transform.scale.z = transform.reset_scale.z
            }
        }
    }
}