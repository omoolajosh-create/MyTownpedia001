import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchFilters } from '@/hooks/useSearch'

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  loading?: boolean
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [query, setQuery] = useState('')
  const [storyType, setStoryType] = useState<string>()
  const [activeFilters, setActiveFilters] = useState(0)

  const handleSearch = () => {
    const filters: SearchFilters = {
      query,
      ...(storyType && { storyType }),
    }
    
    const filterCount = (query ? 1 : 0) + (storyType ? 1 : 0)
    setActiveFilters(filterCount)
    
    onSearch(filters)
  }

  const clearFilters = () => {
    setQuery('')
    setStoryType(undefined)
    setActiveFilters(0)
    onSearch({ query: '' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories, towns, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Story Type</Label>
                <Select value={storyType} onValueChange={setStoryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oral_history">Oral History</SelectItem>
                    <SelectItem value="tradition">Tradition</SelectItem>
                    <SelectItem value="legend">Legend</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="personal">Personal Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>

        {activeFilters > 0 && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}