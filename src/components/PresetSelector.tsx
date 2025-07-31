import { ChevronDown, Edit, Layers, Plus, Trash2 } from 'lucide-react'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { Button } from './ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface PresetSelectorProps {
	onSavePreset: () => void
}

export const PresetSelector = ({ onSavePreset }: PresetSelectorProps) => {
	const {
		operation,
		operationConfig,
		getCurrentPresets,
		getPresetsForOperation,
		currentPresetId,
		setCurrentPreset,
		loadPreset,
		updateExistingPreset,
		deletePreset,
		getCurrentDatabase,
		resetRuleConfiguration,
		currentCollection,
	} = useRuleBuilderStore()

	const currentDatabase = getCurrentDatabase()
	const allPresets = getCurrentPresets()
	const operationPresets = getPresetsForOperation(operation, currentCollection)
	const currentPreset = currentPresetId ? allPresets.find((_, i) => i.toString() === currentPresetId) : null

	if (!currentDatabase) {
		return null
	}

	const handlePresetSelect = (presetIndex: number) => {
		const preset = allPresets[presetIndex]
		if (preset && preset.rules[currentCollection]?.[operation]) {
			setCurrentPreset(presetIndex.toString())
			loadPreset(preset)
		}
	}

	const handleClearPreset = () => {
		setCurrentPreset(null)
		resetRuleConfiguration()
	}

	const handleUpdatePreset = (presetIndex: number) => {
		updateExistingPreset(presetIndex)
		// Show visual feedback
		alert('Preset updated successfully!')
	}

	return (
		<div className='flex items-center gap-2'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='outline' className='min-w-[200px] justify-between'>
						<div className='flex items-center gap-2'>
							<Layers size={16} />
							<span className='truncate'>
								{currentPreset?.name || `No ${operationConfig[operation].label} Preset`}
							</span>
						</div>
						<ChevronDown size={16} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-full'>
					<DropdownMenuLabel>{operationConfig[operation].label} Presets</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{currentPreset && (
							<DropdownMenuItem onSelect={handleClearPreset}>No Preset (Clear)</DropdownMenuItem>
						)}
						{operationPresets.length > 0 ? (
							operationPresets.map((preset) => {
								const originalIndex = allPresets.indexOf(preset)
								const isCurrentPreset = originalIndex.toString() === currentPresetId
								return (
									<DropdownMenuItem
										key={originalIndex}
										onSelect={() => handlePresetSelect(originalIndex)}
										className='flex items-center justify-between'
									>
										<div className='flex items-center gap-2'>
											<Layers size={14} />
											<span className='truncate'>{preset.name}</span>
										</div>
										<div className='flex items-center gap-1'>
											{isCurrentPreset && (
												<Button
													variant='ghost'
													size='icon'
													className='h-6 w-6'
													onClick={(e) => {
														e.stopPropagation()
														handleUpdatePreset(originalIndex)
													}}
													title='Update preset with current configuration'
												>
													<Edit size={12} />
												</Button>
											)}
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant='ghost'
														size='icon'
														className='h-6 w-6'
														onClick={(e) => e.stopPropagation()}
													>
														<Trash2 size={12} />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Delete Preset</DialogTitle>
														<DialogDescription>
															Are you sure you want to delete the preset "{preset.name}"?
															This action cannot be undone.
														</DialogDescription>
													</DialogHeader>
													<DialogFooter>
														<Button variant='outline'>Cancel</Button>
														<Button
															variant='destructive'
															onClick={() => deletePreset(originalIndex.toString())}
														>
															Delete Preset
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>
									</DropdownMenuItem>
								)
							})
						) : (
							<DropdownMenuItem disabled>
								No presets for {operationConfig[operation].label}
							</DropdownMenuItem>
						)}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={onSavePreset}>
						<Plus size={14} className='mr-2' />
						Save Current as Preset
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Show additional info when preset is selected */}
			{currentPreset && (
				<div className='text-xs text-muted-foreground'>
					<span className='px-2 py-1 bg-accent/50 rounded'>
						{operationConfig[operation].label} preset loaded
					</span>
				</div>
			)}
		</div>
	)
}
