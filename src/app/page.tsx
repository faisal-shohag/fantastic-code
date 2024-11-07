'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CodeExecutor() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult('')
    setError('')
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()
      if (response.ok) {
        setResult(data.result)
      } else {
        setError(data.error || 'An unknown error occurred')
      }
    } catch (error) {
      setError(`Network error: ${error.message}`)
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>JavaScript Code Executor</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Enter your JavaScript code:
              </label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                placeholder="console.log('Hello, World!');"
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Executing...' : 'Execute Code'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      {(result || error) && (
        <Card className="w-full max-w-2xl mx-auto mt-4">
          <CardHeader>
            <CardTitle>{error ? 'Error' : 'Result'}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className={`p-4 rounded-md overflow-x-auto ${error ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
              {error || result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}