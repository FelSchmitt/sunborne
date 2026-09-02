import { CardRarity, EventResult, AbilityDescriptors } from "./types"

type TestCardObject = {
    card_id: string
    mana_cost: number
    base_life: number
    attack_damage: number
    classes: { name: string, functionIndex?: number, trigger?: EventResult }[]
    abilities: AbilityDescriptors[]
    rarity: CardRarity
    description?: string
}



export const testCards: TestCardObject[] = [
    {
        card_id: 'ironwood_ent',
        mana_cost: 1,
        base_life: 5,
        attack_damage: 2,
        classes: [{ name: 'verdant' }],
        abilities: [],
        rarity: 'uncommon',
        description: 'a basic minion for defense'
    },
    {
        card_id: 'emberveil_assassin',
        mana_cost: 4,
        base_life: 5,
        attack_damage: 2,
        classes: [{ name: 'shadow' }, { name: 'infernal' }],
        abilities: [],
        rarity: 'epic',
        description: 'destroyed minions by this one are permanently removed from the match, not sent to the graveyard'
    },
    {
        card_id: 'shadow_demon',
        mana_cost: 3,
        base_life: 4,
        attack_damage: 3,
        classes: [{ name: 'spectral' }, { name: 'underworld' }, { name: 'evil' }],
        abilities: [],
        rarity: 'rare',
        description: 'when summoned, all enemy minions lose 1 attack point this turn'
    },
    {
        card_id: 'primal_rhino',
        mana_cost: 1,
        base_life: 3,
        attack_damage: 3,
        classes: [{ name: 'beast' }, { name: 'primitive' }],
        abilities: [],
        rarity: 'common'
    },
    {
        card_id: 'tidecaller',
        mana_cost: 7,
        base_life: 10,
        attack_damage: 5,
        classes: [{ name: 'titan', trigger: 'damaged', functionIndex: -1 }, { name: 'elemental' }, { name: 'aquatic' }],
        abilities: [],
        rarity: 'titanic',
        description: 'when summoned, deals 2 damage to all enemies. while on table, opponent cards cost 2 more mana to summon'
    },
    {
        card_id: 'moldlord',
        mana_cost: 6,
        base_life: 8,
        attack_damage: 5,
        classes: [{ name: 'colossus', trigger: 'turn_changed', functionIndex: -1 }, { name: 'verdant' }],
        abilities: [],
        rarity: 'colossal',
        description: 'if receives nearly lethal damage, the attacker lose 3 attack and 1 health every turn for 6 turns. this ability activates only once.'
    },
    {
        card_id: 'eclipse_eye',
        mana_cost: 5,
        base_life: 3,
        attack_damage: 2,
        classes: [],
        abilities: [],
        rarity: 'legendary',
        description: 'if in eclipse mode and the eclipse phase activates while its on table, allows its owner to see all the cards the opponent has in hand'
    },
    {
        card_id: 'great_storm_ravager',
        mana_cost: 7,
        base_life: 7,
        attack_damage: 6,
        classes: [{ name: 'titan', trigger: 'damaged', functionIndex: -1 }, { name: 'elemental' }],
        abilities: [],
        rarity: 'titanic',
    },
    {
        card_id: 'infernal_taurus',
        mana_cost: 3,
        base_life: 5,
        attack_damage: 3,
        classes: [{ name: 'infernal' }, { name: 'beast' }],
        abilities: [],
        rarity: 'rare',
        description: 'every time its attacked, gets increasingly more enraged until enters the fury mode for 3 turns: 3x more attack and health'
    },
    {
        card_id: 'war_carnage_god',
        mana_cost: 4,
        base_life: 12,
        attack_damage: 6,
        classes: [{ name: 'colossus', trigger: 'turn_changed', functionIndex: -1 }],
        abilities: [],
        rarity: 'colossal',
    },
    {
        card_id: 'balthazar_the_wizard',
        mana_cost: 5,
        base_life: 2,
        attack_damage: 2,
        classes: [{ name: 'human' }, { name: 'wizard' }],
        abilities: [],
        rarity: 'epic',
    },
]