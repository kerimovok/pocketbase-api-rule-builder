import { validateAndParseJson, type ValidationType } from '@/lib/utils'
import { useCallback, useState } from 'react'

interface ValidationResult {
	error?: string
	details?: string
}

export const useValidateJson = (validationType: ValidationType) => {
	const [validationResult, setValidationResult] = useState<ValidationResult>({})
	const [isValid, setIsValid] = useState(false)

	const validate = useCallback(
		(jsonString: string) => {
			if (!jsonString.trim()) {
				setValidationResult({})
				setIsValid(false)
				return
			}

			const result = validateAndParseJson(jsonString.trim(), validationType)
			setValidationResult({
				error: result.success ? undefined : result.error,
				details: result.success ? undefined : result.details,
			})
			setIsValid(result.success)
		},
		[validationType]
	)

	const reset = useCallback(() => {
		setValidationResult({})
		setIsValid(false)
	}, [])

	return { validationResult, isValid, validate, reset }
}
