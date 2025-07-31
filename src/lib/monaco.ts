import type { Monaco } from '@monaco-editor/react'
import type { IDisposable, languages } from 'monaco-editor'
import { useRuleBuilderStore } from '../store/useRuleBuilderStore'
import type { PbCollection } from '../types'

type RuleBuilderStore = ReturnType<typeof useRuleBuilderStore.getState>

const REQUEST_KEYWORDS = ['context', 'method', 'headers', 'query', 'auth', 'body']

// Common HTTP methods
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

// Common request contexts
const REQUEST_CONTEXTS = ['default', 'oauth2', 'otp', 'password', 'realtime', 'protectedFile']

// Common HTTP headers
const COMMON_HEADERS = [
	'accept',
	'accept_encoding',
	'accept_language',
	'authorization',
	'cache_control',
	'content_length',
	'content_type',
	'cookie',
	'host',
	'origin',
	'referer',
	'user_agent',
	'x_forwarded_for',
	'x_forwarded_proto',
	'x_real_ip',
	'x_token',
]

// Common auth fields (based on PocketBase user model)
const AUTH_FIELDS = ['id', 'email', 'username', 'verified', 'emailVisibility', 'created', 'updated']

const getCollection = (collectionName: string, store: RuleBuilderStore): PbCollection | undefined => {
	const db = store.getCurrentDatabase()
	if (!db) return undefined
	return db.schemas.find((s) => s.name === collectionName)
}

const getCollectionById = (collectionId: string, store: RuleBuilderStore): PbCollection | undefined => {
	const db = store.getCurrentDatabase()
	if (!db) return undefined
	return db.schemas.find((s) => s.id === collectionId)
}

const getCollectionFields = (collectionName: string, store: RuleBuilderStore) => {
	const collection = getCollection(collectionName, store)
	return collection?.fields.map((f) => ({ name: f.name, type: f.type, options: f.options })) ?? []
}

const getAllCollectionNames = (store: RuleBuilderStore) => {
	const db = store.getCurrentDatabase()
	if (!db) return []
	return db.schemas.map((s) => s.name)
}

const resolveFieldPath = (
	path: string[],
	startCollectionName: string,
	store: RuleBuilderStore
): { name: string; type: string; options: unknown }[] => {
	let currentCollection = getCollection(startCollectionName, store)

	if (!currentCollection) return []

	// If path is empty, return fields of the start collection
	if (path.length === 0) {
		return getCollectionFields(currentCollection.name, store)
	}

	// Navigate through the path
	for (let i = 0; i < path.length; i++) {
		const fieldName = path[i]
		const fields = getCollectionFields(currentCollection.name, store)
		const field = fields.find((f) => f.name === fieldName)

		if (!field) {
			return [] // Field not found
		}

		if (field.type === 'relation') {
			const options = field.options as { collectionId: string }
			const nextCollection = getCollectionById(options.collectionId, store)
			if (nextCollection) {
				currentCollection = nextCollection
			} else {
				return [] // Dead end - relation points to non-existent collection
			}
		} else {
			// Field is not a relation
			if (i === path.length - 1) {
				// This is the last field in the path and it's not a relation
				// So we can't suggest any subfields
				return []
			} else {
				// Not a relation, but path continues - invalid
				return []
			}
		}
	}

	// If we get here, the path ended with a relation field
	// Return fields of the final collection
	return getCollectionFields(currentCollection.name, store)
}

export function setupAutocomplete(monaco: Monaco, getStore: () => RuleBuilderStore): IDisposable {
	return monaco.languages.registerCompletionItemProvider('plaintext', {
		triggerCharacters: ['@', '.'],
		provideCompletionItems: (model, position) => {
			const store = getStore()
			const textUntilPosition = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: 1,
				endLineNumber: position.lineNumber,
				endColumn: position.column,
			})

			const word = model.getWordUntilPosition(position)
			const range = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			}

			const suggestions: languages.CompletionItem[] = []
			const textBefore = textUntilPosition.substring(0, textUntilPosition.length - word.word.length)

			// @request.context specific values
			if (textBefore.endsWith('@request.context')) {
				suggestions.push(
					...REQUEST_CONTEXTS.map(
						(context) =>
							({
								label: `"${context}"`,
								kind: monaco.languages.CompletionItemKind.Value,
								insertText: `"${context}"`,
								range,
								detail: `Context: ${context}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @request.method specific values
			if (textBefore.endsWith('@request.method')) {
				suggestions.push(
					...HTTP_METHODS.map(
						(method) =>
							({
								label: `"${method}"`,
								kind: monaco.languages.CompletionItemKind.Value,
								insertText: `"${method}"`,
								range,
								detail: `HTTP Method: ${method}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @request.headers.
			if (textBefore.endsWith('@request.headers.')) {
				suggestions.push(
					...COMMON_HEADERS.map(
						(header) =>
							({
								label: header,
								kind: monaco.languages.CompletionItemKind.Property,
								insertText: header,
								range,
								detail: `Header: ${header}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @request.query.
			if (textBefore.endsWith('@request.query.')) {
				// For query parameters, we can suggest some common ones
				const commonQueryParams = ['page', 'limit', 'sort', 'filter', 'expand', 'fields', 'q', 'search']
				suggestions.push(
					...commonQueryParams.map(
						(param) =>
							({
								label: param,
								kind: monaco.languages.CompletionItemKind.Property,
								insertText: param,
								range,
								detail: `Query parameter: ${param}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @request.auth.
			if (textBefore.endsWith('@request.auth.')) {
				suggestions.push(
					...AUTH_FIELDS.map(
						(field) =>
							({
								label: field,
								kind: monaco.languages.CompletionItemKind.Property,
								insertText: field,
								range,
								detail: `Auth field: ${field}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @request.body.
			if (textBefore.endsWith('@request.body.')) {
				// For body parameters, we can suggest fields from the current collection
				const fields = getCollectionFields(store.currentCollection, store)
				suggestions.push(
					...fields.map(
						(field) =>
							({
								label: field.name,
								kind: monaco.languages.CompletionItemKind.Property,
								insertText: field.name,
								range,
								detail: `Body field: ${field.name} (${field.type})`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @request.
			if (textBefore.endsWith('@request.')) {
				suggestions.push(
					...REQUEST_KEYWORDS.map(
						(key) =>
							({
								label: key,
								kind: monaco.languages.CompletionItemKind.Property,
								insertText: key,
								range,
								detail: `Request property: ${key}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @collection.
			const atCollectionMatch = textBefore.match(/@collection\.(\w*)$/)
			if (atCollectionMatch) {
				const collections = getAllCollectionNames(store)
				suggestions.push(
					...collections.map(
						(name) =>
							({
								label: name,
								kind: monaco.languages.CompletionItemKind.Module,
								insertText: name,
								range,
								detail: `Collection: ${name}`,
							} as languages.CompletionItem)
					)
				)
				return { suggestions }
			}

			// @collection.COLLECTION_NAME.FIELD_PATH.
			const collectionFieldMatch = textBefore.match(/@collection\.(\w+)((?:\.\w+)*)\.$/)
			if (collectionFieldMatch) {
				const collectionName = collectionFieldMatch[1]
				const fieldPath = collectionFieldMatch[2]
				const path = fieldPath ? fieldPath.split('.').slice(1) : [] // Remove empty first element

				const resolvedFields = resolveFieldPath(path, collectionName, store)
				suggestions.push(
					...resolvedFields.map(
						(field) =>
							({
								label: field.name,
								kind:
									field.type === 'relation'
										? monaco.languages.CompletionItemKind.Interface
										: monaco.languages.CompletionItemKind.Field,
								insertText: field.name,
								range,
								detail: `${field.name} (${field.type})`,
							} as languages.CompletionItem)
					)
				)
				if (suggestions.length > 0) return { suggestions }
			}

			// Handle @c completion for @collection
			if (textBefore.endsWith('@c')) {
				suggestions.push({
					label: 'collection',
					kind: monaco.languages.CompletionItemKind.Keyword,
					insertText: 'ollection',
					range,
					detail: 'Collection reference',
				})
				return { suggestions }
			}

			// Standard field completion for current collection
			const fieldMatch = textBefore.match(/(\w+(?:\.\w+)*)\.$/)
			if (fieldMatch && !textBefore.includes('@')) {
				const fullPath = fieldMatch[1]
				const path = fullPath.split('.')
				const resolvedFields = resolveFieldPath(path, store.currentCollection, store)
				suggestions.push(
					...resolvedFields.map(
						(field) =>
							({
								label: field.name,
								kind:
									field.type === 'relation'
										? monaco.languages.CompletionItemKind.Interface
										: monaco.languages.CompletionItemKind.Field,
								insertText: field.name,
								range,
								detail: `${field.name} (${field.type})`,
							} as languages.CompletionItem)
					)
				)
				if (suggestions.length > 0) return { suggestions }
			}

			// Keywords (@)
			if (textBefore.endsWith('@')) {
				suggestions.push(
					{
						label: 'request',
						kind: monaco.languages.CompletionItemKind.Keyword,
						insertText: 'request',
						range,
						detail: 'Request data reference',
					},
					{
						label: 'collection',
						kind: monaco.languages.CompletionItemKind.Keyword,
						insertText: 'collection',
						range,
						detail: 'Collection reference',
					}
				)
				return { suggestions }
			}

			// Default: current collection fields
			const fields = getCollectionFields(store.currentCollection, store)
			suggestions.push(
				...fields.map(
					(field) =>
						({
							label: field.name,
							kind:
								field.type === 'relation'
									? monaco.languages.CompletionItemKind.Interface
									: monaco.languages.CompletionItemKind.Field,
							insertText: field.name,
							range,
							detail: `${field.name} (${field.type})`,
						} as languages.CompletionItem)
				)
			)

			// Add unique suggestions
			const uniqueSuggestions = suggestions.filter(
				(s, index, self) => index === self.findIndex((t) => t.label === s.label)
			)

			return { suggestions: uniqueSuggestions }
		},
	})
}
