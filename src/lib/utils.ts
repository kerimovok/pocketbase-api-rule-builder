import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PbSchema, Schemas } from '../types'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const convertPbSchemaToAppSchema = (pbSchema: PbSchema): Schemas => {
	return pbSchema.reduce<Schemas>((acc, collection) => {
		acc[collection.name] = {
			name: collection.name,
			fields: collection.fields.map((field) => ({
				name: field.name,
				type: field.type,
				required: field.required,
				options: field.options,
				description: field.description || '',
			})),
		}
		return acc
	}, {})
}

export type ValidationType = 'pocketbase-schema' | 'generic'

export interface JsonValidationResult<T = unknown> {
	success: boolean
	data?: T
	error?: string
	details?: string
}

export function validateAndParseJson<T = unknown>(
	jsonString: string,
	expectedStructure: ValidationType = 'generic'
): JsonValidationResult<T> {
	// Check if the input is empty
	if (!jsonString?.trim()) {
		return {
			success: false,
			error: 'Empty input',
			details: 'Please provide JSON content to parse.',
		}
	}

	try {
		const parsed = JSON.parse(jsonString)

		// Basic validation for PocketBase schema structure
		if (expectedStructure === 'pocketbase-schema') {
			if (!Array.isArray(parsed)) {
				return {
					success: false,
					error: 'Invalid PocketBase schema format',
					details: 'Expected an array of collections, but got a different data type.',
				}
			}

			// Validate that each item in the array has the expected collection structure
			for (let i = 0; i < parsed.length; i++) {
				const collection = parsed[i]
				if (!collection || typeof collection !== 'object') {
					return {
						success: false,
						error: 'Invalid collection format',
						details: `Collection at index ${i} is not a valid object.`,
					}
				}

				if (!collection.name || typeof collection.name !== 'string') {
					return {
						success: false,
						error: 'Missing collection name',
						details: `Collection at index ${i} is missing a valid name field.`,
					}
				}

				if (!Array.isArray(collection.fields)) {
					return {
						success: false,
						error: 'Invalid fields structure',
						details: `Collection "${collection.name}" must have a fields array.`,
					}
				}
			}
		}

		return {
			success: true,
			data: parsed,
		}
	} catch (error) {
		// Parse the JSON syntax error to provide helpful feedback
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'

		let details = 'Please check your JSON syntax.'

		// Extract line/column information if available
		const syntaxMatch = errorMessage.match(/at position (\d+)|line (\d+)|column (\d+)/i)
		if (syntaxMatch) {
			details = `JSON syntax error ${errorMessage.toLowerCase()}. Please check the formatting around that position.`
		} else if (errorMessage.includes('Unexpected token')) {
			details = `${errorMessage}. Common issues: missing quotes around strings, trailing commas, or unescaped characters.`
		} else if (errorMessage.includes('Unexpected end of JSON input')) {
			details = 'Incomplete JSON. Make sure all brackets and braces are properly closed.'
		}

		return {
			success: false,
			error: 'JSON Parsing Error',
			details,
		}
	}
}
