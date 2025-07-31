import { AlertCircle, Database, Save } from 'lucide-react'
import { useState } from 'react'
import { useValidateJson } from '../hooks/useValidateJson'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

interface DatabaseManagerDialogProps {
	isOpen: boolean
	onClose: () => void
}

export const DatabaseManagerDialog = ({ isOpen, onClose }: DatabaseManagerDialogProps) => {
	const { addDatabase } = useRuleBuilderStore()

	const [newDatabaseName, setNewDatabaseName] = useState('')
	const [newDatabaseSchemas, setNewDatabaseSchemas] = useState('')
	const { validationResult, isValid, validate, reset } = useValidateJson('pocketbase-schema')

	const handleSave = () => {
		if (newDatabaseName.trim() && newDatabaseSchemas.trim() && isValid) {
			addDatabase(newDatabaseName.trim(), newDatabaseSchemas.trim())
			handleClose(true) // Pass true to indicate successful save
		}
	}

	const validateJsonOnChange = (value: string) => {
		setNewDatabaseSchemas(value)
		validate(value)
	}

	const handleClose = (saved: boolean = false) => {
		if (!saved) {
			onClose()
		}
		// Reset state after a delay to allow animation to finish
		setTimeout(() => {
			setNewDatabaseName('')
			setNewDatabaseSchemas('')
			reset()
			if (saved) onClose()
		}, 300)
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) handleClose()
			}}
		>
			<DialogContent className='!max-w-4xl !w-[90vw] !h-[80vh] p-0 gap-0' showCloseButton={false}>
				<DialogHeader className='px-6 py-4 border-b'>
					<DialogTitle className='flex items-center gap-3'>
						<Database size={20} />
						Database Manager
					</DialogTitle>
					<DialogDescription>
						Create a new database by providing a name and pasting the JSON schema export from PocketBase UI.
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 p-6 overflow-y-auto space-y-6'>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Database Name</label>
						<input
							type='text'
							value={newDatabaseName}
							onChange={(e) => setNewDatabaseName(e.target.value)}
							placeholder='Enter database name...'
							className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>PocketBase Schema JSON</label>
						<div className='space-y-2'>
							<p className='text-xs text-muted-foreground'>
								Go to your PocketBase Admin UI → Collections → Export collections JSON and paste the
								content below.
							</p>

							<div className='bg-muted/50 p-4 rounded-lg'>
								<h3 className='text-sm font-semibold mb-2'>Instructions:</h3>
								<ol className='text-xs text-muted-foreground space-y-1 list-decimal list-inside'>
									<li>Open your PocketBase Admin UI</li>
									<li>Go to Settings tab</li>
									<li>Click "Export collections" button</li>
									<li>Copy the JSON content</li>
									<li>Paste it in the textarea below</li>
								</ol>
							</div>

							{/* Validation Status */}
							{newDatabaseSchemas.trim() && (
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
											<p className='text-muted-foreground mt-1'>{validationResult.details}</p>
										)}
									</div>
								</div>
							)}

							<textarea
								value={newDatabaseSchemas}
								onChange={(e) => validateJsonOnChange(e.target.value)}
								placeholder='Paste your PocketBase collections JSON here...'
								className={`w-full h-96 p-4 border rounded-md bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
									validationResult.error
										? 'border-destructive focus:ring-destructive/20'
										: 'focus:ring-ring'
								}`}
							/>
						</div>
					</div>
				</div>

				<DialogFooter className='px-6 py-4 border-t'>
					<Button onClick={() => handleClose()} variant='outline'>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!newDatabaseName.trim() || !isValid}>
						<Save size={16} />
						Create Database
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
