import { AlertCircle, Save } from 'lucide-react'
import { useState } from 'react'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

interface SavePresetDialogProps {
	isOpen: boolean
	onClose: () => void
}

export const SavePresetDialog = ({ isOpen, onClose }: SavePresetDialogProps) => {
	const {
		saveCurrentPreset,
		operationConfig,
		operation,
		getCurrentPresets,
		getPresetsForOperation,
		currentCollection,
	} = useRuleBuilderStore()

	const [newPresetName, setNewPresetName] = useState('')

	const allPresets = getCurrentPresets()
	const operationPresets = getPresetsForOperation(operation, currentCollection)
	const existingPreset = allPresets.find((p) => p.name === newPresetName.trim())
	const hasOperationRule = existingPreset?.rules[currentCollection]?.[operation]

	const handleSave = () => {
		if (newPresetName.trim()) {
			saveCurrentPreset(newPresetName.trim())
			handleClose(true)
		}
	}

	const handleClose = (saved: boolean = false) => {
		if (!saved) {
			onClose()
		}
		setTimeout(() => {
			setNewPresetName('')
			if (saved) onClose()
		}, 300)
	}

	const getSaveButtonText = () => {
		if (!newPresetName.trim()) return 'Save'
		if (existingPreset) {
			return hasOperationRule ? 'Update Existing Preset' : 'Add Rule to Existing Preset'
		}
		return 'Create New Preset'
	}

	const getDialogDescription = () => {
		if (existingPreset) {
			if (hasOperationRule) {
				return `A preset named "${newPresetName}" already has a ${operationConfig[operation].label} rule. This will update the existing rule.`
			} else {
				return `A preset named "${newPresetName}" exists but doesn't have a ${operationConfig[operation].label} rule. This will add the rule to the existing preset.`
			}
		}
		return `Save the current configuration as a new preset for the ${operationConfig[operation].label} operation.`
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) handleClose()
			}}
		>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Save size={20} />
						Save Preset
					</DialogTitle>
					<DialogDescription>{getDialogDescription()}</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Preset Name</label>
						<input
							type='text'
							value={newPresetName}
							onChange={(e) => setNewPresetName(e.target.value)}
							placeholder='Enter preset name...'
							className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
							autoFocus
						/>
					</div>

					{existingPreset && (
						<div className='flex items-start gap-2 p-3 bg-muted/50 rounded-lg'>
							<AlertCircle size={16} className='text-amber-500 mt-0.5' />
							<div className='text-sm'>
								<p className='font-medium'>Preset Already Exists</p>
								<p className='text-muted-foreground'>
									{hasOperationRule
										? `This will update the existing ${operationConfig[operation].label} rule.`
										: `This will add a ${operationConfig[operation].label} rule to the existing preset.`}
								</p>
							</div>
						</div>
					)}

					{operationPresets.length > 0 && (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Existing {operationConfig[operation].label} Presets for "{currentCollection}"
							</label>
							<div className='max-h-32 overflow-y-auto space-y-1'>
								{operationPresets.map((preset, index) => (
									<button
										key={index}
										onClick={() => setNewPresetName(preset.name)}
										className='w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors'
									>
										{preset.name}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button onClick={() => handleClose()} variant='outline'>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!newPresetName.trim()}>
						{getSaveButtonText()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
