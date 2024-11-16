'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Dynamically import MarkdownEditor with ssr disabled
const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false }
)

interface AddProblemFormProps {
  authorId: string;
}

export default function AddProblemForm({ authorId }: AddProblemFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    defaultCode: { javascript: '', typescript: '' },
    tags: '',
    companies: '',
    hints: [''],
    testCases: [{ input: '', output: '', type: 'RUN' }]
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
       { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }))
  }

  const handleDefaultCodeChange = (language: 'javascript' | 'typescript', value: string) => {
    setFormData(prev => ({
      ...prev,
      defaultCode: { ...prev.defaultCode, [language]: value }
    }))
  }

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...formData.hints]
    newHints[index] = value
    setFormData(prev => ({ ...prev, hints: newHints }))
  }

  const addHint = () => {
    setFormData(prev => ({ ...prev, hints: [...prev.hints, ''] }))
  }

  const handleTestCaseChange = (index: number, field: string, value: string) => {
    const newTestCases = [...formData.testCases]
    newTestCases[index] = { ...newTestCases[index], [field]: value }
    setFormData(prev => ({ ...prev, testCases: newTestCases }))
  }

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '', type: 'RUN' }]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const uniqueTitle = formData.title.toLowerCase().replace(/\s+/g, '-')
    
    const response = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        unique_title: uniqueTitle,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        companies: formData.companies.split(',').map(company => company.trim()),
        authorId
      }),
    })

    if (response.ok) {
      router.push('/problems')
    } else {
      console.error('Failed to add problem')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <MarkdownEditor
          value={formData.description}
          onChange={handleDescriptionChange}
          height="400px"
        />
      </div>
      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select 
          name="difficulty" 
          value={formData.difficulty} 
          onValueChange={(value) => handleChange({ target: { name: 'difficulty', value } })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Default Code</Label>
        <div>
          <Label htmlFor="javascriptCode">JavaScript Code</Label>
          <Textarea
            id="javascriptCode"
            value={formData.defaultCode.javascript}
            onChange={(e) => handleDefaultCodeChange('javascript', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="typescriptCode">TypeScript Code</Label>
          <Textarea
            id="typescriptCode"
            value={formData.defaultCode.typescript}
            onChange={(e) => handleDefaultCodeChange('typescript', e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="companies">Companies (comma-separated)</Label>
        <Input
          id="companies"
          name="companies"
          value={formData.companies}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label>Hints</Label>
        {formData.hints.map((hint, index) => (
          <div key={index} className="mt-2">
            <Input
              value={hint}
              onChange={(e) => handleHintChange(index, e.target.value)}
              placeholder={`Hint ${index + 1}`}
            />
          </div>
        ))}
        <Button type="button" onClick={addHint} className="mt-2">Add Hint</Button>
      </div>
      <div>
        <Label>Test Cases</Label>
        {formData.testCases.map((testCase, index) => (
          <div key={index} className="mt-2 space-y-2">
            <Input
              value={testCase.input}
              onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
              placeholder="Input"
            />
            <Input
              value={testCase.output}
              onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
              placeholder="Output"
            />
            <Select 
              value={testCase.type} 
              onValueChange={(value) => handleTestCaseChange(index, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RUN">Run</SelectItem>
                <SelectItem value="SUBMIT">Submit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button type="button" onClick={addTestCase} className="mt-2">Add Test Case</Button>
      </div>
      <Button type="submit">Add Problem</Button>
    </form>
  )
}
