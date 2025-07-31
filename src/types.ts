import type { ElementType } from 'react'

export type Operation = 'listRule' | 'viewRule' | 'createRule' | 'updateRule' | 'deleteRule'

export interface OperationConfig {
	label: string
	icon: ElementType
	color: string
}

// New flexible logic system
export interface FlexibleCondition {
	id: string
	type: 'condition'
	operand1: string
	operator: string
	operand2: string
}

export interface LogicalOperator {
	id: string
	type: 'operator'
	value: 'and' | 'or'
}

export interface FlexibleGroup {
	id: string
	type: 'group'
	name: string
	elements: (FlexibleCondition | LogicalOperator)[]
}

export type RuleElement = FlexibleCondition | LogicalOperator | FlexibleGroup

export interface FlexibleRuleStructure {
	elements: RuleElement[]
}

// Legacy grouped types - keeping for backward compatibility
export interface Condition {
	id: string
	operand1: string
	operator: string
	operand2: string
	operand3?: string
}

export interface ConditionGroup {
	id: string
	name: string
	conditions: Condition[]
	internalLogic: 'and' | 'or' // Logic between conditions within this group
	logic: 'and' | 'or' // Logic operator to connect this group with the next group
}

export interface GroupedConditions {
	groups: ConditionGroup[]
}

export interface ScenarioConfig {
	authenticated: boolean
	ownerField: string
	lockFields?: string[]
	authMatchField?: string
	// New flexible rule structure
	flexibleCustomRules?: FlexibleRuleStructure
	flexibleAbacRules?: FlexibleRuleStructure
	// Legacy grouped conditions for backward compatibility
	groupedCustomConditions?: GroupedConditions
	groupedAbacConditions?: GroupedConditions
}

export interface Preset {
	id: string
	name: string
	rules: Partial<Record<string, Partial<Record<Operation, ScenarioConfig>>>>
	createdAt: string
}

// Database preset structure matching databases.json
export interface DatabasePreset {
	name: string
	rules: Partial<Record<string, Partial<Record<Operation, ScenarioConfig>>>> // operation as key
}

// Database structure
export interface Database {
	id: string
	name: string
	schemas: PbCollection[]
	presets: DatabasePreset[]
	createdAt: string
	updatedAt: string
}

// Schemas
export interface SchemaField {
	name: string
	type: string
	required: boolean
	options?: Record<string, unknown>
	description?: string
	[key: string]: unknown
}

export interface CollectionSchema {
	name: string
	fields: SchemaField[]
}

export type Schemas = Record<string, CollectionSchema>

export interface PbCollection {
	id: string
	name: string
	type: 'base' | 'auth' | 'view'
	system: boolean
	fields: SchemaField[]
	indexes: string[]
	options?: Record<string, unknown>
	listRule?: string | null
	viewRule?: string | null
	createRule?: string | null
	updateRule?: string | null
	deleteRule?: string | null
	[key: string]: unknown
}

export type PbSchema = PbCollection[]

// For loading from databases.json format
export interface DatabaseJson {
	name: string
	schemas: PbCollection[]
	presets: DatabasePreset[]
}
