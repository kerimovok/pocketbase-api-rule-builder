import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { ConditionBuilder } from './ConditionBuilder'

export const CustomConditionsBuilder = () => {
	const {
		groupedCustomConditions,
		addCustomGroup,
		removeCustomGroup,
		updateCustomGroup,
		addCustomConditionToGroup,
		removeCustomConditionFromGroup,
		updateCustomConditionInGroup,
	} = useRuleBuilderStore()

	return (
		<ConditionBuilder
			title='Custom Conditions'
			groupedConditions={groupedCustomConditions}
			addRuleGroup={addCustomGroup}
			removeRuleGroup={removeCustomGroup}
			updateRuleGroup={updateCustomGroup}
			addConditionToGroup={addCustomConditionToGroup}
			removeConditionFromGroup={removeCustomConditionFromGroup}
			updateConditionInGroup={updateCustomConditionInGroup}
			operand1Placeholder='field or field:modifier'
			operand2Placeholder={`"string", number, bool, @now, etc.`}
		/>
	)
}
