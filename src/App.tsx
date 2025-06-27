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
import {useEffect, useMemo, useState} from 'react'

const App = () => {
    // Main state variables
    const [operation, setOperation] = useState('listRule')
    const [authenticated, setAuthenticated] = useState(false)
    const [ownerField, setOwnerField] = useState('')
    const [lockFields, setLockFields] = useState<string[]>([])
    const [authMatchField, setAuthMatchField] = useState('')
    const [customConditions, setCustomConditions] = useState<CustomCondition[]>([])
    const [abacConditions, setAbacConditions] = useState<ABACCondition[]>([])
    const [preset, setPreset] = useState('')
    const [copied, setCopied] = useState(false)
    const [savedPresets, setSavedPresets] = useState<Preset[]>([])
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [newPresetName, setNewPresetName] = useState('')
    const [scenarios, setScenarios] = useState<ScenariosType>({} as ScenariosType)
    const [scenariosLoaded, setScenariosLoaded] = useState(false)


    // Type definitions
    type CustomCondition = {
        operand1: string
        operator: string
        operand2: string
        logic: 'and' | 'or'
    }

    type ABACCondition = {
        json: string
        key: string
        val: string
        operator: 'and' | 'or'
    }

    type ScenarioConfig = {
        authenticated?: boolean
        ownerField?: string
        lockFields?: string[]
        authMatchField?: string
        customConditions?: CustomCondition[]
        abacConditions?: ABACCondition[]
    }

    type Scenario = {
        name: string
        description: string
        config: ScenarioConfig
    }

    type Operation = 'listRule' | 'viewRule' | 'createRule' | 'updateRule' | 'deleteRule'

    type ScenariosType = Record<Operation, Scenario[]>

    interface OperationConfig {
        label: string
        icon: React.ElementType
        color: string
    }

    interface Preset {
        id: string
        name: string
        operation: Operation
        config: ScenarioConfig
        createdAt: string
    }


    const isReadOperation = ['listRule', 'viewRule'].includes(operation)
    const isWriteOperation = ['createRule', 'updateRule'].includes(operation)

    const CUSTOM_OPERATORS = [
        {value: '=', label: '= (Equal)'},
        {value: '!=', label: '!= (Not equal)'},
        {value: '>', label: '> (Greater than)'},
        {value: '>=', label: '>= (Greater than or equal)'},
        {value: '<', label: '< (Less than)'},
        {value: '<=', label: '<= (Less than or equal)'},
        {value: '~', label: '~ (Like/Contains)'},
        {value: '!~', label: '!~ (Not Like/Contains)'},
        {value: '?=', label: '?= (Any Equal)'},
        {value: '?!=', label: '?!= (Any Not equal)'},
        {value: '?>', label: '?> (Any Greater than)'},
        {value: '?>=', label: '?>= (Any Greater than or equal)'},
        {value: '?<', label: '?< (Any Less than)'},
        {value: '?<=', label: '?<= (Any Less than or equal)'},
        {value: '?~', label: '?~ (Any Like/Contains)'},
        {value: '?!~', label: '?!~ (Any Not Like/Contains)'},
    ];

    const operationConfig: Record<Operation, OperationConfig> = {
        listRule: {label: 'List Records', icon: Database, color: 'from-blue-500 to-cyan-500'},
        viewRule: {label: 'View Record', icon: Shield, color: 'from-green-500 to-emerald-500'},
        createRule: {label: 'Create Record', icon: Plus, color: 'from-purple-500 to-violet-500'},
        updateRule: {label: 'Update Record', icon: Code2, color: 'from-orange-500 to-red-500'},
        deleteRule: {label: 'Delete Record', icon: Trash2, color: 'from-red-500 to-pink-500'},
    }

    // Load scenarios from external JSON file
    useEffect(() => {
        const loadScenarios = async () => {
            try {
                // Assuming scenarios.json is in the public folder
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

    // Load saved presets from localStorage
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

    // Save presets to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('pocketbase-presets', JSON.stringify(savedPresets))
        } catch (e) {
            console.error('Failed to save presets to localStorage', e)
        }
    }, [savedPresets])

    // Reset configuration to default values
    const resetConfig = () => {
        setAuthenticated(false)
        setOwnerField('')
        setLockFields([])
        setAuthMatchField('')
        setCustomConditions([])
        setAbacConditions([])
        setPreset('')
    }

    // Handle changing the main operation type
    const handleOperationChange = (newOperation: Operation) => {
        setOperation(newOperation)
        resetConfig()
    }

    // Apply a pre-defined scenario
    const applyScenario = (index: number) => {
        if (!scenariosLoaded) return
        const scenario = scenarios[operation as Operation][index]
        setPreset(`${operation}-scenario-${index}`)
        resetConfig()
        if (scenario && scenario.config) {
            const config = scenario.config
            setAuthenticated(config.authenticated || false)
            setOwnerField(config.ownerField || '')
            setLockFields((config.lockFields || []).map((f: string) => f))
            setAuthMatchField(config.authMatchField || '')
            setCustomConditions(config.customConditions || [])
            setAbacConditions(config.abacConditions || [])
        }
    }

    // Get the current configuration state
    const getCurrentConfig = (): ScenarioConfig => ({
        authenticated,
        ownerField,
        lockFields: lockFields.filter(Boolean),
        authMatchField,
        customConditions,
        abacConditions,
    })

    // Save the current settings as a new preset
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

    // Load a saved preset
    const loadPreset = (presetConfig: Preset) => {
        setOperation(presetConfig.operation as Operation)
        const config = presetConfig.config
        setAuthenticated(config.authenticated || false)
        setOwnerField(config.ownerField || '')
        setLockFields((config.lockFields || []).map((f: string) => f))
        setAuthMatchField(config.authMatchField || '')
        setCustomConditions(config.customConditions || [])
        setAbacConditions(config.abacConditions || [])
        setPreset(`saved-${presetConfig.id}`)
    }

    // Delete a saved preset
    const deletePreset = (presetId: string) => {
        setSavedPresets((prev) => prev.filter((p) => p.id !== presetId))
        if (preset === `saved-${presetId}`) {
            resetConfig()
        }
    }

    // Custom Conditions handlers
    const addCustomCondition = () => {
        setCustomConditions([...customConditions, {operand1: '', operator: '=', operand2: '', logic: 'and'}])
    }
    const removeCustomCondition = (index: number) => {
        setCustomConditions(customConditions.filter((_, i) => i !== index))
    }
    const updateCustomCondition = (index: number, field: keyof CustomCondition, value: string) => {
        const updated = [...customConditions]
        updated[index] = {...updated[index], [field]: value}
        setCustomConditions(updated)
    }

    // ABAC Conditions handlers
    const addABAC = () => {
        setAbacConditions([...abacConditions, {json: '', key: '', val: '', operator: 'and'}])
    }
    const removeABAC = (index: number) => {
        setAbacConditions(abacConditions.filter((_, i) => i !== index))
    }
    const updateABAC = (index: number, field: keyof ABACCondition, value: string) => {
        const updated = [...abacConditions]
        updated[index] = {...updated[index], [field]: value}
        setAbacConditions(updated)
    }

    // The core logic for generating the PocketBase rule string
    const generatedRule = useMemo(() => {
        const parts = []

        if (authenticated) parts.push('@request.auth.id != ""')
        if (isReadOperation && ownerField.trim()) parts.push(`${ownerField.trim()} = @request.auth.id`)
        if (isWriteOperation && authMatchField.trim()) parts.push(`@request.body.${authMatchField.trim()} = @request.auth.id`)

        lockFields.forEach((f) => {
            if (f.trim()) parts.push(`@request.body.${f.trim()}:isset = false`)
        })

        // Process Custom Conditions
        if (customConditions.length > 0) {
            const customConditionsString = customConditions
                .filter(c => c.operand1.trim() && c.operand2.trim())
                .map((c, index) => {
                    let finalOperand2 = c.operand2.trim();
                    const needsQuotes = !/^(true|false|null)$/i.test(finalOperand2) && !/^-?\d+(\.\d+)?$/.test(finalOperand2) && !/^@/.test(finalOperand2);

                    if (needsQuotes && !(finalOperand2.startsWith("'") && finalOperand2.endsWith("'")) && !(finalOperand2.startsWith('"') && finalOperand2.endsWith('"'))) {
                        if (['~', '!~', '?~', '?!~'].includes(c.operator)) {
                            finalOperand2 = `'%${finalOperand2}%'`;
                        } else {
                            finalOperand2 = `'${finalOperand2}'`;
                        }
                    } else if ((finalOperand2.startsWith("'") || finalOperand2.startsWith('"')) && ['~', '!~', '?~', '?!~'].includes(c.operator)) {
                        const innerValue = finalOperand2.substring(1, finalOperand2.length - 1);
                        finalOperand2 = `'%${innerValue}%'`;
                    }

                    const expression = `${c.operand1.trim()} ${c.operator} ${finalOperand2}`;
                    return index === 0 ? expression : `${c.logic === 'or' ? '||' : '&&'} ${expression}`;
                })
                .join(' ');

            if (customConditionsString) parts.push(`(${customConditionsString})`);
        }

        // Process ABAC Conditions
        if (abacConditions.length > 0) {
            const groupedAbac = abacConditions
                .filter(c => c.json.trim() && c.key.trim() && c.val.trim())
                .map((c, index) => {
                    let val = c.val.trim();
                    if (!/^(true|false|null)$/i.test(val) && !/^-?\d+(\.\d+)?$/.test(val) && !(val.startsWith('"') && val.endsWith('"')) && !(val.startsWith("'") && val.endsWith("'")) && !val.startsWith('@')) {
                        val = `'${val}'`;
                    }
                    const condition = `json_extract(${c.json.trim()}, '${c.key.trim()}') = ${val}`;
                    return index === 0 ? condition : `${c.operator === 'or' ? '||' : '&&'} ${condition}`;
                })
                .join(' ');

            if (groupedAbac) parts.push(`(${groupedAbac})`);
        }

        return parts.length ? parts.join(' && ') : '// No conditions defined';
    }, [
        authenticated,
        ownerField,
        lockFields,
        authMatchField,
        customConditions,
        abacConditions,
        isReadOperation,
        isWriteOperation,
    ])

    // Copy the generated rule to clipboard
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
        <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 pt-8 pb-16'>
            <div className='mx-auto max-w-6xl space-y-10 p-4'>
                {/* Header */}
                <header className='text-center space-y-6'>
                    <div
                        className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg transform hover:rotate-3 transition-all duration-300'>
                        <Sparkles className='w-10 h-10 text-white animate-pulse-soft'/>
                    </div>
                    <h1 className='text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent'>
                        PocketBase API Rule Builder
                    </h1>
                    <p className='text-gray-600 text-xl max-w-xl mx-auto'>Create powerful access control rules with
                        visual simplicity</p>
                </header>

                {/* Main Card */}
                <main className='glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in'>
                    {/* Operation Header */}
                    <div className={`bg-gradient-to-r ${currentOp.color} p-8 relative overflow-hidden`}>
                        <div className='absolute inset-0 bg-white/10 backdrop-blur-sm'></div>
                        <div className='relative z-10 flex items-center justify-between'>
                            <div className='flex items-center gap-5'>
                                <div className='p-4 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg'>
                                    <IconComponent className='w-7 h-7 text-white'/>
                                </div>
                                <div>
                                    <h2 className='text-3xl font-bold text-white'>{currentOp.label}</h2>
                                    <p className='text-white/80 text-lg'>Configure access rules for this operation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSaveDialog(true)}
                                className='flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 btn-gradient'
                            >
                                <Save className='w-5 h-5'/>
                                Save Preset
                            </button>
                        </div>
                    </div>

                    <div className='p-10 space-y-10'>
                        {/* Operation Type Select */}
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
                                <ChevronDown
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
                            </div>
                        </div>

                        {/* Saved Presets */}
                        {savedPresets.length > 0 && (
                            <section className='space-y-4'>
                                <div className='flex items-center gap-2'>
                                    <BookOpen className='w-5 h-5 text-gray-600'/>
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
                                                    <X className='w-4 h-4'/>
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
                            </section>
                        )}

                        {/* Real-World Scenarios */}
                        <section className='space-y-4'>
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
                                        className={`w-full h-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                                            preset === `${operation}-scenario-${idx}`
                                                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                : 'border-gray-200 bg-white hover:border-indigo-300'
                                        }`}
                                    >
                                        <p className='font-semibold text-gray-900 mb-2'>{scenario.name}</p>
                                        <p className='text-sm text-gray-600 mb-3'>{scenario.description}</p>
                                        {preset === `${operation}-scenario-${idx}` ? (
                                            <div className='text-xs text-indigo-600 font-medium mt-auto'>✓ Applied</div>
                                        ) : (
                                            <div className='text-xs text-gray-500 mt-auto'>Click to apply</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Core Conditions */}
                        <section className='space-y-8'>
                            {/* Authentication & Ownership */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <label
                                    className='flex items-center gap-4 cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 hover-card'>
                                    <div className='relative'>
                                        <input
                                            type='checkbox'
                                            checked={authenticated}
                                            onChange={(e) => setAuthenticated(e.target.checked)}
                                            className='sr-only peer'
                                        />
                                        <div
                                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-300 shadow-sm peer-checked:bg-gradient-to-br peer-checked:from-emerald-500 peer-checked:to-teal-500 peer-checked:border-emerald-400 border-gray-300 bg-white`}></div>
                                        {authenticated && <Check
                                            className='w-5 h-5 text-white absolute top-1.5 left-1.5 animate-fade-in'/>}
                                    </div>
                                    <div>
                                        <span
                                            className='font-semibold text-gray-900 text-lg'>Require Authentication</span>
                                        <p className='text-gray-600 mt-1'>@request.auth.id != ""</p>
                                    </div>
                                </label>

                                {isReadOperation && (
                                    <div className='space-y-2'>
                                        <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                            <div
                                                className='w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full'></div>
                                            Record Owner Field (Read)
                                        </label>
                                        <div className='relative'>
                                            <input type='text' value={ownerField}
                                                   onChange={(e) => setOwnerField(e.target.value)}
                                                   placeholder='author_id'
                                                   className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 input-enhanced'/>
                                            {ownerField && <div
                                                className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-50 px-1 font-mono'>=
                                                @request.auth.id</div>}
                                        </div>
                                    </div>
                                )}

                                {isWriteOperation && (
                                    <div className='space-y-2'>
                                        <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                            <div
                                                className='w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full'></div>
                                            Payload Owner Field (Write)
                                        </label>
                                        <div className='relative'>
                                            <input type='text' value={authMatchField}
                                                   onChange={(e) => setAuthMatchField(e.target.value)}
                                                   placeholder='author_id'
                                                   className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 input-enhanced'/>
                                            {authMatchField && <div
                                                className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-50 px-1 font-mono'>=
                                                @request.auth.id</div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Prevent Overwrite */}
                            <div className='space-y-3'>
                                <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                    <div
                                        className='w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full'></div>
                                    Prevent Field Overwrites (on Update)
                                </label>
                                <div className='flex flex-wrap gap-3 items-center'>
                                    {lockFields.map((field, index) => (
                                        <div key={index} className='flex items-center animate-slide-in'>
                                            <input
                                                type='text'
                                                value={field}
                                                onChange={(e) => {
                                                    const newFields = [...lockFields];
                                                    newFields[index] = e.target.value;
                                                    setLockFields(newFields);
                                                }}
                                                placeholder='role'
                                                className='flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg h-10 px-3 py-2 border-r-0 rounded-r-none text-gray-900 input-enhanced focus:z-10'
                                            />
                                            <button
                                                onClick={() => setLockFields(lockFields.filter((_, i) => i !== index))}
                                                className='flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg rounded-l-none hover:from-red-600 hover:to-red-700 transition-all shadow-sm'
                                            >
                                                <X className='w-4 h-4'/>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setLockFields([...lockFields, ''])}
                                        className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg hover:to-gray-400 transition-all text-sm'
                                    >
                                        <Plus className='w-4 h-4'/>
                                        Add Field
                                    </button>
                                </div>
                                {lockFields.length > 0 && <p className='text-sm text-gray-500'>Generates: <code
                                    className='font-mono bg-gray-200 px-1 rounded text-xs'>@request.body.fieldname:isset
                                    = false</code> for each field.</p>}
                            </div>
                        </section>

                        {/* Custom Conditions Section */}
                        <section
                            className='bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-2xl p-8 border border-blue-200 shadow-sm'>
                            <div className='space-y-6'>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className='text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent'>Custom
                                            Conditions</h3>
                                        <p className='text-gray-600 text-sm'>
                                            General-purpose conditions with chainable AND/OR logic.
                                        </p>
                                    </div>
                                    <div
                                        className="p-2 bg-white/80 rounded-lg text-xs font-mono text-gray-500 border border-blue-100">
                                        operand_1 OPERATOR operand_2
                                    </div>
                                </div>

                                <div className='space-y-6'>
                                    {customConditions.length === 0 && (
                                        <div
                                            className="text-center py-6 bg-white/60 backdrop-blur-sm rounded-xl border border-dashed border-blue-200">
                                            <p className="text-gray-500 mb-2">No custom conditions defined</p>
                                            <p className="text-sm text-gray-400">Add a condition for fine-grained
                                                control</p>
                                        </div>
                                    )}

                                    {customConditions.map((cond, i) => (
                                        <div key={i} className='space-y-3 animate-fade-in'>
                                            {i > 0 && (
                                                <div className='flex items-center justify-center'>
                                                    <div
                                                        className='flex items-center gap-3 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full border border-blue-200 shadow-sm'>
                                                        <label
                                                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full transition-all duration-200 ${cond.logic === 'and' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'bg-transparent text-gray-600'}`}>
                                                            <input type='radio' name={`custom-logic-${i}`} value='and'
                                                                   checked={cond.logic === 'and'}
                                                                   onChange={(e) => updateCustomCondition(i, 'logic', e.target.value)}
                                                                   className='sr-only'/>
                                                            <span className='text-sm font-medium'>AND</span>
                                                        </label>
                                                        <label
                                                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full transition-all duration-200 ${cond.logic === 'or' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'bg-transparent text-gray-600'}`}>
                                                            <input type='radio' name={`custom-logic-${i}`} value='or'
                                                                   checked={cond.logic === 'or'}
                                                                   onChange={(e) => updateCustomCondition(i, 'logic', e.target.value)}
                                                                   className='sr-only'/>
                                                            <span className='text-sm font-medium'>OR</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                className='grid gap-3 lg:grid-cols-[1fr,auto,1fr,auto] items-end p-5 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300'>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-600 font-medium">Operand
                                                        1</label>
                                                    <input type='text' value={cond.operand1}
                                                           onChange={(e) => updateCustomCondition(i, 'operand1', e.target.value)}
                                                           placeholder='status'
                                                           className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm input-enhanced'/>
                                                </div>
                                                <div className="space-y-1">
                                                    <label
                                                        className="text-xs text-gray-600 font-medium">Operator</label>
                                                    <select value={cond.operator}
                                                            onChange={(e) => updateCustomCondition(i, 'operator', e.target.value)}
                                                            className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm appearance-none input-enhanced'>
                                                        {CUSTOM_OPERATORS.map(op => <option key={op.value}
                                                                                            value={op.value}>{op.label}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-600 font-medium">Operand
                                                        2</label>
                                                    <input type='text' value={cond.operand2}
                                                           onChange={(e) => updateCustomCondition(i, 'operand2', e.target.value)}
                                                           placeholder="'active' or 123"
                                                           className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm input-enhanced'/>
                                                </div>
                                                <button onClick={() => removeCustomCondition(i)}
                                                        className='flex items-center justify-center h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm'>
                                                    <Trash2 className='w-4 h-4'/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={addCustomCondition}
                                        className='flex items-center justify-center w-full gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl'>
                                    <Plus className='w-5 h-5'/>
                                    Add Custom Condition
                                </button>
                            </div>
                        </section>

                        {/* ABAC Section */}
                        <section
                            className='bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-sm'>
                            <div className='space-y-6'>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className='text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent'>ABAC
                                            Conditions</h3>
                                        <p className='text-gray-600 text-sm'>
                                            Attribute-based access control with chainable AND/OR logic
                                        </p>
                                    </div>
                                    <div
                                        className="p-2 bg-white/80 rounded-lg text-xs font-mono text-gray-500 border border-purple-100">
                                        json_extract(field, '$.key') = value
                                    </div>
                                </div>

                                <div className='space-y-6'>
                                    {abacConditions.length === 0 && (
                                        <div
                                            className="text-center py-6 bg-white/60 backdrop-blur-sm rounded-xl border border-dashed border-purple-200">
                                            <p className="text-gray-500 mb-2">No ABAC conditions defined</p>
                                            <p className="text-sm text-gray-400">Add a condition to use JSON-based
                                                attribute checks</p>
                                        </div>
                                    )}

                                    {abacConditions.map((abac, i) => (
                                        <div key={i} className='space-y-3 animate-fade-in'>
                                            {i > 0 && (
                                                <div className='flex items-center justify-center'>
                                                    <div
                                                        className='flex items-center gap-3 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full border border-purple-200 shadow-sm'>
                                                        <label
                                                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full transition-all duration-200 ${abac.operator === 'and' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'bg-transparent text-gray-600'}`}>
                                                            <input type='radio' name={`abac-operator-${i}`} value='and'
                                                                   checked={abac.operator === 'and'}
                                                                   onChange={(e) => updateABAC(i, 'operator', e.target.value as 'and' | 'or')}
                                                                   className='sr-only'/>
                                                            <span className='text-sm font-medium'>AND</span>
                                                        </label>
                                                        <label
                                                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full transition-all duration-200 ${abac.operator === 'or' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'bg-transparent text-gray-600'}`}>
                                                            <input type='radio' name={`abac-operator-${i}`} value='or'
                                                                   checked={abac.operator === 'or'}
                                                                   onChange={(e) => updateABAC(i, 'operator', e.target.value as 'and' | 'or')}
                                                                   className='sr-only'/>
                                                            <span className='text-sm font-medium'>OR</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                className='grid gap-3 lg:grid-cols-[2fr,1fr,1fr,auto] items-end p-5 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300'>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-600 font-medium">JSON
                                                        Field</label>
                                                    <input type='text' value={abac.json}
                                                           onChange={(e) => updateABAC(i, 'json', e.target.value)}
                                                           placeholder='@collection.teams.members'
                                                           className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm input-enhanced'/>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-600 font-medium">Key
                                                        Path</label>
                                                    <input type='text' value={abac.key}
                                                           onChange={(e) => updateABAC(i, 'key', e.target.value)}
                                                           placeholder='$.role'
                                                           className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm input-enhanced'/>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-600 font-medium">Expected
                                                        Value</label>
                                                    <input type='text' value={abac.val}
                                                           onChange={(e) => updateABAC(i, 'val', e.target.value)}
                                                           placeholder="'admin'"
                                                           className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm input-enhanced'/>
                                                </div>
                                                <button onClick={() => removeABAC(i)}
                                                        className='flex items-center justify-center h-10 w-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm'>
                                                    <Trash2 className='w-4 h-4'/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={addABAC}
                                        className='flex items-center justify-center w-full gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl'>
                                    <Plus className='w-5 h-5'/>
                                    Add ABAC Condition
                                </button>
                            </div>
                        </section>


                    </div>
                </main>

                {/* Footer */}
                <footer className='text-center text-gray-500 text-sm'>
                    <p>
                        Built with ❤️ by{' '}
                        <a href='https://github.com/kerimovok' target='_blank' rel="noopener noreferrer"
                           className='text-indigo-500'>
                            Orkhan Karimov
                        </a>
                    </p>
                </footer>
            </div>

            {/* Sticky Generated Rule */}
            <div
                className='sticky left-0 right-0 bottom-0 z-50 bg-white/90 backdrop-blur-sm p-4 flex flex-col gap-2 border-t border-indigo-200 shadow-top'>
                <div className='flex items-center justify-between'>
                    <label className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                        Generated Rule
                    </label>
                    <button
                        onClick={copyRule}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                            copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {copied ? <Check className='w-4 h-4'/> : <Copy className='w-4 h-4'/>}
                        {copied ? 'Copied!' : 'Copy Rule'}
                    </button>
                </div>
                <pre
                    className='bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto leading-relaxed'>
					<code>{generatedRule}</code>
				</pre>
            </div>

            {/* Save Preset Dialog */}
            {showSaveDialog && (
                <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in'>
                    <div className='bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-2xl'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4'>Save Current Configuration</h3>
                        <div className='space-y-4'>
                            <div>
                                <label htmlFor="presetName" className='text-sm font-semibold text-gray-700'>Preset
                                    Name</label>
                                <input
                                    id="presetName"
                                    type='text'
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                    placeholder='My Custom Rule'
                                    className='w-full mt-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 input-enhanced'
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
