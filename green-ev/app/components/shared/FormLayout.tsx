'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FormLayoutProps {
  title: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading?: boolean
  cancelUrl: string
  submitText?: string
}

export function FormLayout({ 
  title, 
  children, 
  onSubmit, 
  loading = false, 
  cancelUrl,
  submitText = 'Save Changes'
}: FormLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">{title}</h2>
              {children}
              <div className="flex justify-end gap-4">
                <Link href={cancelUrl}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : submitText}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 