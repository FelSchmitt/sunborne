import { GeneratedEvent } from "./match_handlers/events_queue"

export type playerIdentifiers = {
    id: string
    socket_id: string
    nickname: string
    mode?: GameMode
}



export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'titanic' | 'colossal'



export type RitualSpellName = 'bloodbind' | 'ashen_strike' | 'soul_harvest' | 'purge' | 'rebirth' |
    'dark_convergence' | 'summon_from_deep' | 'annihilation' | 'necromancy_curse'



export type StatusModifier = { value: number, source: string | GameCard }

export type ObjectKeyReference = keyof MatchObject | keyof MatchPlayer | keyof GameCard | keyof GeneratedEvent | number

export type ObjectPath = ObjectKeyReference[]

export type Instruction = {
    functionIndex: number
    variableIndex: number
    property: ObjectPath
    conditions: {
        operatorIndex: number
        value1: any
        value2: any
        value3: any
        variableIndex1: number
        variableIndex2: number
        variableIndex3: number
        reference1: ObjectPath
        reference2: ObjectPath
        reference3: ObjectPath
        next: '&' | '|'
    }[]
    iterationFilters: {//always refers to the current element or one of its properties when iterating over an array
        operatorIndex: number
        elementPathsIndex: number
        value1: any
        value2: any
        value3: any
        reference1: ObjectPath
        reference2: ObjectPath
        reference3: ObjectPath
        next: '&' | '|'
    }[]
    values: any[]
    useValuesFrom: 'instruction' | 'savedValues'
    useValuesRange: [number, number]
}

export type AbilityDescriptors = {
    instructions: Instruction[],
    trigger: EventResult,
    replace_default_event: boolean
}

export type GameCard = {
    card_id: string
    uuid: string
    mana_cost: number
    mana_cost_modifiers: StatusModifier[]
    life: number
    life_modifiers: StatusModifier[]
    swapped_life_enemy_uuid?: string // used by the 'void rift' chaos effect
    base_life: number
    attack_damage: number
    attack_modifiers: StatusModifier[]
    can_attack: boolean
    classes: { name: string, function_index?: number, trigger?: EventResult }[]
    abilities: AbilityDescriptors[]
    custom_properties: { persist: boolean, source?: GameCard, properties: any[] }[] // used by the special abilities of itself and other cards
    rarity: CardRarity
    is_hero?: boolean
    is_master?: boolean
    is_defense?: boolean
    owner_id?: string
}



export type MatchPlayer = {
    id: string
    socket_id: string
    nickname: string
    hand_cards: GameCard[]
    table_cards: GameCard[]
    deck: GameCard[]
    soul_vessel_life?: number
    ritual_energy?: number
    life_pool?: number
    favorable_rolls_streak?: number
    mana_level: number
    mana_capacity: number
}



export type GameMode = 'classic' | 'destiny' | 'chaos' | 'ritual' | 'dungeon_run' | 'eclipse'



export type ChaosEffectName = 'earthquake' | 'mass_confusion' | 'blood_moon' | 'surge' | 'silence' | 'arcane_wind' | 'the_cull' | 'void_rift'



export type MatchObject = {
    match_id: string
    mode: GameMode
    player1: MatchPlayer
    player2: MatchPlayer
    current_turn_player: 'player1' | 'player2'
    start_time: string
    total_turns_count: number
    graveyard: GameCard[]
    winner_id?: string
    both_players_lost?: boolean

    action_die?: number
    fate_die?: number
    mercy_roll_used?: boolean
    reversal_coin?: boolean
    reversal_coin_counter?: number
    one_card_constraint_used?: boolean
    chain_attack_damage_used?: boolean
    double_damage_bonus_used?: boolean

    eclipse_timer?: number
    eclipse_active?: boolean
    eclipse_current_max_count?: number

    chaos_deck?: ChaosEffectName[]
    current_chaos_effects?: ChaosEffectName[]
    chaos_deck_exhausted_count?: number
    chaos_draws_per_turn?: number
}



export type MoveAction = 'throw_onto_table' | 'attack_minion' | 'attack_life_pool' |
    'end_turn' | 'sacrifice_card' | 'cast_ritual_spell' | 'choose_hero_minion'



export type MoveRequest = {
    card_uuid?: string
    target_uuid?: string
    mode: GameMode
    action: MoveAction
}



export type EventResult = 'turn_changed' | 'summoned' | 'died' | 'ressurected' | 'attacked' | 'damaged' | 'card_drawn' |
    'won_match' | 'ability_triggered' | 'chose_hero' | 'chose_card' | 'dice_and_coin_reset' | 'chaos_effects_applied' |
    'chaos_effects_reset' | 'card_sacrificed' | 'spell_cast' | 'attacked_life_pool' | 'eclipse_timer_countdown' |
    'eclipse_began' | 'eclipse_ended' | 'minion_enabled_attack' | 'any'