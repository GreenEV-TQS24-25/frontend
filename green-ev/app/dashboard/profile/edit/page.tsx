'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userApi } from "@/lib/api"
import { useUser } from "@/lib/contexts/user-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function EditProfilePage(){
    const router = useRouter()
    const { user } = useUser()
    const [userData, setUserData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userApi.update(userData)
      router.push('/dashboard/profile')
    } catch (error: unknown) {
      console.error('Profile edit error:', error)
      toast.error('Update failed')
    }
  }


    return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit profile</h1>
        <Link href="/dashboard/profile/edit">
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        { user ? ( 
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>{user.name || "Annonymous user"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    required
                  />
                </div>
                <CardFooter className="flex flex-col pt-4 space-y-4">
                  <Button type="submit" className="flex items-center gap-2">
                    Save
                  </Button>
                </CardFooter>
              </CardContent>
            </form>
          </Card>
        ) : null}
      </div>
    </div>
  )
}