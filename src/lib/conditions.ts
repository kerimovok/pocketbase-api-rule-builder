import type { Condition, ConditionGroup, GroupedConditions } from '../types'

export const createConditionGroup = (name: string = 'New Group'): ConditionGroup => ({
	id: crypto.randomUUID(),
	name,
	conditions: [],
	internalLogic: 'and',
	logic: 'and',
})

export const addGroup = (groupedConditions: GroupedConditions, name?: string): GroupedConditions => ({
	...groupedConditions,
	groups: [...groupedConditions.groups, createConditionGroup(name)],
})

export const removeGroup = (groupedConditions: GroupedConditions, groupId: string): GroupedConditions => ({
	...groupedConditions,
	groups: groupedConditions.groups.filter((group) => group.id !== groupId),
})

export const updateGroup = (
	groupedConditions: GroupedConditions,
	groupId: string,
	updates: Partial<ConditionGroup>
): GroupedConditions => ({
	...groupedConditions,
	groups: groupedConditions.groups.map((group) => (group.id === groupId ? { ...group, ...updates } : group)),
})

export const createCondition = (): Condition => ({
	id: crypto.randomUUID(),
	operand1: '',
	operator: '=',
	operand2: '',
	operand3: '',
})

export const addCondition = (groupedConditions: GroupedConditions, groupId: string): GroupedConditions => ({
	...groupedConditions,
	groups: groupedConditions.groups.map((group) =>
		group.id === groupId ? { ...group, conditions: [...group.conditions, createCondition()] } : group
	),
})

export const removeCondition = (
	groupedConditions: GroupedConditions,
	groupId: string,
	conditionId: string
): GroupedConditions => ({
	...groupedConditions,
	groups: groupedConditions.groups.map((group) =>
		group.id === groupId
			? { ...group, conditions: group.conditions.filter((cond) => cond.id !== conditionId) }
			: group
	),
})

export const updateCondition = (
	groupedConditions: GroupedConditions,
	groupId: string,
	conditionId: string,
	updates: Partial<Condition>
): GroupedConditions => ({
	...groupedConditions,
	groups: groupedConditions.groups.map((group) =>
		group.id === groupId
			? {
					...group,
					conditions: group.conditions.map((cond) =>
						cond.id === conditionId ? { ...cond, ...updates } : cond
					),
			  }
			: group
	),
})
