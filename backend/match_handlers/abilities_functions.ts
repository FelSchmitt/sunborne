import { MatchObject, MatchPlayer, Instruction, ObjectKeyReference } from '../types'
import { GeneratedEvent } from './events_queue'

type instructionHandler = (
    match: MatchObject,
    activePlayer: MatchPlayer,
    opponent: MatchPlayer,
    event: GeneratedEvent,
    queue: GeneratedEvent[],
    instruction: Instruction,
    referenceValues: [number, ...ObjectKeyReference[]]
) => any



const objectsList: instructionHandler[] = [
    (match, player, opponent, event, queue, instruction, referenceValues) => { return match },
    (match, player, opponent, event, queue, instruction, referenceValues) => { return player },
    (match, player, opponent, event, queue, instruction, referenceValues) => { return opponent },
    (match, player, opponent, event, queue, instruction, referenceValues) => { return event },
    (match, player, opponent, event, queue, instruction, referenceValues) => { return queue },
    (match, player, opponent, event, queue, instruction, referenceValues) => { return instruction.values },
]



const getPropertiesReference: instructionHandler = (match, player, opponent, event, queue, instruction, referenceValues) => {
    let reference = objectsList[referenceValues[0]](match, player, opponent, event, queue, instruction, referenceValues)

    if (referenceValues.length === 2) {
        reference = reference[referenceValues[1]]
    }

    else if (referenceValues.length === 3) {
        reference = reference[referenceValues[1]][referenceValues[2]]
    }

    else if (referenceValues.length === 4) {
        reference = reference[referenceValues[1]][referenceValues[2]][referenceValues[3]]
    }

    return reference
}



const testConditions: instructionHandler = (match, player, opponent, event, queue, instruction, referenceValues) => {
    const reference = getPropertiesReference(match, player, opponent, event, queue, instruction, instruction.property)

    const results: [boolean, '&' | '|'][] = []

    instruction.conditions.forEach((condition, index) => {
        let value1 = condition.value1 ?? getPropertiesReference(match, player, opponent, event, queue, instruction, condition.reference1)
        let value2 = condition.value2 ?? getPropertiesReference(match, player, opponent, event, queue, instruction, condition.reference2)

        if (condition.operator === '<') {
            results.push([value1 < value2, condition.next])
        }
        else if (condition.operator === '>') {
            results.push([value1 > value2, condition.next])
        }
        else if (condition.operator === '&') {
            results.push([value1 && value2, condition.next])
        }
        else if (condition.operator === '|') {
            results.push([value1 || value2, condition.next])
        }
        else if (condition.operator === '=') {
            results.push([value1 === value2, condition.next])
        }
        else if (condition.operator === '!') {
            results.push([value1 != value2, condition.next])
        }
        else if (condition.operator === 'includes') {
            results.push([value1.includes(value2), condition.next])
        }
        else if (condition.operator === 'some') {
            results.push([value1.some(value2), condition.next])
        }
    })
}



export const abilitiesFunctions: instructionHandler[] = [
    (match, activePlayer, opponent, event, queue, instruction) => {//add elements in an array
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//iterates over an array to remove elements from it
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//iterates over an array to copy elements from it
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//iterates over an array to change elements in it
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//add to a number property
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//subtract from a number property
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//multiply a number property
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//divide a number property
    },



    (match, activePlayer, opponent, event, queue, instruction) => {//sets a property
    },
]