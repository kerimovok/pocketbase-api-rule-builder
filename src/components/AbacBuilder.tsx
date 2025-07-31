import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { ConditionBuilder } from './ConditionBuilder'

export const AbacBuilder = () => {
	const {
		groupedAbacConditions,
		addAbacGroup,
		removeAbacGroup,
		updateAbacGroup,
		addAbacConditionToGroup,
		removeAbacConditionFromGroup,
		updateAbacConditionInGroup,
	} = useRuleBuilderStore()

	return (
		<ConditionBuilder
			title='Attribute-Based Access Control (ABAC)'
			isAbac
			groupedConditions={groupedAbacConditions}
			addRuleGroup={addAbacGroup}
			removeRuleGroup={removeAbacGroup}
			updateRuleGroup={updateAbacGroup}
			addConditionToGroup={addAbacConditionToGroup}
			removeConditionFromGroup={removeAbacConditionFromGroup}
			updateConditionInGroup={updateAbacConditionInGroup}
			operand1Placeholder='team_members.permissions'
			operand2Placeholder='$.canEdit'
			operand3Placeholder={`"true"`}
		/>
	)
}
