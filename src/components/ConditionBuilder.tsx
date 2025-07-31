import { ChevronDown, ChevronRight, Edit3, GripVertical, Parentheses, Plus, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Condition, ConditionGroup, GroupedConditions } from '../types'
import { Button } from './ui/button'

const CUSTOM_OPERATORS = [
	{ value: '=', label: '= (Equal)' },
	{ value: '!=', label: '!= (Not equal)' },
	{ value: '>', label: '> (Greater than)' },
	{ value: '>=', label: '>= (Greater than or equal)' },
	{ value: '<', label: '< (Less than)' },
	{ value: '<=', label: '<= (Less than or equal)' },
	{ value: '~', label: '~ (Like/Contains)' },
	{ value: '!~', label: '!~ (Not Like/Contains)' },
	{ value: '?=', label: '?= (Any Equal)' },
	{ value: '?!=', label: '?!= (Any Not equal)' },
	{ value: '?>', label: '?> (Any Greater than)' },
	{ value: '?>=', label: '?>= (Any Greater than or equal)' },
	{ value: '?<', label: '?< (Any Less than)' },
	{ value: '?<=', label: '?<= (Any Less than or equal)' },
	{ value: '?~', label: '?~ (Any Like/Contains)' },
	{ value: '?!~', label: '?!~ (Any Not Like/Contains)' },
]

interface ConditionBuilderProps {
	title: string
	isAbac?: boolean
	groupedConditions: GroupedConditions
	addRuleGroup: (name?: string) => void
	removeRuleGroup: (groupId: string) => void
	updateRuleGroup: (groupId: string, updates: Partial<ConditionGroup>) => void
	addConditionToGroup: (groupId: string) => void
	removeConditionFromGroup: (groupId: string, conditionId: string) => void
	updateConditionInGroup: (groupId: string, conditionId: string, updates: Partial<Condition>) => void
	operand1Placeholder: string
	operand2Placeholder: string
	operand3Placeholder?: string
}

export const ConditionBuilder = ({
	title,
	isAbac = false,
	groupedConditions,
	addRuleGroup,
	removeRuleGroup,
	updateRuleGroup,
	addConditionToGroup,
	removeConditionFromGroup,
	updateConditionInGroup,
	operand1Placeholder,
	operand2Placeholder,
	operand3Placeholder,
}: ConditionBuilderProps) => {
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
	const [editingGroupName, setEditingGroupName] = useState<string | null>(null)
	const [editingGroupValue, setEditingGroupValue] = useState('')

	const toggleGroup = (groupId: string) => {
		const newCollapsed = new Set(collapsedGroups)
		if (newCollapsed.has(groupId)) {
			newCollapsed.delete(groupId)
		} else {
			newCollapsed.add(groupId)
		}
		setCollapsedGroups(newCollapsed)
	}

	const startEditingGroupName = (groupId: string, currentName: string) => {
		setEditingGroupName(groupId)
		setEditingGroupValue(currentName)
	}

	const saveGroupName = (groupId: string) => {
		if (editingGroupValue.trim()) {
			updateRuleGroup(groupId, { name: editingGroupValue.trim() })
		}
		setEditingGroupName(null)
		setEditingGroupValue('')
	}

	const cancelEditingGroupName = () => {
		setEditingGroupName(null)
		setEditingGroupValue('')
	}

	const handleAddConditionToGroup = (groupId: string) => {
		addConditionToGroup(groupId)
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-2'>
						<h3 className='text-lg font-semibold'>{title}</h3>
						{isAbac && <span className='text-xs font-mono px-2 py-1 rounded'>EXPERIMENTAL</span>}
					</div>
					<span className='text-xs px-2 py-1 rounded-full'>{groupedConditions.groups.length} Groups</span>
				</div>
				<Button onClick={() => addRuleGroup()} className='flex items-center gap-2' variant='outline' size='sm'>
					<Parentheses size={16} />
					Add Group
				</Button>
			</div>

			{groupedConditions.groups.length === 0 ? (
				<div className='text-center py-12'>
					<div className='flex items-center justify-center mb-4'>
						{isAbac ? (
							<Shield size={48} className='mx-auto' />
						) : (
							<Parentheses size={48} className='mx-auto' />
						)}
					</div>
					<p className='text-lg font-medium mb-2'>
						{isAbac ? 'No ABAC groups yet' : 'No condition groups yet'}
					</p>
					<p className='text-sm'>
						Create groups to organize your {isAbac ? 'attribute-based' : ''} conditions with flexible
						logical operators
					</p>
				</div>
			) : (
				<div className='space-y-4'>
					{groupedConditions.groups.map((group, groupIndex) => (
						<div key={group.id}>
							{/* Group Logic Operator */}
							{groupIndex > 0 && (
								<div className='flex justify-center py-2'>
									<div className='flex items-center gap-2 px-3 py-1 rounded-full border'>
										<select
											value={groupedConditions.groups[groupIndex - 1].logic}
											onChange={(e) =>
												updateRuleGroup(groupedConditions.groups[groupIndex - 1].id, {
													logic: e.target.value as 'and' | 'or',
												})
											}
											className='bg-transparent border-none outline-none text-sm font-medium'
										>
											<option value='and'>AND</option>
											<option value='or'>OR</option>
										</select>
									</div>
								</div>
							)}

							{/* Group Container */}
							<div className='border rounded-lg overflow-hidden shadow-sm'>
								{/* Group Header */}
								<div className='px-4 py-3 flex items-center justify-between border-b'>
									<div className='flex items-center gap-3'>
										<button
											onClick={() => toggleGroup(group.id)}
											className='p-1 hover:opacity-75 rounded transition-colors'
										>
											{collapsedGroups.has(group.id) ? (
												<ChevronRight size={16} />
											) : (
												<ChevronDown size={16} />
											)}
										</button>

										<div className='flex items-center gap-2'>
											<Parentheses size={18} />
											{isAbac && <Shield size={16} />}
										</div>

										{editingGroupName === group.id ? (
											<div className='flex items-center gap-2'>
												<input
													type='text'
													value={editingGroupValue}
													onChange={(e) => setEditingGroupValue(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === 'Enter') saveGroupName(group.id)
														if (e.key === 'Escape') cancelEditingGroupName()
													}}
													className='px-2 py-1 border rounded text-sm'
													autoFocus
												/>
												<Button
													onClick={() => saveGroupName(group.id)}
													size='sm'
													variant='outline'
												>
													Save
												</Button>
												<Button onClick={cancelEditingGroupName} size='sm' variant='outline'>
													Cancel
												</Button>
											</div>
										) : (
											<div className='flex items-center gap-2'>
												<h4 className='font-medium'>{group.name}</h4>
												<button
													onClick={() => startEditingGroupName(group.id, group.name)}
													className='p-1 hover:opacity-75 rounded transition-colors'
												>
													<Edit3 size={14} />
												</button>
											</div>
										)}

										<span className='text-xs px-2 py-1 rounded'>
											{group.conditions.length} conditions
										</span>
									</div>

									<div className='flex items-center gap-2'>
										<Button
											onClick={() => removeRuleGroup(group.id)}
											variant='destructive'
											size='sm'
										>
											<Trash2 size={14} />
										</Button>
									</div>
								</div>

								{/* Group Content */}
								{!collapsedGroups.has(group.id) && (
									<div className='p-4'>
										{group.conditions.length === 0 ? (
											<div className='text-center py-8'>
												<p className='text-sm mb-3'>No conditions in this group</p>
												<Button
													onClick={() => handleAddConditionToGroup(group.id)}
													variant='outline'
													size='sm'
												>
													<Plus size={16} />
													Add First Condition
												</Button>
											</div>
										) : (
											<div className='space-y-3'>
												{group.conditions.map((condition, condIndex) => (
													<div key={condition.id} className='space-y-2'>
														{/* Condition */}
														<div className='flex items-center gap-2 p-3 border rounded'>
															<GripVertical size={16} />

															<input
																type='text'
																value={condition.operand1}
																onChange={(e) =>
																	updateConditionInGroup(group.id, condition.id, {
																		operand1: e.target.value,
																	})
																}
																placeholder={operand1Placeholder}
																className='flex-1 px-3 py-2 border rounded text-sm'
															/>

															{isAbac ? (
																<></>
															) : (
																<select
																	value={condition.operator}
																	onChange={(e) =>
																		updateConditionInGroup(group.id, condition.id, {
																			operator: e.target.value,
																		})
																	}
																	className='px-3 py-2 border rounded text-sm bg-background'
																>
																	{CUSTOM_OPERATORS.map((op) => (
																		<option key={op.value} value={op.value}>
																			{op.label}
																		</option>
																	))}
																</select>
															)}

															<input
																type='text'
																value={condition.operand2}
																onChange={(e) =>
																	updateConditionInGroup(group.id, condition.id, {
																		operand2: e.target.value,
																	})
																}
																placeholder={operand2Placeholder}
																className='flex-1 px-3 py-2 border rounded text-sm'
															/>

															{isAbac && operand3Placeholder && (
																<input
																	type='text'
																	value={condition.operand3}
																	onChange={(e) =>
																		updateConditionInGroup(group.id, condition.id, {
																			operand3: e.target.value,
																		})
																	}
																	placeholder={operand3Placeholder}
																	className='flex-1 px-3 py-2 border rounded text-sm'
																/>
															)}

															<Button
																onClick={() =>
																	removeConditionFromGroup(group.id, condition.id)
																}
																variant='destructive'
																size='sm'
															>
																<Trash2 size={14} />
															</Button>
														</div>

														{/* Logical Operator (between conditions) */}
														{condIndex < group.conditions.length - 1 && (
															<div className='flex justify-center'>
																<div className='flex items-center gap-2 px-3 py-1 rounded-full border'>
																	<select
																		value={group.internalLogic}
																		onChange={(e) =>
																			updateRuleGroup(group.id, {
																				internalLogic: e.target.value as
																					| 'and'
																					| 'or',
																			})
																		}
																		className='bg-transparent border-none outline-none text-sm font-medium'
																	>
																		<option value='and'>AND</option>
																		<option value='or'>OR</option>
																	</select>
																</div>
															</div>
														)}
													</div>
												))}

												<div className='flex justify-center pt-2'>
													<Button
														onClick={() => handleAddConditionToGroup(group.id)}
														variant='outline'
														size='sm'
													>
														<Plus size={16} />
														Add Condition
													</Button>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
