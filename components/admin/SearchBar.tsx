'use client'

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  placeholder?: string
  searchParam?: string
}

export function SearchBar({ placeholder = 'Search...', searchParam = 'search' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get(searchParam) || '')

  useEffect(() => {
    setSearchValue(searchParams.get(searchParam) || '')
  }, [searchParams, searchParam])

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set(searchParam, value.trim())
      params.set('page', '1') // Reset to first page on new search
    } else {
      params.delete(searchParam)
    }
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setSearchValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete(searchParam)
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(searchValue)
          }
        }}
        onBlur={() => handleSearch(searchValue)}
        className="pl-10 pr-10"
      />
      {searchValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}


