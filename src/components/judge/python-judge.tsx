'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { problems } from '@/lib/problems'
import { runPythonCode, judgeSubmission } from '@/lib/python-runner'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function PythonJudge() {
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(problems[0])
  const [judgeResult, setJudgeResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCode(selectedProblem.starterCode)
  }, [selectedProblem])

  const handleRun = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await runPythonCode(code, input)
      setOutput(result)
    } catch (error) {
      console.error("Error running code:", error)
      setError(`Error running code: ${error.message}`)
      setOutput('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await judgeSubmission(code, selectedProblem.testCases)
      setJudgeResult(result)
    } catch (error) {
      console.error("Error submitting code:", error)
      setError(`Error submitting code: ${error.message}`)
      setJudgeResult('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Select onValueChange={(value) => setSelectedProblem(problems.find(p => p.id === value) || problems[0])}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a problem" />
          </SelectTrigger>
          <SelectContent>
            {problems.map((problem) => (
              <SelectItem key={problem.id} value={problem.id}>{problem.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2">{selectedProblem.description}</div>
        <div className="mt-2 h-[400px] border rounded">
          <MonacoEditor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div className="mt-2 flex space-x-2">
          <Button onClick={handleRun} disabled={isLoading}>
            {isLoading ? 'Running...' : 'Run'}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Input</h3>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your input here"
          rows={4}
        />
        <h3 className="text-xl font-semibold mt-4 mb-2">Output</h3>
        <pre className="bg-gray-100 p-2 rounded min-h-[100px] max-h-[200px] overflow-auto">{output}</pre>
        {judgeResult && (
          <>
            <h3 className="text-xl font-semibold mt-4 mb-2">Judge Result</h3>
            <div className={`p-2 rounded ${
              judgeResult === 'Accepted' ? 'bg-green-100 text-green-800' :
              judgeResult === 'Wrong Answer' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {judgeResult}
            </div>
          </>
        )}
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

