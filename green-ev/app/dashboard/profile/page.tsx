'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/contexts/user-context"
import Link from "next/link"

export default function ProfilePage(){
    const { user, logout } = useUser()

    return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <Link href="/dashboard/profile/edit">
          <Button className="flex items-center gap-2">
            Edit profile
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        { user ? ( 
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>{user.name || "Anonymous user"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">
                    {user.role}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pt-4 space-y-4">
              <Button 
                className="flex items-center gap-2"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </CardFooter>
          </Card>
        ) : null}
      </div>
    </div>
  )
}