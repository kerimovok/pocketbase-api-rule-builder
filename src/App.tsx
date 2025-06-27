import {
	BookOpen,
	Check,
	ChevronDown,
	Code2,
	Copy,
	Database,
	Plus,
	Save,
	Shield,
	Sparkles,
	Trash2,
	X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const App = () => {
	const [operation, setOperation] = useState('listRule')
	const [authenticated, setAuthenticated] = useState(false)
	const [ownerField, setOwnerField] = useState('')
	const [lockFields, setLockFields] = useState<string[]>([])
	const [authMatchField, setAuthMatchField] = useState('')
	const [extra, setExtra] = useState('')
	const [abacConditions, setAbacConditions] = useState<
		{
			json: string
			key: string
			val: string
			operator: string
		}[]
	>([])
	const [preset, setPreset] = useState('')
	const [copied, setCopied] = useState(false)
	const [savedPresets, setSavedPresets] = useState<Preset[]>([])
	const [showSaveDialog, setShowSaveDialog] = useState(false)
	const [newPresetName, setNewPresetName] = useState('')

	type ABACCondition = {
		json: string
		key: string
		val: string
		operator: string
	}
	type ScenarioConfig = {
		authenticated?: boolean
		ownerField?: string
		lockFields?: string[]
		authMatchField?: string
		extra?: string
		abacConditions?: ABACCondition[]
	}
	type Scenario = {
		name: string
		description: string
		config: ScenarioConfig
	}
	type Operation = 'listRule' | 'viewRule' | 'createRule' | 'updateRule' | 'deleteRule'
	type ScenariosType = Record<Operation, Scenario[]>

	const [scenarios, setScenarios] = useState<ScenariosType>({} as ScenariosType)
	const [scenariosLoaded, setScenariosLoaded] = useState(false)

	const isReadOperation = ['listRule', 'viewRule'].includes(operation)
	const isWriteOperation = ['createRule', 'updateRule'].includes(operation)

	interface OperationConfig {
		label: string
		icon: React.ElementType
		color: string
	}

	const operationConfig: Record<Operation, OperationConfig> = {
		listRule: { label: 'List Records', icon: Database, color: 'from-blue-500 to-cyan-500' },
		viewRule: { label: 'View Record', icon: Shield, color: 'from-green-500 to-emerald-500' },
		createRule: { label: 'Create Record', icon: Plus, color: 'from-purple-500 to-violet-500' },
		updateRule: { label: 'Update Record', icon: Code2, color: 'from-orange-500 to-red-500' },
		deleteRule: { label: 'Delete Record', icon: Trash2, color: 'from-red-500 to-pink-500' },
	}

	// Load scenarios from external JSON file
	useEffect(() => {
		const loadScenarios = async () => {
			try {
				const response = await fetch('/scenarios.json')
				if (!response.ok) throw new Error('Failed to load scenarios.json')
				const data = await response.json()
				setScenarios(data)
				setScenariosLoaded(true)
			} catch (e) {
				console.error('Failed to load scenarios.json', e)
			}
		}
		loadScenarios()
	}, [])

	interface Preset {
		id: string
		name: string
		operation: Operation
		config: ScenarioConfig
		createdAt: string
	}

	// Helper to trim spaces and newlines from both ends
	const trimField = (val: string) => val.replace(/^\s+|\s+$/g, '')

	// Load saved presets from localStorage on component mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem('pocketbase-presets')
			if (stored) {
				const parsed = JSON.parse(stored)
				if (Array.isArray(parsed) && parsed.length > 0) setSavedPresets(parsed)
			}
		} catch (e) {
			console.error('Failed to load presets from localStorage', e)
		}
	}, [])

	// Save presets to localStorage whenever savedPresets changes
	useEffect(() => {
		try {
			localStorage.setItem('pocketbase-presets', JSON.stringify(savedPresets))
		} catch (e) {
			console.error('Failed to save presets to localStorage', e)
		}
	}, [savedPresets])

	const resetConfig = () => {
		setAuthenticated(false)
		setOwnerField('')
		setLockFields([])
		setAuthMatchField('')
		setExtra('')
		setAbacConditions([])
		setPreset('')
	}

	const handleOperationChange = (newOperation: Operation) => {
		setOperation(newOperation)
		resetConfig()
	}

	const applyScenario = (index: number) => {
		if (!scenariosLoaded) return
		const scenario = scenarios[operation as Operation][index]
		setPreset(`${operation}-scenario-${index}`)
		resetConfig()
		if (scenario && scenario.config) {
			const config = scenario.config
			setAuthenticated(config.authenticated || false)
			setOwnerField(trimField(config.ownerField || ''))
			setLockFields((config.lockFields || []).map((f: string) => trimField(f)))
			setAuthMatchField(trimField(config.authMatchField || ''))
			setExtra(trimField(config.extra || ''))
			setAbacConditions(
				(config.abacConditions || []).map((c: ABACCondition) => ({
					...c,
					json: trimField(c.json || ''),
					key: trimField(c.key || ''),
					val: trimField(c.val || ''),
				}))
			)
		}
	}

	const getCurrentConfig = () => ({
		operation,
		authenticated,
		ownerField: trimField(ownerField),
		lockFields: lockFields.map((f: string) => trimField(f)).filter(Boolean),
		authMatchField: trimField(authMatchField),
		extra: trimField(extra),
		abacConditions: abacConditions.map((c) => ({
			...c,
			json: trimField(c.json || ''),
			key: trimField(c.key || ''),
			val: trimField(c.val || ''),
		})),
	})

	const saveCurrentPreset = () => {
		if (!newPresetName.trim()) return

		const newPreset: Preset = {
			id: Date.now().toString(),
			name: newPresetName.trim(),
			operation: operation as Operation,
			config: getCurrentConfig(),
			createdAt: new Date().toISOString(),
		}

		setSavedPresets((prev) => [...prev, newPreset])
		setNewPresetName('')
		setShowSaveDialog(false)
	}

	const loadPreset = (presetConfig: Preset) => {
		setOperation(presetConfig.operation as Operation)
		setAuthenticated(presetConfig.config.authenticated || false)
		setOwnerField(trimField(presetConfig.config.ownerField || ''))
		setLockFields((presetConfig.config.lockFields || []).map((f: string) => trimField(f)))
		setAuthMatchField(trimField(presetConfig.config.authMatchField || ''))
		setExtra(trimField(presetConfig.config.extra || ''))
		setAbacConditions(
			(presetConfig.config.abacConditions || []).map((c) => ({
				...c,
				json: trimField(c.json || ''),
				key: trimField(c.key || ''),
				val: trimField(c.val || ''),
			}))
		)
		setPreset(`saved-${presetConfig.id}`)
	}

	const deletePreset = (presetId: string) => {
		setSavedPresets((prev) => prev.filter((p) => p.id !== presetId))
		if (preset === `saved-${presetId}`) {
			setPreset('')
		}
	}

	const addABAC = () => {
		setAbacConditions([...abacConditions, { json: '', key: '', val: '', operator: 'and' }])
	}

	const removeABAC = (index: number) => {
		setAbacConditions(abacConditions.filter((_, i) => i !== index))
	}

	const updateABAC = (index: number, field: string, value: string) => {
		const updated = [...abacConditions]
		updated[index][field as keyof (typeof updated)[number]] = trimField(value)
		setAbacConditions(updated)
	}

	const generatedRule = useMemo(() => {
		const parts = []
		if (authenticated) parts.push('@request.auth.id != ""')
		if (isReadOperation && ownerField.trim()) parts.push(`${ownerField} = @request.auth.id`)
		if (isWriteOperation && authMatchField.trim()) parts.push(`@request.data.${authMatchField} = @request.auth.id`)
		lockFields.forEach((f) => {
			if (f.trim()) parts.push(`@request.data.${f}:isset = false`)
		})
		if (extra.trim()) parts.push(`(${extra})`)
		const abacs = abacConditions
			.filter((c) => c.json && c.key && c.val)
			.map((c, index) => {
				const condition = `json_extract(${c.json}, '${c.key}') = ${c.val}`
				if (index === 0) return condition
				return `${c.operator === 'or' ? ' || ' : ' && '}${condition}`
			})
			.join('')
		if (abacs) parts.push(`(${abacs})`)
		return parts.length ? parts.join(' && ') : '// No conditions defined'
	}, [
		authenticated,
		ownerField,
		lockFields,
		authMatchField,
		extra,
		abacConditions,
		isReadOperation,
		isWriteOperation,
	])

	const copyRule = async () => {
		try {
			await navigator.clipboard.writeText(generatedRule)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	const currentOp = operationConfig[operation as Operation]
	const IconComponent = currentOp.icon

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
			<div className='mx-auto max-w-6xl space-y-8  p-4'>
				{/* Header */}
				<div className='text-center space-y-4'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg'>
						<Sparkles className='w-8 h-8 text-white' />
					</div>
					<h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
						PocketBase API Rule Builder
					</h1>
					<p className='text-gray-600 text-lg'>Create powerful access control rules with visual simplicity</p>
				</div>

				{/* Main Card */}
				<div className='bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
					{/* Operation Header */}
					<div className={`bg-gradient-to-r ${currentOp.color} p-6`}>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-4'>
								<div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
									<IconComponent className='w-6 h-6 text-white' />
								</div>
								<div>
									<h2 className='text-2xl font-bold text-white'>{currentOp.label}</h2>
									<p className='text-white/80'>Configure access rules for this operation</p>
								</div>
							</div>
							<div className='flex items-center gap-3'>
								<button
									onClick={() => setShowSaveDialog(true)}
									className='flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200'
								>
									<Save className='w-4 h-4' />
									Save Preset
								</button>
							</div>
						</div>
					</div>

					<div className='p-8 space-y-8'>
						{/* Operation Type */}
						<div className='space-y-3'>
							<label className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
								Operation Type
							</label>
							<div className='relative'>
								<select
									value={operation}
									onChange={(e) => handleOperationChange(e.target.value as Operation)}
									className='w-full appearance-none bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200'
								>
									<option value='listRule'>📋 List Records</option>
									<option value='viewRule'>👁️ View Record</option>
									<option value='createRule'>➕ Create Record</option>
									<option value='updateRule'>✏️ Update Record</option>
									<option value='deleteRule'>🗑️ Delete Record</option>
								</select>
								<ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
							</div>
						</div>

						{/* Saved Presets */}
						{savedPresets.length > 0 && (
							<div className='space-y-4'>
								<div className='flex items-center gap-2'>
									<BookOpen className='w-5 h-5 text-gray-600' />
									<label className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
										Saved Presets
									</label>
								</div>
								<div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
									{savedPresets.map((savedPreset) => (
										<div
											key={savedPreset.id}
											className={`p-4 rounded-xl border-2 transition-all duration-200 ${
												preset === `saved-${savedPreset.id}`
													? 'border-indigo-500 bg-indigo-50 shadow-lg'
													: 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
											}`}
										>
											<div className='flex items-start justify-between mb-2'>
												<div className='font-semibold text-gray-900 text-sm'>
													{savedPreset.name}
												</div>
												<button
													onClick={() => deletePreset(savedPreset.id)}
													className='text-gray-400 hover:text-red-500 transition-colors'
												>
													<X className='w-4 h-4' />
												</button>
											</div>
											<div className='text-xs text-gray-500 mb-3'>
												{operationConfig[savedPreset.operation]?.label || savedPreset.operation}
											</div>
											<button
												onClick={() => loadPreset(savedPreset)}
												className={`w-full text-xs py-2 px-3 rounded-lg transition-colors ${
													preset === `saved-${savedPreset.id}`
														? 'bg-indigo-500 text-white'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												{preset === `saved-${savedPreset.id}` ? '✓ Applied' : 'Load Preset'}
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Quick Settings */}
						<div className='grid gap-6 lg:grid-cols-2'>
							{/* Authentication */}
							<div className='space-y-4'>
								<div className='bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200'>
									<label className='flex items-center gap-3 cursor-pointer'>
										<div className='relative'>
											<input
												type='checkbox'
												checked={authenticated}
												onChange={(e) => setAuthenticated(e.target.checked)}
												className='sr-only'
											/>
											<div
												className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
													authenticated
														? 'bg-emerald-500 border-emerald-500'
														: 'border-gray-300 bg-white'
												}`}
											>
												{authenticated && (
													<Check className='w-4 h-4 text-white absolute top-1 left-1' />
												)}
											</div>
										</div>
										<div>
											<span className='font-semibold text-gray-900'>Require Authentication</span>
											<p className='text-sm text-gray-600 mt-1'>@request.auth.id != ""</p>
										</div>
									</label>
								</div>

								{/* Owner Field for Read Operations */}
								{isReadOperation && (
									<div className='space-y-3'>
										<label className='text-sm font-semibold text-gray-700'>
											Match DB value to auth
										</label>
										<input
											type='text'
											value={ownerField}
											onChange={(e) => setOwnerField(trimField(e.target.value))}
											placeholder='e.g. author'
											className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200'
										/>
										<p className='text-sm text-gray-500'>
											Used for GET operations. Ensures user can only read their own records.
										</p>
									</div>
								)}

								{/* Auth Match Field for Write Operations */}
								{isWriteOperation && (
									<div className='space-y-3'>
										<label className='text-sm font-semibold text-gray-700'>
											Match payload value to auth
										</label>
										<input
											type='text'
											value={authMatchField}
											onChange={(e) => setAuthMatchField(trimField(e.target.value))}
											placeholder='e.g. author'
											className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200'
										/>
										<p className='text-sm text-gray-500'>
											Used for POST/PUT. Ensures user is submitting their own ID.
										</p>
									</div>
								)}
							</div>

							{/* Additional Fields */}
							<div className='space-y-4'>
								<div className='space-y-3'>
									<label className='text-sm font-semibold text-gray-700'>Prevent Overwrite</label>
									<input
										type='text'
										value={lockFields.join(', ')}
										onChange={(e) =>
											setLockFields(
												e.target.value
													.split(',')
													.map((f: string) => trimField(f))
													.filter(Boolean)
											)
										}
										placeholder='e.g. role, status, created_at'
										className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200'
									/>
									<p className='text-sm text-gray-500'>@request.data.role:isset = false</p>
								</div>

								<div className='space-y-3'>
									<label className='text-sm font-semibold text-gray-700'>
										Extra Custom Condition
									</label>
									<textarea
										value={extra}
										onChange={(e) => setExtra(trimField(e.target.value))}
										placeholder="e.g. status = 'active'"
										rows={3}
										className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 resize-none'
									/>
								</div>
							</div>
						</div>

						{/* ABAC Section */}
						<div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200'>
							<div className='space-y-6'>
								<div>
									<h3 className='text-lg font-bold text-gray-900 mb-2'>ABAC Conditions</h3>
									<p className='text-gray-600 text-sm'>
										Attribute-based access control with chainable AND/OR logic
									</p>
								</div>

								<div className='space-y-4'>
									{abacConditions.map((abac, i) => (
										<div key={i} className='space-y-3'>
											{i > 0 && (
												<div className='flex items-center justify-center'>
													<div className='flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-purple-200 shadow-sm'>
														<label className='flex items-center gap-2 cursor-pointer'>
															<input
																type='radio'
																name={`operator-${i}`}
																value='and'
																checked={abac.operator === 'and'}
																onChange={(e) =>
																	updateABAC(i, 'operator', e.target.value)
																}
																className='w-3 h-3 text-purple-600'
															/>
															<span className='text-sm font-medium text-gray-700'>
																AND
															</span>
														</label>
														<label className='flex items-center gap-2 cursor-pointer'>
															<input
																type='radio'
																name={`operator-${i}`}
																value='or'
																checked={abac.operator === 'or'}
																onChange={(e) =>
																	updateABAC(i, 'operator', e.target.value)
																}
																className='w-3 h-3 text-purple-600'
															/>
															<span className='text-sm font-medium text-gray-700'>
																OR
															</span>
														</label>
													</div>
												</div>
											)}
											<div className='grid gap-3 lg:grid-cols-4 p-4 bg-white rounded-xl border border-purple-200'>
												<input
													type='text'
													value={abac.json}
													onChange={(e) => updateABAC(i, 'json', trimField(e.target.value))}
													placeholder='JSON field'
													className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
												/>
												<input
													type='text'
													value={abac.key}
													onChange={(e) => updateABAC(i, 'key', trimField(e.target.value))}
													placeholder='Key path ($.key)'
													className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
												/>
												<input
													type='text'
													value={abac.val}
													onChange={(e) => updateABAC(i, 'val', trimField(e.target.value))}
													placeholder='Expected value'
													className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
												/>
												<button
													onClick={() => removeABAC(i)}
													className='flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
												>
													<Trash2 className='w-4 h-4' />
												</button>
											</div>
										</div>
									))}
								</div>

								<button
									onClick={addABAC}
									className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl'
								>
									<Plus className='w-4 h-4' />
									Add ABAC Condition
								</button>
							</div>
						</div>

						{/* Real-World Scenarios */}
						<div className='space-y-4'>
							<div>
								<label className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
									Examples for {currentOp.label}
								</label>
								<p className='text-gray-600 text-sm mt-1'>
									Load a realistic example for this operation type
								</p>
							</div>
							<div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
								{scenarios[operation as Operation]?.map((scenario: Scenario, idx: number) => (
									<button
										key={idx}
										onClick={() => applyScenario(idx)}
										className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
											preset === `${operation}-scenario-${idx}`
												? 'border-indigo-500 bg-indigo-50 shadow-lg'
												: 'border-gray-200 bg-white hover:border-indigo-300'
										}`}
									>
										<div className='font-semibold text-gray-900 mb-2'>{scenario.name}</div>
										<div className='text-sm text-gray-600 mb-3'>{scenario.description}</div>
										{preset === `${operation}-scenario-${idx}` ? (
											<div className='text-xs text-indigo-600 font-medium'>✓ Applied</div>
										) : (
											<div className='text-xs text-gray-500'>Click to apply example</div>
										)}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='text-center text-gray-500 text-sm'>
					<p>
						Built with ❤️ by{' '}
						<a href='https://github.com/kerimovok' target='_blank' className='text-indigo-500'>
							Orkhan Karimov
						</a>
					</p>
				</div>
			</div>

			{/* Sticky Generated Rule */}
			<div className='sticky left-0 right-0 bottom-0 z-50 bg-white/90 p-2 flex flex-col gap-2 border-t border-indigo-200'>
				<div className='flex items-center justify-between'>
					<label className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
						Generated Rule
					</label>
					<button
						onClick={copyRule}
						className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 ${
							copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						{copied ? <Check className='w-4 h-4' /> : <Copy className='w-4 h-4' />}
						{copied ? 'Copied!' : 'Copy'}
					</button>
				</div>
				<pre className='bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto leading-relaxed'>
					{generatedRule}
				</pre>
			</div>

			{/* Save Preset Dialog */}
			{showSaveDialog && (
				<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'>
					<div className='bg-white rounded-2xl p-6 w-full max-w-md'>
						<h3 className='text-lg font-bold text-gray-900 mb-4'>Save Current Configuration</h3>
						<div className='space-y-4'>
							<div>
								<label className='text-sm font-semibold text-gray-700'>Preset Name</label>
								<input
									type='text'
									value={newPresetName}
									onChange={(e) => setNewPresetName(e.target.value)}
									placeholder='e.g. My Custom Rule'
									className='w-full mt-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200'
									onKeyPress={(e) => e.key === 'Enter' && saveCurrentPreset()}
								/>
							</div>
							<div className='flex gap-3 pt-4'>
								<button
									onClick={() => setShowSaveDialog(false)}
									className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
								>
									Cancel
								</button>
								<button
									onClick={saveCurrentPreset}
									disabled={!newPresetName.trim()}
									className='flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
								>
									Save Preset
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
