import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import type { Operation } from '../types'
import { Button } from './ui/button'

export const OperationTabs = () => {
	const { operation, operationConfig, setOperation } = useRuleBuilderStore()

	return (
		<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3'>
			{(Object.keys(operationConfig) as Operation[]).map((key) => {
				const config = operationConfig[key]
				const Icon = config.icon
				return (
					<Button
						key={key}
						onClick={() => setOperation(key)}
						variant={operation === key ? 'default' : 'secondary'}
						className='flex-col h-auto p-4'
					>
						<Icon size={24} className='mb-2' />
						<span className='text-sm font-semibold text-center'>{config.label}</span>
					</Button>
				)
			})}
		</div>
	)
}
