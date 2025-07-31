import { addCondition, addGroup, removeCondition, removeGroup, updateCondition, updateGroup } from '@/lib/conditions'
import { convertPbSchemaToAppSchema, validateAndParseJson } from '@/lib/utils'
import { Code2, Database, Plus, Shield, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { createSelector } from 'reselect'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
	Condition,
	ConditionGroup,
	DatabaseJson,
	DatabasePreset,
	Database as DatabaseType,
	GroupedConditions,
	Operation,
	OperationConfig,
	Schemas,
} from '../types'

export type RuleBuilderState = {
	// Database management
	databases: DatabaseType[]
	currentDatabaseId: string | null

	// Current rule building
	operation: Operation
	authenticated: boolean
	ownerField: string
	lockFields: string[]
	authMatchField: string

	// New grouped conditions
	groupedCustomConditions: GroupedConditions
	groupedAbacConditions: GroupedConditions

	// Preset management
	currentPresetId: string | null

	// UI State
	copied: boolean
	ruleContent: string
	schemaJson: string
	currentCollection: string
	operationConfig: Record<Operation, OperationConfig>
}

export type RuleBuilderActions = {
	// Database management
	setDatabases: (databases: DatabaseType[]) => void
	setCurrentDatabase: (databaseId: string) => void
	addDatabase: (name: string, schemas: string) => void
	deleteDatabase: (databaseId: string) => void
	updateDatabase: (databaseId: string, updates: Partial<DatabaseType>) => void
	loadDatabases: () => Promise<void>

	// Rule configuration
	setOperation: (operation: Operation) => void
	setAuthenticated: (authenticated: boolean) => void
	setOwnerField: (ownerField: string) => void
	setLockFields: (lockFields: string[]) => void
	setAuthMatchField: (authMatchField: string) => void

	// Grouped conditions management
	setGroupedCustomConditions: (groupedConditions: GroupedConditions) => void
	addCustomGroup: (name?: string) => void
	removeCustomGroup: (groupId: string) => void
	updateCustomGroup: (groupId: string, updates: Partial<ConditionGroup>) => void
	addCustomConditionToGroup: (groupId: string) => void
	removeCustomConditionFromGroup: (groupId: string, conditionId: string) => void
	updateCustomConditionInGroup: (groupId: string, conditionId: string, updates: Partial<Condition>) => void

	setGroupedAbacConditions: (groupedConditions: GroupedConditions) => void
	addAbacGroup: (name?: string) => void
	removeAbacGroup: (groupId: string) => void
	updateAbacGroup: (groupId: string, updates: Partial<ConditionGroup>) => void
	addAbacConditionToGroup: (groupId: string) => void
	removeAbacConditionFromGroup: (groupId: string, conditionId: string) => void
	updateAbacConditionInGroup: (groupId: string, conditionId: string, updates: Partial<Condition>) => void

	// Preset management
	getCurrentPresets: () => DatabasePreset[]
	getPresetsForOperation: (operation: Operation, collection: string) => DatabasePreset[]
	setCurrentPreset: (presetId: string | null) => void
	loadPreset: (preset: DatabasePreset) => void
	saveCurrentPreset: (newPresetName: string) => void
	updateExistingPreset: (presetIndex: number) => void
	deletePreset: (presetId: string) => void

	// UI State
	setCopied: (copied: boolean) => void
	setRuleContent: (ruleContent: string) => void
	setSchemaJson: (schemaJson: string) => void
	setCurrentCollection: (currentCollection: string) => void
	resetRuleConfiguration: () => void

	// Computed getters
	getCurrentDatabase: () => DatabaseType | null
	getCurrentSchemas: () => Schemas
}

const selectDatabases = (state: RuleBuilderState) => state.databases
const selectCurrentDatabaseId = (state: RuleBuilderState) => state.currentDatabaseId

const selectCurrentDatabase = createSelector(
	[selectDatabases, selectCurrentDatabaseId],
	(databases, currentDatabaseId) => {
		return databases.find((db) => db.id === currentDatabaseId) || null
	}
)

const selectCurrentSchemas = createSelector([selectCurrentDatabase], (currentDb) => {
	if (!currentDb) return {}
	return convertPbSchemaToAppSchema(currentDb.schemas)
})

export const useRuleBuilderStore = create<RuleBuilderState & RuleBuilderActions>()(
	persist(
		(set, get) => ({
			// State
			databases: [],
			currentDatabaseId: null,

			operation: 'listRule',
			authenticated: false,
			ownerField: '',
			lockFields: [],
			authMatchField: '',

			// New grouped conditions
			groupedCustomConditions: { groups: [] },
			groupedAbacConditions: { groups: [] },

			currentPresetId: null,
			copied: false,

			ruleContent: '',
			schemaJson: '',
			currentCollection: '',
			operationConfig: {
				listRule: { label: 'List Records', icon: Database, color: 'from-blue-500 to-cyan-500' },
				viewRule: { label: 'View Record', icon: Shield, color: 'from-green-500 to-emerald-500' },
				createRule: { label: 'Create Record', icon: Plus, color: 'from-purple-500 to-violet-500' },
				updateRule: { label: 'Update Record', icon: Code2, color: 'from-orange-500 to-red-500' },
				deleteRule: { label: 'Delete Record', icon: Trash2, color: 'from-red-500 to-pink-500' },
			},

			// Database management actions
			setDatabases: (databases) => set({ databases }),
			setCurrentDatabase: (databaseId) => {
				set({ currentDatabaseId: databaseId, currentPresetId: null })
				get().resetRuleConfiguration()
			},
			addDatabase: (name, schemas) => {
				const validation = validateAndParseJson(schemas, 'pocketbase-schema')

				if (!validation.success) {
					const errorMessage = validation.details
						? `${validation.error}: ${validation.details}`
						: validation.error || 'Invalid JSON format'

					alert(`Error creating database: ${errorMessage}`)
					return
				}

				try {
					const newDatabase: DatabaseType = {
						id: crypto.randomUUID(),
						name,
						schemas: validation.data as DatabaseType['schemas'],
						presets: [],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}
					set((state) => ({
						databases: [...state.databases, newDatabase],
						currentDatabaseId: newDatabase.id,
					}))
				} catch (e) {
					console.error('Error creating database', e)
					alert('Error creating database. Please try again.')
				}
			},
			deleteDatabase: (databaseId) => {
				set((state) => {
					const newDatabases = state.databases.filter((db) => db.id !== databaseId)
					const newCurrentId =
						state.currentDatabaseId === databaseId
							? newDatabases.length > 0
								? newDatabases[0].id
								: null
							: state.currentDatabaseId
					return {
						databases: newDatabases,
						currentDatabaseId: newCurrentId,
					}
				})
			},
			updateDatabase: (databaseId, updates) => {
				set((state) => ({
					databases: state.databases.map((db) =>
						db.id === databaseId ? { ...db, ...updates, updatedAt: new Date().toISOString() } : db
					),
				}))
			},
			loadDatabases: async () => {
				// Do not load from file if we already have databases (from localStorage)
				if (get().databases && get().databases.length > 0) {
					const { databases, currentDatabaseId } = get()
					const dbExists = databases.some((db) => db.id === currentDatabaseId)
					if (!dbExists) {
						set({ currentDatabaseId: databases.length > 0 ? databases[0].id : null })
					}
					return
				}

				try {
					const response = await fetch('/databases.json')
					if (!response.ok) throw new Error('Failed to load databases.json')
					const data: DatabaseJson[] = await response.json()

					const databases: DatabaseType[] = data.map((dbJson, index) => ({
						id: `default-${index}`,
						name: dbJson.name,
						schemas: dbJson.schemas,
						presets: dbJson.presets.map((preset) => {
							// Validate preset structure
							if (!preset.name || !preset.rules || typeof preset.rules !== 'object') {
								console.warn(`Invalid preset structure found in database "${dbJson.name}":`, preset)
								return { name: preset.name || 'Invalid Preset', rules: {} }
							}
							return preset
						}),
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}))

					set({
						databases,
						currentDatabaseId: databases.length > 0 ? databases[0].id : null,
					})
				} catch (e) {
					console.error('Failed to load databases.json', e)
				}
			},

			// Rule configuration actions
			setOperation: (operation) => {
				const { currentPresetId, getCurrentPresets, currentCollection } = get()
				const currentPreset = currentPresetId
					? getCurrentPresets().find((p, i) => i.toString() === currentPresetId)
					: null

				set({ operation })
				get().resetRuleConfiguration()

				// If there was a preset selected, reload it for the new operation
				if (currentPreset && currentCollection && currentPreset.rules[currentCollection]?.[operation]) {
					set({ currentPresetId })
					get().loadPreset(currentPreset)
				}
			},
			setAuthenticated: (authenticated) => set({ authenticated }),
			setOwnerField: (ownerField) => set({ ownerField }),
			setLockFields: (lockFields) => set({ lockFields }),
			setAuthMatchField: (authMatchField) => set({ authMatchField }),

			// Grouped conditions management actions
			setGroupedCustomConditions: (groupedConditions) => set({ groupedCustomConditions: groupedConditions }),
			addCustomGroup: (name) =>
				set((state) => ({
					groupedCustomConditions: addGroup(state.groupedCustomConditions, name),
				})),
			removeCustomGroup: (groupId) =>
				set((state) => ({
					groupedCustomConditions: removeGroup(state.groupedCustomConditions, groupId),
				})),
			updateCustomGroup: (groupId, updates) =>
				set((state) => ({
					groupedCustomConditions: updateGroup(state.groupedCustomConditions, groupId, updates),
				})),
			addCustomConditionToGroup: (groupId) =>
				set((state) => ({
					groupedCustomConditions: addCondition(state.groupedCustomConditions, groupId),
				})),
			removeCustomConditionFromGroup: (groupId, conditionId) =>
				set((state) => ({
					groupedCustomConditions: removeCondition(state.groupedCustomConditions, groupId, conditionId),
				})),
			updateCustomConditionInGroup: (groupId, conditionId, updates) =>
				set((state) => ({
					groupedCustomConditions: updateCondition(
						state.groupedCustomConditions,
						groupId,
						conditionId,
						updates
					),
				})),

			setGroupedAbacConditions: (groupedConditions) => set({ groupedAbacConditions: groupedConditions }),
			addAbacGroup: (name) =>
				set((state) => ({
					groupedAbacConditions: addGroup(state.groupedAbacConditions, name),
				})),
			removeAbacGroup: (groupId) =>
				set((state) => ({
					groupedAbacConditions: removeGroup(state.groupedAbacConditions, groupId),
				})),
			updateAbacGroup: (groupId, updates) =>
				set((state) => ({
					groupedAbacConditions: updateGroup(state.groupedAbacConditions, groupId, updates),
				})),
			addAbacConditionToGroup: (groupId) =>
				set((state) => ({
					groupedAbacConditions: addCondition(state.groupedAbacConditions, groupId),
				})),
			removeAbacConditionFromGroup: (groupId, conditionId) =>
				set((state) => ({
					groupedAbacConditions: removeCondition(state.groupedAbacConditions, groupId, conditionId),
				})),
			updateAbacConditionInGroup: (groupId, conditionId, updates) =>
				set((state) => ({
					groupedAbacConditions: updateCondition(state.groupedAbacConditions, groupId, conditionId, updates),
				})),

			// Preset management actions
			getCurrentPresets: () => {
				const { databases, currentDatabaseId } = get()
				const currentDb = databases.find((db) => db.id === currentDatabaseId)
				return currentDb?.presets || []
			},
			getPresetsForOperation: (operation, collection) => {
				const presets = get().getCurrentPresets()
				if (!collection) return []
				return presets.filter((preset) => preset.rules[collection]?.[operation])
			},
			setCurrentPreset: (presetId) => set({ currentPresetId: presetId }),
			loadPreset: (preset) => {
				const { operation, currentCollection } = get()
				if (!currentCollection) return

				const operationRule = preset.rules[currentCollection]?.[operation]

				if (operationRule) {
					try {
						// Validate grouped conditions structure
						const validateGroupedConditions = (conditions: GroupedConditions | undefined) => {
							if (!conditions || typeof conditions !== 'object' || !Array.isArray(conditions.groups)) {
								return { groups: [] }
							}

							// Ensure all conditions and groups have required fields
							const validatedGroups = conditions.groups.map((group) => ({
								id: group.id || crypto.randomUUID(),
								name: group.name || 'New Group',
								internalLogic: group.internalLogic || 'and',
								logic: group.logic || 'and',
								conditions:
									group.conditions?.map((condition) => ({
										id: condition.id || crypto.randomUUID(),
										operand1: condition.operand1 || '',
										operator: condition.operator || '=', // Provide default operator for ABAC conditions
										operand2: condition.operand2 || '',
										operand3: condition.operand3 || '',
									})) || [],
							}))

							return { groups: validatedGroups }
						}

						set({
							authenticated: operationRule.authenticated || false,
							ownerField: operationRule.ownerField || '',
							lockFields: operationRule.lockFields || [],
							authMatchField: operationRule.authMatchField || '',
							groupedCustomConditions: validateGroupedConditions(operationRule.groupedCustomConditions),
							groupedAbacConditions: validateGroupedConditions(operationRule.groupedAbacConditions),
						})
					} catch (error) {
						console.error('Error loading preset:', error)
						// Reset to safe defaults on error
						set({
							authenticated: false,
							ownerField: '',
							lockFields: [],
							authMatchField: '',
							groupedCustomConditions: { groups: [] },
							groupedAbacConditions: { groups: [] },
						})
					}
				}
			},
			saveCurrentPreset: (newPresetName) => {
				const {
					operation,
					authenticated,
					ownerField,
					lockFields,
					authMatchField,
					groupedCustomConditions,
					groupedAbacConditions,
					currentDatabaseId,
					currentCollection,
				} = get()

				if (!newPresetName.trim() || !currentDatabaseId || !currentCollection) return

				const currentPresets = get().getCurrentPresets()
				const existingPresetIndex = currentPresets.findIndex((p) => p.name === newPresetName.trim())

				const ruleConfig = {
					authenticated,
					ownerField,
					lockFields: lockFields.filter(Boolean),
					authMatchField,
					groupedCustomConditions,
					groupedAbacConditions,
				}

				if (existingPresetIndex >= 0) {
					// Update existing preset
					const updatedPresets = [...currentPresets]
					const existingPreset = updatedPresets[existingPresetIndex]
					const existingCollectionRules = existingPreset.rules[currentCollection] || {}

					updatedPresets[existingPresetIndex] = {
						...existingPreset,
						rules: {
							...existingPreset.rules,
							[currentCollection]: {
								...existingCollectionRules,
								[operation]: ruleConfig,
							},
						},
					}

					get().updateDatabase(currentDatabaseId, { presets: updatedPresets })
				} else {
					// Create new preset
					const newPreset: DatabasePreset = {
						name: newPresetName.trim(),
						rules: {
							[currentCollection]: {
								[operation]: ruleConfig,
							},
						},
					}

					get().updateDatabase(currentDatabaseId, {
						presets: [...currentPresets, newPreset],
					})
				}
			},
			updateExistingPreset: (presetIndex) => {
				const {
					operation,
					authenticated,
					ownerField,
					lockFields,
					authMatchField,
					groupedCustomConditions,
					groupedAbacConditions,
					currentDatabaseId,
					currentCollection,
				} = get()

				if (!currentDatabaseId || !currentCollection) return

				const currentPresets = get().getCurrentPresets()
				if (presetIndex >= 0 && presetIndex < currentPresets.length) {
					const updatedPresets = [...currentPresets]
					const existingPreset = updatedPresets[presetIndex]
					const existingCollectionRules = existingPreset.rules[currentCollection] || {}
					updatedPresets[presetIndex] = {
						...existingPreset,
						rules: {
							...existingPreset.rules,
							[currentCollection]: {
								...existingCollectionRules,
								[operation]: {
									authenticated,
									ownerField,
									lockFields: lockFields.filter(Boolean),
									authMatchField,
									groupedCustomConditions,
									groupedAbacConditions,
								},
							},
						},
					}

					get().updateDatabase(currentDatabaseId, { presets: updatedPresets })
				}
			},
			deletePreset: (presetId) => {
				const { currentDatabaseId } = get()
				if (!currentDatabaseId) return

				const currentPresets = get().getCurrentPresets()
				const updatedPresets = currentPresets.filter((_, index) => index.toString() !== presetId)

				get().updateDatabase(currentDatabaseId, { presets: updatedPresets })

				if (get().currentPresetId === presetId) {
					set({ currentPresetId: null })
				}
			},

			// UI State actions
			setCopied: (copied) => set({ copied }),
			setRuleContent: (ruleContent) => set({ ruleContent }),
			setSchemaJson: (schemaJson) => set({ schemaJson }),
			setCurrentCollection: (currentCollection) => set({ currentCollection }),
			resetRuleConfiguration: () => {
				set({
					authenticated: false,
					ownerField: '',
					lockFields: [],
					authMatchField: '',
					groupedCustomConditions: { groups: [] },
					groupedAbacConditions: { groups: [] },
					currentPresetId: null,
				})
			},

			// Computed getters
			getCurrentDatabase: () => {
				const { databases, currentDatabaseId } = get()
				return databases.find((db) => db.id === currentDatabaseId) || null
			},
			getCurrentSchemas: () => {
				return selectCurrentSchemas(get())
			},
		}),
		{
			name: 'rule-builder-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				databases: state.databases,
				currentDatabaseId: state.currentDatabaseId,
			}),
		}
	)
)

export const isReadOperation = (state: RuleBuilderState) => ['listRule', 'viewRule'].includes(state.operation)
export const isWriteOperation = (state: RuleBuilderState) => ['createRule', 'updateRule'].includes(state.operation)

export const useRuleGenerator = () => {
	const generatedRule = useRuleBuilderStore(
		useCallback((state) => {
			const {
				authenticated,
				ownerField,
				operation,
				authMatchField,
				lockFields,
				groupedCustomConditions,
				groupedAbacConditions,
			} = state
			const isReadOp = isReadOperation(state)
			const isWriteOp = isWriteOperation(state)
			const schemas = selectCurrentSchemas(state)

			const allFields = Object.values(schemas).flatMap((collection) =>
				collection.fields.map((field) => field.name)
			)

			const quoteValue = (value: string) => {
				const trimmedValue = value.trim()
				if (trimmedValue === 'true' || trimmedValue === 'false' || trimmedValue === 'null') {
					return trimmedValue
				}
				if (/^-?\\d+(\\.\\d+)?$/.test(trimmedValue)) {
					return trimmedValue
				}
				if (trimmedValue.startsWith('@')) {
					return trimmedValue
				}
				if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
					return trimmedValue
				}
				if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) {
					return trimmedValue
				}
				const valueParts = trimmedValue.split(':')
				const potentialField = valueParts[0]
				if (allFields.includes(potentialField)) {
					return trimmedValue
				}
				return `"${trimmedValue.replace(/"/g, '\\"')}"`
			}
			const generateGroupedConditionsString = (groupedConditions: GroupedConditions, isAbac: boolean = false) => {
				if (!groupedConditions.groups.length) return ''

				const groupStrings = groupedConditions.groups
					.map((group, groupIndex) => {
						if (!group.conditions.length) return ''

						// Generate conditions within the group
						const conditionStrings = group.conditions
							.filter((c) => {
								if (isAbac) {
									// For ABAC conditions, we need operand1, operand2, and operand3
									return c.operand1 && c.operand2 && c.operand3
								} else {
									// For custom conditions, we need operand1, operator, and operand2
									return c.operand1 && c.operator && c.operand2
								}
							})
							.map((condition, condIndex) => {
								let statement = ''
								if (isAbac) {
									if (condition.operand1 && condition.operand2 && condition.operand3) {
										const value = quoteValue(condition.operand3)
										statement = `json_extract(@collection.${condition.operand1}, '${condition.operand2}') = ${value}`
									}
								} else {
									const value = quoteValue(condition.operand2)
									statement = `${condition.operand1} ${condition.operator} ${value}`
								}

								// Add internal logic operator for conditions after the first
								if (condIndex > 0) {
									const logicOperator = group.internalLogic === 'and' ? '&&' : '||'
									statement = `${logicOperator} ${statement}`
								}

								return statement
							})
							.filter(Boolean)

						if (!conditionStrings.length) return ''

						// Wrap group in parentheses if it has more than one condition
						const groupString =
							conditionStrings.length > 1 ? `(${conditionStrings.join(' ')})` : conditionStrings[0]

						// Add group logic operator for groups after the first
						if (groupIndex > 0 && groupIndex < groupedConditions.groups.length) {
							const prevGroup = groupedConditions.groups[groupIndex - 1]
							const logicOperator = prevGroup.logic === 'and' ? '&&' : '||'
							return `${logicOperator} ${groupString}`
						}

						return groupString
					})
					.filter(Boolean)

				return groupStrings.length > 0 ? groupStrings.join(' ') : ''
			}

			const parts = []

			if (authenticated) parts.push('@request.auth.id != ""')
			if (isReadOp && ownerField) parts.push(`${ownerField} = @request.auth.id`)
			if (isWriteOp && ownerField) parts.push(`@request.data.${ownerField} = @request.auth.id`)

			if (operation === 'updateRule') {
				if (authMatchField) parts.push(`@collection.${authMatchField}.id = @request.auth.id`)
				if (lockFields && lockFields.length > 0) {
					const lockConditions = lockFields
						.filter(Boolean)
						.map((field) => `@request.data.${field} = ${field}`)
					if (lockConditions.length > 0) parts.push(lockConditions.join(' && '))
				}
			}

			// Use grouped conditions if available, otherwise fall back to legacy conditions
			if (groupedCustomConditions.groups.length > 0) {
				const groupedCustomString = generateGroupedConditionsString(groupedCustomConditions, false)
				if (groupedCustomString) parts.push(`(${groupedCustomString})`)
			}

			if (groupedAbacConditions.groups.length > 0) {
				const groupedAbacString = generateGroupedConditionsString(groupedAbacConditions, true)
				if (groupedAbacString) parts.push(`(${groupedAbacString})`)
			}

			return parts.join(' && ')
		}, [])
	)

	return { generatedRule }
}
