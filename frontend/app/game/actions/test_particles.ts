import { ParticleConfig } from '@/app/types'
import { AdditiveBlending } from 'three'



export const fire: ParticleConfig = {
    emitter: {
        position: [0, 14, 0],
        dimensions: [4, 4, 4],
        max_lifetime: 500,
        radius: 2,
        rate: 2,
        shape: 'sphere',
        surface_only: false
    },

    particles: {
        color: '#ff6000',
        opacity: 0.8,
        initial_speed: [0, 0, 0],
        max_lifetime: 40,
        blend: AdditiveBlending,
        size: 0.6
    },

    forces: [
        {
            position: [0, 14, 0],
            dimensions: [5, 5, 5],
            shape: 'sphere',
            point_direction: [1.57, 1.57],
            point_position: [0, 0, 0],
            radius: 3,
            relative: false,
            strength: 0.01,
            type: 'parallel'
        }
    ]
}