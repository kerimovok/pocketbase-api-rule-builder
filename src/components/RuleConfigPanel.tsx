import { Shield } from 'lucide-react'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { AbacBuilder } from './AbacBuilder'
import { CustomConditionsBuilder } from './CustomConditionsBuilder'
import { Button } from './ui/button'
import { Switch } from './ui/switch'

export const RuleConfigPanel = () => {
	const {
		operation,
		operationConfig,
		resetRuleConfiguration,
		authenticated,
		setAuthenticated,
		ownerField,
		setOwnerField,
		lockFields,
		setLockFields,
		authMatchField,
		setAuthMatchField,
	} = useRuleBuilderStore()

	const OperationIcon = operationConfig[operation].icon

	return (
		<div className='p-5 rounded-xl flex-grow flex flex-col space-y-6'>
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-3'>
					<div className={`p-2 rounded-md ${operationConfig[operation].color}`}>
						<OperationIcon size={20} />
					</div>
					<h2 className='text-xl font-bold'>{operationConfig[operation].label} Rule</h2>
				</div>
				<Button variant='link' onClick={resetRuleConfiguration}>
					Reset
				</Button>
			</div>

			<div className='space-y-5'>
				<div className='flex items-center justify-between p-4 border rounded-lg'>
					<label htmlFor='authenticated' className='font-medium flex items-center gap-3'>
						<Shield size={18} />
						Require Authentication
					</label>
					<Switch id='authenticated' checked={authenticated} onCheckedChange={setAuthenticated} />
				</div>

				{operation !== 'deleteRule' && (
					<div className='space-y-2'>
						<label className='text-sm font-medium'>
							Owner Field
							<span className='ml-2 text-xs text-muted-foreground'>
								(e.g., <code className='px-1 py-0.5 bg-muted rounded text-xs'>user</code>,{' '}
								<code className='px-1 py-0.5 bg-muted rounded text-xs'>created_by</code>)
							</span>
						</label>
						<input
							type='text'
							value={ownerField}
							onChange={(e) => setOwnerField(e.target.value)}
							placeholder='user_id_field'
							className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
						/>
					</div>
				)}

				{operation === 'updateRule' && (
					<>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Fields to Lock on Update
								<span className='ml-2 text-xs text-muted-foreground'>
									(e.g., <code className='px-1 py-0.5 bg-muted rounded text-xs'>role</code>,{' '}
									<code className='px-1 py-0.5 bg-muted rounded text-xs'>email</code>)
								</span>
							</label>
							<input
								type='text'
								value={lockFields.join(', ')}
								onChange={(e) => setLockFields(e.target.value.split(',').map((f) => f.trim()))}
								placeholder='field1, field2, ...'
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Authenticated User Match Field
								<span className='ml-2 text-xs text-muted-foreground'>
									(e.g., <code className='px-1 py-0.5 bg-muted rounded text-xs'>users</code>)
								</span>
							</label>
							<input
								type='text'
								value={authMatchField}
								onChange={(e) => setAuthMatchField(e.target.value)}
								placeholder='@collection.FIELD.id'
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
							/>
						</div>
					</>
				)}

				<CustomConditionsBuilder />

				<AbacBuilder />
			</div>
		</div>
	)
}
