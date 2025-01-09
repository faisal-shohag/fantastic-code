'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CodeExecutor() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult('')
    setError('')
    try {
      const response = await fetch(`https://python-execution.vercel.app/python`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()
      console.log(data)
      
      if(data.error){
        setError(data.error)
        setIsLoading(false)
        return
      }
      if (response.ok) {
     
        setResult(data.result)
      } else {
        console.log(data)
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
          <CardTitle>Code Executor</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Language</Label>
              <RadioGroup defaultValue="javascript" onValueChange={setLanguage} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="javascript" id="javascript" />
                  <Label htmlFor="javascript">JavaScript</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="typescript" id="typescript" />
                  <Label htmlFor="typescript">TypeScript</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="python" id="typescript" />
                  <Label htmlFor="python">Python</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="code" className="block text-sm font-medium mb-1">
                Enter your {language === 'javascript' ? 'JavaScript' : 'TypeScript'} code:
              </Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                placeholder={language === 'javascript' ? "console.log('Hello, World!');" : "const greeting: string = 'Hello, World!';\nconsole.log(greeting);"}
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
            <pre className={`p-4 rounded-md overflow-x-auto ${error ? 'bg-red-100 text-red-800' : 'bg-gray-100 dark:bg-zinc-900'}`}>
              {error || result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}