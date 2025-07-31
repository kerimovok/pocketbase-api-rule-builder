import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'

export const CollectionSelector = () => {
	const {
		getCurrentDatabase,
		currentCollection,
		setCurrentCollection,
		resetRuleConfiguration,
		currentDatabaseId,
		currentPresetId,
		getCurrentPresets,
		loadPreset,
		operation,
	} = useRuleBuilderStore()

	const db = getCurrentDatabase()

	useEffect(() => {
		if (db && db.schemas.length > 0 && !currentCollection) {
			setCurrentCollection(db.schemas[0].name)
		}
	}, [db, currentCollection, setCurrentCollection, currentDatabaseId])

	if (!db || !db.schemas.length) {
		return null
	}

	const handleCollectionChange = (collectionName: string) => {
		if (collectionName !== currentCollection) {
			const currentPreset = currentPresetId
				? getCurrentPresets().find((p, i) => i.toString() === currentPresetId)
				: null

			setCurrentCollection(collectionName)
			resetRuleConfiguration()

			// If there was a preset selected, reload it for the new collection
			if (currentPreset && currentPreset.rules[collectionName]?.[operation]) {
				loadPreset(currentPreset)
			}
		}
	}

	const selectedCollection = db.schemas.find((s) => s.name === currentCollection)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='outline' role='combobox' className='w-[200px] justify-between'>
					{selectedCollection ? (
						<span className='truncate'>{selectedCollection.name}</span>
					) : (
						'Select collection...'
					)}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] p-0'>
				<Command>
					<CommandInput placeholder='Search collections...' />
					<CommandList>
						<CommandEmpty>No collections found.</CommandEmpty>
						<CommandGroup>
							{db.schemas.map((schema) => (
								<CommandItem
									key={schema.name}
									value={schema.name}
									onSelect={(currentValue: string) => {
										handleCollectionChange(currentValue)
									}}
								>
									<Check
										className={`mr-2 h-4 w-4 ${
											currentCollection === schema.name ? 'opacity-100' : 'opacity-0'
										}`}
									/>
									{schema.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
