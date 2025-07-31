import Editor from '@monaco-editor/react'
import { Check, Copy, Save } from 'lucide-react'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import { Button } from './ui/button'

interface GeneratedRuleProps {
	onSavePreset: () => void
}

export const GeneratedRule = ({ onSavePreset }: GeneratedRuleProps) => {
	const { ruleContent, setRuleContent, copied, setCopied } = useRuleBuilderStore()
	// const monaco = useMonaco()

	// useEffect(() => {
	// 	if (monaco) {
	// 		const disposable = setupAutocomplete(monaco, () => useRuleBuilderStore.getState())
	// 		return () => disposable.dispose()
	// 	}
	// }, [monaco])

	const copyRule = async () => {
		try {
			await navigator.clipboard.writeText(ruleContent)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy text: ', err)
		}
	}

	return (
		<div className='flex flex-col rounded-xl flex-grow'>
			<div className='flex flex-col flex-grow'>
				<div className='flex items-center gap-2 mb-4'>
					<Button onClick={copyRule} variant={copied ? 'default' : 'secondary'}>
						{copied ? <Check size={16} /> : <Copy size={16} />}
						{copied ? 'Copied!' : 'Copy Rule'}
					</Button>
					<Button onClick={onSavePreset}>
						<Save size={16} />
						Save as Preset
					</Button>
				</div>
				<div className='flex-grow min-h-24 rounded-md relative'>
					<Editor
						height='100%'
						defaultLanguage='plaintext'
						value={ruleContent}
						theme='vs-dark'
						onChange={(value) => setRuleContent(value ?? '')}
						options={{
							padding: { top: 10, bottom: 10 },
							readOnly: true,
							minimap: { enabled: false },
							scrollbar: { vertical: 'auto' },
							wordWrap: 'on',
							lineNumbers: 'off',
							glyphMargin: false,
							folding: false,
							lineDecorationsWidth: 0,
							lineNumbersMinChars: 0,
							selectOnLineNumbers: false,
							overviewRulerBorder: false,
							renderLineHighlight: 'none',
							cursorStyle: 'line-thin',
							// Autocomplete configuration
							// suggest: {
							// 	showIcons: true,
							// 	showMethods: true,
							// 	showProperties: true,
							// 	showFields: true,
							// 	showValues: true,
							// 	showKeywords: true,
							// 	showModules: true,
							// 	showInterfaces: true,
							// 	filterGraceful: true,
							// 	snippetsPreventQuickSuggestions: false,
							// },
							// quickSuggestions: {
							// 	other: true,
							// 	strings: true,
							// 	comments: true,
							// },
							// acceptSuggestionOnCommitCharacter: true,
							// acceptSuggestionOnEnter: 'on',
							// suggestOnTriggerCharacters: true,
							// tabCompletion: 'on',
							// wordBasedSuggestions: 'off',
							// parameterHints: {
							// 	enabled: true,
							// },
						}}
					/>
				</div>
			</div>
		</div>
	)
}
