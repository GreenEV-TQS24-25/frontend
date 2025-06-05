'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'

interface PageHeaderProps {
  title: string
  backUrl: string
  showEditButton?: boolean
  editUrl?: string
}

export function PageHeader({ title, backUrl, showEditButton, editUrl }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between m-4">
      <div className="flex items-center">
        <Link href={backUrl}>
          <Button variant="outline" className="mr-1 hover:bg-gray-100">
            <ArrowLeft />
          </Button>
        </Link>
        {showEditButton && editUrl && (
          <Link href={editUrl}>
            <Button variant="outline" className="mr-2">
              <Pencil />
            </Button>
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
    </div>
  )
} 