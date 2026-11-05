import { ParticleConfig, EmitterForce } from '@/app/types'
import { Scene, BufferGeometry, BufferAttribute, PointsMaterial, Points, AdditiveBlending } from 'three'



export class ParticleEmitter {
    expired: boolean
    position: [number, number, number]
    dimensions: [number, number, number]
    radius: number
    shape: 'sphere' | 'box'
    surface_only: boolean
    max_lifetime: number
    current_lifetime: number
    rate: number
    object_uuid: string

    particles: {
        positions: BufferGeometry
        velocities: Float32Array
        lifetimes: Float32Array
        max_lifetimes: Float32Array
        size: number
        initial_velocity: [number, number, number]
    }

    forces: EmitterForce[]



    constructor(config: ParticleConfig, scene: Scene) {
        this.expired = false
        this.position = config.emitter.position
        this.dimensions = config.emitter.dimensions
        this.radius = config.emitter.radius
        this.shape = config.emitter.shape
        this.surface_only = config.emitter.surface_only
        this.max_lifetime = config.emitter.max_lifetime
        this.current_lifetime = 0
        this.rate = config.emitter.rate

        const particleCount = config.emitter.max_lifetime * config.emitter.rate

        this.particles = {
            positions: new BufferGeometry(),
            velocities: new Float32Array(particleCount * 3),
            lifetimes: new Float32Array(particleCount),
            max_lifetimes: new Float32Array(particleCount),
            size: config.particles.size,
            initial_velocity: config.particles.initial_speed
        }

        this.forces = config.forces

        this.particles.positions.setAttribute('position', new BufferAttribute(new Float32Array(particleCount * 3), 3))

        const particleCoords = this.particles.positions.getAttribute('position').array

        for (let index = 0; index < particleCoords.length; index += 3) {
            particleCoords[index] = this.position[0]
            particleCoords[index + 1] = this.position[1]
            particleCoords[index + 2] = this.position[2]
            this.particles.max_lifetimes[index / 3] = config.particles.max_lifetime
        }

        const material = new PointsMaterial({
            color: config.particles.color,
            size: config.particles.size,
            transparent: true,
            opacity: config.particles.opacity,
            blending: config.particles.blend,
            depthWrite: false
        })

        const object = new Points(this.particles.positions, material)

        this.object_uuid = object.uuid

        scene.add(object)
    }



    updateLifetime() {
        if (this.current_lifetime <= this.max_lifetime) {
            this.current_lifetime++

            if (this.current_lifetime > this.max_lifetime) {
                this.expired = true
                this.particles.positions.dispose()
            }
        }
    }



    private isUnderForce(force: EmitterForce, x: number, y: number, z: number): boolean {
        if (force.shape === 'box') {
            const overlapX = Math.abs(x - force.position[0]) < this.particles.size + force.dimensions[0]
            const overlapY = Math.abs(y - force.position[1]) < this.particles.size + force.dimensions[1]
            const overlapZ = Math.abs(z - force.position[2]) < this.particles.size + force.dimensions[2]

            if (overlapX && overlapY && overlapZ) return true
            else return false
        }
        else {
            const insideRadius = Math.hypot(force.position[0] - x, force.position[1] - y, force.position[2] - z) < force.radius

            if (insideRadius) return true
            else return false
        }
    }



    updateParticles() {
        const particleCoords = this.particles.positions.getAttribute('position').array
        const lifetimes = this.particles.lifetimes
        const maxLifetimes = this.particles.max_lifetimes
        const velocities = this.particles.velocities

        for (let index = 0; index < particleCoords.length; index += 3) {
            for (const force of this.forces) {

                if (this.isUnderForce(force, particleCoords[index], particleCoords[index + 1], particleCoords[index + 2]) && lifetimes[index / 3] < maxLifetimes[index / 3]) {
                    if (force.type === 'parallel') {
                        velocities[index] += Math.cos(force.point_direction[0]) * force.strength
                        velocities[index + 1] += Math.sin(force.point_direction[0]) * force.strength
                        velocities[index + 2] += Math.cos(force.point_direction[1]) * force.strength
                    }

                    else if (force.type === 'point') {
                        const posX = force.relative ? this.position[0] + force.position[0] : force.position[0]
                        const posY = force.relative ? this.position[1] + force.position[1] : force.position[1]
                        const posZ = force.relative ? this.position[2] + force.position[2] : force.position[2]

                        velocities[index] += Math.cos(Math.atan2(posY - particleCoords[index + 1], posX - particleCoords[index])) * force.strength
                        velocities[index + 1] += Math.sin(Math.atan2(posY - particleCoords[index + 1], posX - particleCoords[index])) * force.strength
                        velocities[index + 2] += Math.cos(Math.atan2(posY - particleCoords[index + 1], posZ - particleCoords[index + 2])) * force.strength
                    }

                    else if (force.type === 'resistive') {
                        velocities[index] *= force.strength
                        velocities[index + 1] *= force.strength
                        velocities[index + 2] *= force.strength
                    }
                }
            }

            particleCoords[index] += velocities[index]
            particleCoords[index + 1] += velocities[index + 1]
            particleCoords[index + 2] += velocities[index + 2]
            if (lifetimes[index / 3] <= maxLifetimes[index / 3]) { lifetimes[index / 3]++ }

            if (lifetimes[index / 3] > maxLifetimes[index / 3]) {
                particleCoords[index] = this.position[0]
                particleCoords[index + 1] = this.position[1]
                particleCoords[index + 2] = this.position[2]
                velocities[index] = 0
                velocities[index + 1] = 0
                velocities[index + 2] = 0
            }
        }



        let spawnCount = 0

        for (let index = 0; index < particleCoords.length; index += 3) {
            if (lifetimes[index / 3] > maxLifetimes[index / 3]) {
                if (this.shape === 'box') {
                    if (this.surface_only) {
                        const surfaceX = Math.round(Math.random()) / 2
                        const surfaceY = Math.round(Math.random()) / 2
                        const surfaceZ = Math.round(Math.random()) / 2

                        particleCoords[index] = this.position[0] + (this.dimensions[0] - (Math.random() * this.dimensions[0] * 2 * Math.ceil(surfaceY + surfaceZ)))
                        particleCoords[index + 1] = this.position[1] + (this.dimensions[1] - (Math.random() * this.dimensions[1] * 2 * Math.ceil(surfaceX + surfaceZ)))
                        particleCoords[index + 2] = this.position[2] + this.dimensions[2] - (Math.random() * this.dimensions[2] * 2 * Math.ceil(surfaceX + surfaceY))
                    }

                    else {
                        particleCoords[index] = this.position[0] + (this.dimensions[0] - (Math.random() * this.dimensions[0] * 2))
                        particleCoords[index + 1] = this.position[1] + (this.dimensions[1] - (Math.random() * this.dimensions[1] * 2))
                        particleCoords[index + 2] = this.position[2] + (this.dimensions[2] - (Math.random() * this.dimensions[2] * 2))
                    }
                }

                else {
                    const randomAngleXY = Math.random() * Math.PI * 2
                    const randomAngleZY = Math.random() * Math.PI * 2

                    if (this.surface_only) {
                        particleCoords[index] = this.position[0] + Math.cos(randomAngleXY) * this.radius
                        particleCoords[index + 1] = this.position[1] + Math.sin(randomAngleXY) * this.radius
                        particleCoords[index + 2] = this.position[2] + Math.cos(randomAngleZY) * this.radius
                    }
                    else {
                        const randomDistance = Math.random() * this.radius

                        particleCoords[index] = this.position[0] + Math.cos(randomAngleXY) * randomDistance
                        particleCoords[index + 1] = this.position[1] + Math.sin(randomAngleXY) * randomDistance
                        particleCoords[index + 2] = this.position[2] + Math.cos(randomAngleZY) * randomDistance
                    }
                }

                lifetimes[index / 3] = 0
                spawnCount++
            }

            if (spawnCount >= this.rate) break
        }

        this.particles.positions.getAttribute('position').needsUpdate = true
    }
}