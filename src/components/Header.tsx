import { BookOpen } from 'lucide-react'
import { Button } from './ui/button'

export const Header = () => {
	return (
		<header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
			<div className='container mx-auto px-4 py-4'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
					<div className='flex items-center gap-3'>
						<img src='/pocketbase.svg' alt='PocketBase Logo' className='h-10 w-10 sm:h-12 sm:w-12' />
						<div className='min-w-0'>
							<h1 className='text-lg sm:text-xl font-bold truncate'>PocketBase Rule Builder</h1>
							<p className='text-sm text-muted-foreground hidden sm:block'>
								Visually construct and test API rules for your collections.
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
						<a
							href='https://pocketbase.io/docs/api-rules-and-filters/'
							target='_blank'
							rel='noopener noreferrer'
							className='w-full sm:w-auto'
						>
							<Button variant='outline' className='w-full sm:w-auto gap-2'>
								<BookOpen size={16} />
								<span className='hidden sm:inline'>API Rules Docs</span>
								<span className='sm:hidden'>Docs</span>
							</Button>
						</a>
					</div>
				</div>
			</div>
		</header>
	)
}
