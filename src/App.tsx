import { Database } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CollectionSelector } from './components/CollectionSelector'
import { DatabaseManagerDialog } from './components/DatabaseManagerDialog'
import { DatabaseSelector } from './components/DatabaseSelector'
import { GeneratedRule } from './components/GeneratedRule'
import { Header } from './components/Header'
import { OperationTabs } from './components/OperationTabs'
import { PresetSelector } from './components/PresetSelector'
import { RuleConfigPanel } from './components/RuleConfigPanel'
import { SavePresetDialog } from './components/SavePresetDialog'
import { SchemaDialog } from './components/SchemaDialog'
import { Button } from './components/ui/button'
import { useRuleBuilderStore, useRuleGenerator } from './store/useRuleBuilderStore'

const App = () => {
	const { loadDatabases, setRuleContent, getCurrentDatabase } = useRuleBuilderStore()

	const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState(false)
	const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = useState(false)
	const [isSchemaDialogOpen, setIsSchemaDialogOpen] = useState(false)

	const { generatedRule } = useRuleGenerator()
	const currentDatabase = getCurrentDatabase()

	useEffect(() => {
		loadDatabases()
	}, [loadDatabases])

	useEffect(() => {
		setRuleContent(generatedRule)
	}, [generatedRule, setRuleContent])

	return (
		<div className='min-h-screen bg-background'>
			<Header />

			<div className='container mx-auto px-4 py-6'>
				<div className='flex flex-col gap-6'>
					{/* Database and Navigation Section */}
					<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
						<h1 className='text-2xl sm:text-3xl font-bold'>Rule Builder</h1>
						<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
							<DatabaseSelector onNewDatabase={() => setIsDatabaseManagerOpen(true)} />
							{currentDatabase && <CollectionSelector />}
							{currentDatabase && (
								<Button variant='outline' className='gap-2' onClick={() => setIsSchemaDialogOpen(true)}>
									<Database size={16} />
									View Schemas
								</Button>
							)}
						</div>
					</div>

					{/* Show content only if database is selected */}
					{currentDatabase ? (
						<>
							{/* Operation and Preset Selection */}
							<div className='space-y-4'>
								<OperationTabs />
								<PresetSelector onSavePreset={() => setIsSavePresetDialogOpen(true)} />
							</div>

							{/* Main Rule Building Interface */}
							<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
								<div className='col-span-2 bg-card border rounded-lg'>
									<RuleConfigPanel />
								</div>

								<GeneratedRule onSavePreset={() => setIsSavePresetDialogOpen(true)} />
							</div>
						</>
					) : (
						/* No database selected state */
						<div className='flex flex-col items-center justify-center py-16 text-center'>
							<div className='mb-6'>
								<div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto'>
									<span className='text-2xl'>🗄️</span>
								</div>
								<h2 className='text-xl font-semibold mb-2'>No Database Selected</h2>
								<p className='text-muted-foreground mb-6 max-w-md'>
									Create a new database or wait for the default databases to load to start building
									API rules.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Dialogs */}
			<DatabaseManagerDialog isOpen={isDatabaseManagerOpen} onClose={() => setIsDatabaseManagerOpen(false)} />
			<SavePresetDialog isOpen={isSavePresetDialogOpen} onClose={() => setIsSavePresetDialogOpen(false)} />
			<SchemaDialog isOpen={isSchemaDialogOpen} onClose={() => setIsSchemaDialogOpen(false)} />
		</div>
	)
}

export default App
