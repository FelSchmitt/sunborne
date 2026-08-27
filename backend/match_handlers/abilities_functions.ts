import { MatchObject, MatchPlayer, Instruction, ObjectKeyReference, ObjectPath } from '../types'
import { GeneratedEvent } from './events_queue'

type instructionHandler = (
    match: MatchObject,
    player: MatchPlayer,
    opponent: MatchPlayer,
    event: GeneratedEvent,
    queue: GeneratedEvent[],
    savedValues: any[],
    instruction: Instruction,
    objectindex?: number,
    path?: ObjectPath,
) => any



const objectsList: instructionHandler[] = [
    (match, player, opponent, event, queue, savedValues, instruction) => { return match },
    (match, player, opponent, event, queue, savedValues, instruction) => { return player },
    (match, player, opponent, event, queue, savedValues, instruction) => { return opponent },
    (match, player, opponent, event, queue, savedValues, instruction) => { return event },
    (match, player, opponent, event, queue, savedValues, instruction) => { return queue },
    (match, player, opponent, event, queue, savedValues, instruction) => { return savedValues },
    (match, player, opponent, event, queue, savedValues, instruction) => { return instruction.values },
]

const testsList: ((value1: any, value2: any, value3: any) => boolean)[] = [
    (value1, value2, value3) => { return value1 ? true : false },
    (value1, value2, value3) => { return !value1 },
    (value1, value2, value3) => { return value1 < value2 },
    (value1, value2, value3) => { return value1 > value2 },
    (value1, value2, value3) => { return value1 && value2 },
    (value1, value2, value3) => { return value1 || value2 },
    (value1, value2, value3) => { return value1 === value2 },
    (value1, value2, value3) => { return value1 !== value2 },
    (value1, value2, value3) => { return value1.length < value2 },
    (value1, value2, value3) => { return value1.length > value2 },
    (value1, value2, value3) => { return value1.length === value2 },
    (value1, value2, value3) => { return value1.length !== value2 },
    (value1, value2, value3) => { return value1.length > value2.length },
    (value1, value2, value3) => { return value1.length < value2.length },
    (value1, value2, value3) => { return value1.length === value2.length },
    (value1, value2, value3) => { return value1.length !== value2.length },
    (value1, value2, value3) => { return value1.includes(value2) },
    (value1, value2, value3) => { return value1.some(element => element[value2]) },
    (value1, value2, value3) => { return value1.some(element => !element[value2]) },
    (value1, value2, value3) => { return value1.some(element => element[value2] < element[value3]) },
    (value1, value2, value3) => { return value1.some(element => element[value2] > element[value3]) },
    (value1, value2, value3) => { return value1.some(element => element[value2] === element[value3]) },
    (value1, value2, value3) => { return value1.some(element => element[value2] !== element[value3]) },
    (value1, value2, value3) => { return value1.some(element => element[value2] < value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2] > value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2] === value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2] !== value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length < value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length > value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length === value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length !== value3) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length < element[value3].length) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length > element[value3].length) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length === element[value3].length) },
    (value1, value2, value3) => { return value1.some(element => element[value2].length !== element[value3].length) },
    (value1, value2, value3) => { return value1.every(element => element[value2]) },
    (value1, value2, value3) => { return value1.every(element => !element[value2]) },
    (value1, value2, value3) => { return value1.every(element => element[value2] < element[value3]) },
    (value1, value2, value3) => { return value1.every(element => element[value2] > element[value3]) },
    (value1, value2, value3) => { return value1.every(element => element[value2] === element[value3]) },
    (value1, value2, value3) => { return value1.every(element => element[value2] !== element[value3]) },
    (value1, value2, value3) => { return value1.every(element => element[value2] < value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2] > value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2] === value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2] !== value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length < value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length > value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length === value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length !== value3) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length < element[value3].length) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length > element[value3].length) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length === element[value3].length) },
    (value1, value2, value3) => { return value1.every(element => element[value2].length !== element[value3].length) },
]



const getReference: instructionHandler = (match, player, opponent, event, queue, savedValues, instruction, objectIndex, path) => {
    if (path.length === 1) {
        return objectsList[objectIndex](match, player, opponent, event, queue, savedValues, instruction)[path[0]]
    }

    else if (path.length === 2) {
        return objectsList[objectIndex](match, player, opponent, event, queue, savedValues, instruction)[path[0]][path[1]]
    }

    else if (path.length === 3) {
        return objectsList[objectIndex](match, player, opponent, event, queue, savedValues, instruction)[path[0]][path[1]][path[2]]
    }

    else if (path.length === 4) {
        return objectsList[objectIndex](match, player, opponent, event, queue, savedValues, instruction)[path[0]][path[1]][path[2]][path[3]]
    }
}



export const testConditions: instructionHandler = (match, player, opponent, event, queue, savedValues, instruction) => {
    const results: [boolean, '&' | '|'][] = []

    for (const condition of instruction.conditions) {
        const value1 = condition.value1 ?? getReference(match, player, opponent, event, queue, savedValues, instruction, condition.variableIndex1, condition.reference1)
        const value2 = condition.value2 ?? getReference(match, player, opponent, event, queue, savedValues, instruction, condition.variableIndex2, condition.reference2)
        const value3 = condition.value3 ?? getReference(match, player, opponent, event, queue, savedValues, instruction, condition.variableIndex3, condition.reference3)

        results.push([testsList[condition.operatorIndex](value1, value2, value3), condition.next])
    }

    let pass: boolean = true

    if (results.length === 1 && results[0][0] === false) { pass = false }

    for (let index = 0; index < results.length; index++) {
        if (results[index][1] === '&' && results[index + 1]) {
            if (!(results[index][0] && results[index + 1][0])) { pass = false }
        }
        else if (results[index][1] === '|' && results[index + 1]) {
            if (!(results[index][0] || results[index + 1][0])) { pass = false }
        }
    }

    return pass
}



const elementPaths = [
    (element, path) => { return element[path[0]] },
    (element, path) => { return element[path[0]][path[1]] },
    (element, path) => { return element[path[0]][path[1]][path[2]] },
    (element, path) => { return element[path[0]][path[1]][path[2]][path[3]] },
]



export const abilitiesFunctions: instructionHandler[] = [
    (match, player, opponent, event, queue, savedValues, instruction) => {//add elements in an array
        if (instruction.useValuesFrom === 'instruction') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property).push(
                ...instruction.values.slice(instruction.useValuesRange[0], instruction.useValuesRange[1])
            )
        }
        else if (instruction.useValuesFrom === 'savedValues') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property).push(
                ...savedValues.slice(instruction.useValuesRange[0], instruction.useValuesRange[1])
            )
        }
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//iterates over an array to remove elements from it
        getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property).forEach((element, index, referencedArray) => {
            let pass: boolean = true
            const results: [boolean, '&' | '|'][] = []

            for (const filter of instruction.iterationFilters) {
                const value1 = filter.value1 ?? elementPaths[filter.elementPathsIndex](element, filter.reference1)
                const value2 = filter.value2 ?? elementPaths[filter.elementPathsIndex](element, filter.reference2)
                const value3 = filter.value3 ?? elementPaths[filter.elementPathsIndex](element, filter.reference3)

                results.push([testsList[filter.operatorIndex](value1, value2, value3), filter.next])
            }

            if (results.length === 1 && results[0][0] === false) { pass = false }

            results.forEach((result, index) => {
                if (result[1] === '&' && results[index + 1]) {
                    if (!(result[0] && results[index + 1][0])) { pass = false }
                }
                else if (result[1] === '|' && results[index + 1]) {
                    if (!(result[0] || results[index + 1][0])) { pass = false }
                }
            })

            if (!pass) return

            referencedArray.splice(index, 1)
        })
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//iterates over an array to copy and remove elements from it
        getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property).forEach((element, index, referencedArray) => {
            let pass: boolean = true
            const results: [boolean, '&' | '|'][] = []

            for (const filter of instruction.iterationFilters) {
                const value1 = filter.value1 ?? elementPaths[filter.elementPathsIndex](element, filter.reference1)
                const value2 = filter.value2 ?? elementPaths[filter.elementPathsIndex](element, filter.reference2)
                const value3 = filter.value3 ?? elementPaths[filter.elementPathsIndex](element, filter.reference3)

                results.push([testsList[filter.operatorIndex](value1, value2, value3), filter.next])
            }

            if (results.length === 1 && results[0][0] === false) { pass = false }

            results.forEach((result, index) => {
                if (result[1] === '&' && results[index + 1]) {
                    if (!(result[0] && results[index + 1][0])) { pass = false }
                }
                else if (result[1] === '|' && results[index + 1]) {
                    if (!(result[0] || results[index + 1][0])) { pass = false }
                }
            })

            if (!pass) return

            savedValues.push(...referencedArray.splice(index, 1))
        })
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//iterates over an array to copy elements from it
        getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property).forEach((element, index, referencedArray) => {
            let pass: boolean = true
            const results: [boolean, '&' | '|'][] = []

            for (const filter of instruction.iterationFilters) {
                const value1 = filter.value1 ?? elementPaths[filter.elementPathsIndex](element, filter.reference1)
                const value2 = filter.value2 ?? elementPaths[filter.elementPathsIndex](element, filter.reference2)
                const value3 = filter.value3 ?? elementPaths[filter.elementPathsIndex](element, filter.reference3)

                results.push([testsList[filter.operatorIndex](value1, value2, value3), filter.next])
            }

            if (results.length === 1 && results[0][0] === false) { pass = false }

            results.forEach((result, index) => {
                if (result[1] === '&' && results[index + 1]) {
                    if (!(result[0] && results[index + 1][0])) { pass = false }
                }
                else if (result[1] === '|' && results[index + 1]) {
                    if (!(result[0] || results[index + 1][0])) { pass = false }
                }
            })

            if (!pass) return

            savedValues.push(...referencedArray.slice(index, index + 1))
        })
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//iterates over an array to change elements in it
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//increases a number property
        if (instruction.useValuesFrom === 'instruction') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) + instruction.values[instruction.useValuesRange[0]]
        }
        else if (instruction.useValuesFrom === 'savedValues') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) + savedValues[instruction.useValuesRange[0]]
        }
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//decreases a number property
        if (instruction.useValuesFrom === 'instruction') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) - instruction.values[instruction.useValuesRange[0]]
        }
        else if (instruction.useValuesFrom === 'savedValues') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) - savedValues[instruction.useValuesRange[0]]
        }
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//multiply a number property
        if (instruction.useValuesFrom === 'instruction') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) * instruction.values[instruction.useValuesRange[0]]
        }
        else if (instruction.useValuesFrom === 'savedValues') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) * savedValues[instruction.useValuesRange[0]]
        }
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//divide a number property
        if (instruction.useValuesFrom === 'instruction') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) / instruction.values[instruction.useValuesRange[0]]
        }
        else if (instruction.useValuesFrom === 'savedValues') {
            getReference(match, player, opponent, event, queue, savedValues, instruction, instruction.variableIndex, instruction.property) / savedValues[instruction.useValuesRange[0]]
        }
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//sets a property
    },



    (match, player, opponent, event, queue, savedValues, instruction) => {//copies a property
    },
]