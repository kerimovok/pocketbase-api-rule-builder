import { ChevronDown, Database, Plus, Trash2 } from 'lucide-react'
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

interface DatabaseSelectorProps {
	onNewDatabase: () => void
}

export const DatabaseSelector = ({ onNewDatabase }: DatabaseSelectorProps) => {
	const { databases, currentDatabaseId, setCurrentDatabase, deleteDatabase, getCurrentDatabase } =
		useRuleBuilderStore()

	const currentDatabase = getCurrentDatabase()

	if (!currentDatabase && databases.length === 0) {
		return (
			<div className='flex items-center gap-2'>
				<Button onClick={onNewDatabase} variant='outline'>
					<Plus size={16} />
					Create Database
				</Button>
			</div>
		)
	}

	return (
		<div className='flex items-center gap-2'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='outline' className='min-w-[200px] justify-between'>
						<div className='flex items-center gap-2'>
							<Database size={16} />
							<span className='truncate'>{currentDatabase?.name || 'No Database Selected'}</span>
						</div>
						<ChevronDown size={16} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-full'>
					<DropdownMenuLabel>Databases</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{databases.map((database) => (
							<DropdownMenuItem
								key={database.id}
								onSelect={() => setCurrentDatabase(database.id)}
								className={`w-full min-w-max gap-2 flex items-center justify-between p-2 text-sm rounded hover:bg-accent transition-colors ${
									database.id === currentDatabaseId ? 'bg-accent' : ''
								}`}
							>
								<div className='flex items-center gap-2'>
									<Database size={14} />
									<span className='truncate'>{database.name}</span>
								</div>
								<div className='flex items-center gap-1'>
									<Dialog>
										<DialogTrigger asChild>
											<button
												className='p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-colors'
												onClick={(e) => e.stopPropagation()}
											>
												<Trash2 size={12} />
											</button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Delete Database</DialogTitle>
												<DialogDescription>
													Are you sure you want to delete "{database.name}"? This action
													cannot be undone.
												</DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<Button variant='outline'>Cancel</Button>
												<Button
													variant='destructive'
													onClick={() => deleteDatabase(database.id)}
												>
													Delete Database
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={onNewDatabase}>
						<Plus size={14} className='mr-2' />
						Create New Database
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
