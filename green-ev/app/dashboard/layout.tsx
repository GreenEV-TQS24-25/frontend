'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, LayoutDashboard, Settings, MapPin, Car, Clock, Calendar } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/login')
  }

  const handleOverlayClick = () => {
    setIsSidebarOpen(false)
  }

  const handleOverlayKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
        <h1 className="text-xl font-bold">GreenEV</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut />
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">GreenEV</h2>
          </div>
          <nav className="p-4 space-y-2">
            <Button 
              variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant={pathname === '/dashboard/map' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/map')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Map
            </Button>
            {user?.role === 'USER' && (
              <>
                <Button 
                  variant={pathname === '/dashboard/vehicles' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/vehicles')}
                >
                  <Car className="mr-2 h-4 w-4" />
                  My Vehicles
                </Button>
                <Button 
                  variant={pathname === '/dashboard/sessions' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/sessions')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  My Sessions
                </Button>
              </>
            )}
            {user?.role === 'OPERATOR' && (
              <>
                <Button 
                  variant={pathname === '/dashboard/sessions-management' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/sessions-management')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Sessions Calendar
                </Button>
              </>
            )}
            <Button 
              variant={pathname === '/dashboard/profile' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <button
          tabIndex={0}
          className="fixed inset-0 bg-black/50 lg:hidden z-40 cursor-pointer"
          onClick={handleOverlayClick}
          onKeyDown={handleOverlayKeyDown}
        />
      )}
    </div>
  )
} 