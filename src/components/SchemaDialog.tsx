import { AlertCircle, Database, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useValidateJson } from '../hooks/useValidateJson'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import type { PbCollection } from '../types'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface SchemaDialogProps {
	isOpen: boolean
	onClose: () => void
}

export const SchemaDialog = ({ isOpen, onClose }: SchemaDialogProps) => {
	const { getCurrentDatabase, getCurrentSchemas, updateDatabase, currentDatabaseId } = useRuleBuilderStore()

	const [activeTab, setActiveTab] = useState('raw')
	const [editingSchemas, setEditingSchemas] = useState('')
	const { validationResult, isValid, validate, reset } = useValidateJson('pocketbase-schema')

	const currentDatabase = getCurrentDatabase()
	const schemas = getCurrentSchemas()

	useEffect(() => {
		if (isOpen && currentDatabase) {
			const schemaString = JSON.stringify(currentDatabase.schemas, null, 2)
			setEditingSchemas(schemaString)
			validate(schemaString)
		}
	}, [isOpen, currentDatabase, validate])

	const handleSave = () => {
		if (!currentDatabaseId || !editingSchemas.trim() || !isValid) return

		const parsed = JSON.parse(editingSchemas)

		updateDatabase(currentDatabaseId, { schemas: parsed as PbCollection[] })
		alert('Schema saved successfully!')
	}

	const validateJsonOnChange = (value: string) => {
		setEditingSchemas(value)
		validate(value)
	}

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose()
			reset()
			setActiveTab('raw')
		}
	}

	if (!currentDatabase) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='!max-w-7xl !w-[98vw] !h-[92vh] p-0 gap-0' showCloseButton={false}>
				<DialogHeader className='px-6 pt-4 border-b'>
					<DialogTitle className='flex items-center gap-3'>
						<Database size={20} />
						Collection Schemas - {currentDatabase.name}
					</DialogTitle>
				</DialogHeader>

				<div className='flex-1 flex overflow-hidden'>
					<aside className='w-1/4 border-r bg-muted/30 p-4 overflow-y-auto'>
						<nav className='space-y-2'>
							<Button
								onClick={() => setActiveTab('raw')}
								variant={activeTab === 'raw' ? 'secondary' : 'ghost'}
								className='w-full justify-start text-sm'
								size='sm'
							>
								Raw JSON Schema
							</Button>
							<hr className='my-2' />
							{Object.entries(schemas).map(([key, schema]) => (
								<Button
									key={key}
									onClick={() => setActiveTab(key)}
									variant={activeTab === key ? 'secondary' : 'ghost'}
									className='w-full justify-start text-sm'
									size='sm'
								>
									{schema.name}
								</Button>
							))}
						</nav>
					</aside>

					<main className='flex-1 flex flex-col overflow-hidden'>
						<div className='p-4 border-b flex items-center justify-between'>
							<h3 className='text-lg font-semibold'>
								{activeTab === 'raw' ? 'Edit Raw Schema' : schemas[activeTab]?.name}
							</h3>
							{activeTab === 'raw' && (
								<Button onClick={handleSave} variant='outline' size='sm' disabled={!isValid}>
									<Save size={16} />
									Save Changes
								</Button>
							)}
						</div>

						<div className='flex-1 p-4 overflow-y-auto'>
							{activeTab === 'raw' ? (
								<div className='space-y-4 h-full'>
									<p className='text-sm text-muted-foreground'>
										Edit the PocketBase JSON schema for database "{currentDatabase.name}".
									</p>

									{/* Validation Status */}
									{editingSchemas.trim() && (
										<div
											className={`text-xs flex items-start gap-2 ${
												isValid ? 'text-green-600' : 'text-red-600'
											}`}
										>
											<div
												className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
													isValid ? 'bg-green-600' : 'bg-red-600'
												}`}
											/>
											<div>
												{isValid ? (
													<span>Valid PocketBase schema format</span>
												) : (
													<div>
														<div className='font-medium'>
															{validationResult.error || 'Invalid JSON format'}
														</div>
														{validationResult.details && (
															<div className='text-muted-foreground mt-1'>
																{validationResult.details}
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									)}

									{/* Error Alert */}
									{validationResult.error && (
										<div className='flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
											<AlertCircle size={20} className='text-destructive mt-0.5 flex-shrink-0' />
											<div className='text-sm'>
												<p className='font-medium text-destructive'>{validationResult.error}</p>
												{validationResult.details && (
													<p className='text-muted-foreground mt-1'>
														{validationResult.details}
													</p>
												)}
											</div>
										</div>
									)}

									<textarea
										value={editingSchemas}
										onChange={(e) => validateJsonOnChange(e.target.value)}
										className={`w-full h-full min-h-[400px] p-4 border rounded-md bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
											validationResult.error
												? 'border-destructive focus:ring-destructive/20'
												: 'focus:ring-ring'
										}`}
										placeholder='Edit your schema JSON here...'
									/>
								</div>
							) : (
								activeTab &&
								schemas[activeTab] && (
									<div className='space-y-4'>
										<div>
											<p className='text-sm text-muted-foreground mb-4'>
												Collection key:{' '}
												<code className='px-1.5 py-0.5 bg-muted rounded text-xs font-mono'>
													{activeTab}
												</code>
											</p>
										</div>
										<div className='border rounded-lg overflow-hidden'>
											<div className='grid grid-cols-3 px-4 py-3 bg-muted/50 font-semibold text-sm border-b'>
												<div>Field Name</div>
												<div>Type</div>
												<div>Description</div>
											</div>
											{schemas[activeTab].fields.map((field) => (
												<div
													key={field.name}
													className='grid grid-cols-3 px-4 py-3 text-sm border-b last:border-b-0 hover:bg-muted/20'
												>
													<div className='font-mono text-blue-600'>{field.name}</div>
													<div>
														<span className='px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium'>
															{field.type}
														</span>
													</div>
													<div className='text-muted-foreground'>{field.description}</div>
												</div>
											))}
										</div>
									</div>
								)
							)}
						</div>
					</main>
				</div>
			</DialogContent>
		</Dialog>
	)
}
