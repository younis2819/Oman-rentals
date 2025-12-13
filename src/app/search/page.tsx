import SearchInterface from '@/components/SearchInterface'
import { getFilteredFleet } from '@/app/actions'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage(props: Props) {
  // 1. Await Params (Next.js 15+)
  const searchParams = await props.searchParams
  
  // 2. Initial Server Fetch (Good for SEO & First Paint)
  // We pass the URL parameters directly to our filter engine
  const initialFleet = await getFilteredFleet({
    category: (searchParams.category as string) || 'car',
    // We now look for 'locId' (the UUID) instead of text names
    locationId: (searchParams.locId as string) || undefined, 
    minPrice: searchParams.min ? Number(searchParams.min) : undefined,
    maxPrice: searchParams.max ? Number(searchParams.max) : undefined,
    startDate: searchParams.start as string,
    endDate: searchParams.end as string,
  })

  // 3. Hand off to Client Component
  return (
    <SearchInterface initialFleet={initialFleet} />
  )
}