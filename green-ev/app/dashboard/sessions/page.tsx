'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { sessionApi } from '@/lib/api'
import { Session } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Car, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { PaymentModal } from '@/components/PaymentModal'

export default function SessionsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    if (user?.role === 'USER') {
      fetchSessions()
    }
  }, [user?.role])

  const fetchSessions = async () => {
    try {
      const userSessions = await sessionApi.getAll()
      setSessions(userSessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSession = async (sessionId: number) => {
    try {
      await sessionApi.delete(sessionId)
      router.push('/dashboard')
      toast.success('Session cancelled successfully')
      fetchSessions()
    } catch (error) {
      console.error('Error cancelling session:', error)
      toast.error('Failed to cancel session')
    }
  }

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully')
    fetchSessions()
  }

  const handlePaymentError = (error: Error) => {
    toast.error(`Payment failed: ${error.message}`)
  }

  const openPaymentModal = (sessionId: number) => {
    setSelectedSessionId(sessionId)
    setIsPaymentModalOpen(true)
  }

  if (!user || user.role !== 'USER') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">You don&apos;t have permission to view sessions.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title="My Sessions"
        backUrl="/dashboard"
      />

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-gray-500" />
                    <h3 className="font-medium">
                      {format(new Date(session.startTime), 'PPp')}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.floor((session.duration || 0) / 60)} min
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{session.chargingSpot?.station?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    <span>{session.vehicle?.brand} {session.vehicle?.model}</span>
                  </div>
                  {session.totalCost && (
                    <p>Total Cost: {session.totalCost.toFixed(2)} €</p>
                  )}
                  {session.paymentStatus && (
                    <p className="font-medium">
                      Payment Status: {session.paymentStatus}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {session.paymentStatus !== 'PAID' && session.totalCost && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => session.id && openPaymentModal(session.id)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => session.id && handleCancelSession(session.id)}
                  >
                    Cancel Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No sessions found. Book a charging session from the map!
          </div>
        )}
      </div>

      {selectedSessionId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          sessionId={selectedSessionId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </>
  )
} 