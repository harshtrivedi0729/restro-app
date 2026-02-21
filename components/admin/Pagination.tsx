'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  pageParam?: string // For custom page parameter names (e.g., 'restaurantPage', 'dishPage')
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, pageParam = 'page' }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(pageParam, page.toString())
    router.push(`?${params.toString()}`)
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-700 hover:bg-gray-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => updatePage(pageNum)}
                className={
                  currentPage === pageNum
                    ? 'bg-primary text-black'
                    : 'border-gray-700 hover:bg-gray-800'
                }
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-700 hover:bg-gray-800"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

