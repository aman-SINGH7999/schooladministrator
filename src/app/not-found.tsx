import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <>
     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full shadow-lg border-gray-200 text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            Sorry, we couldn’t find the page you’re looking for. It might have
            been removed, renamed, or doesn’t exist.
          </p>

          <Button asChild>
            <Link href="/dashboard">Go Back Home</Link>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} EduCloud. All rights reserved.
      </p>
    </div>
    </>
   
  );
}
