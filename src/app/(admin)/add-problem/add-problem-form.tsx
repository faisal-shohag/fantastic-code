'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Code, Tag, Building, Lightbulb, TestTube, Plus, Trash2, Globe } from 'lucide-react'

const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false }
)

interface AddProblemFormProps {
  authorId: string;
}

export default function AddProblemForm({ authorId }: AddProblemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    serial: 0,
    title: '',
    description: '',
    bn_description: '',
    difficulty: 'EASY',
    defaultCode: { javascript: '', typescript: '', python: ''},
    tags: '',
    companies: '',
    hints: [''],
    func: '',
    testCases: [{ input: '', output: '', type: 'RUN' }],
    isPublish: false
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
       { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }))
  }

  const handleBnDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, bn_description: value }))
  }

  const handleDefaultCodeChange = (language: 'javascript' | 'typescript' | 'python', value: string) => {
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

  const removeHint = (index: number) => {
    if (formData.hints.length > 1) {
      const newHints = [...formData.hints]
      newHints.splice(index, 1)
      setFormData(prev => ({ ...prev, hints: newHints }))
    }
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

  const removeTestCase = (index: number) => {
    if (formData.testCases.length > 1) {
      const newTestCases = [...formData.testCases]
      newTestCases.splice(index, 1)
      setFormData(prev => ({ ...prev, testCases: newTestCases }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const uniqueTitle = formData.title.toLowerCase().replace(/\s+/g, '-')
      
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unique_title: uniqueTitle,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          companies: formData.companies.split(',').map(company => company.trim()).filter(Boolean),
          authorId
        }),
      })

      if (response.ok) {
        router.push('/problems')
      } else {
        const errorData = await response.json()
        console.error('Failed to add problem:', errorData)
        alert('Failed to add problem. Please check the console for details.')
      }
    } catch (error) {
      console.error('Error submitting problem:', error)
      alert('An error occurred while submitting the problem.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
    const colorMap = {
      'EASY': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HARD': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[difficulty as keyof typeof colorMap]}`}>
        {difficulty}
      </span>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Create New Problem</CardTitle>
            <CardDescription>
              Add a new coding challenge to the platform. All fields marked with * are required.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="isPublish" className="cursor-pointer">
              Publish immediately
            </Label>
            <Switch 
              id="isPublish" 
              checked={formData.isPublish}
              onCheckedChange={(checked) => handleSwitchChange('isPublish', checked)}
            />
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
              <TabsTrigger value="code">Default Code</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
              <TabsTrigger value="tests">Test Cases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial">
                    Problem ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serial"
                    name="serial"
                    value={formData.serial}
                    type="number"
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g., 142"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">
                    Difficulty <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    name="difficulty" 
                    value={formData.difficulty} 
                    onValueChange={(value) => handleChange({ target: { name: 'difficulty', value } })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">
                        <div className="flex items-center gap-2">
                          <DifficultyBadge difficulty="EASY" />
                          <span>Easy</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        <div className="flex items-center gap-2">
                          <DifficultyBadge difficulty="MEDIUM" />
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="HARD">
                        <div className="flex items-center gap-2">
                          <DifficultyBadge difficulty="HARD" />
                          <span>Hard</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">
                  Problem Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Two Sum"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                  </div>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., array, hash-table, two-pointers"
                  />
                  {formData.tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.split(',').map((tag, index) => (
                        tag.trim() && (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building size={16} />
                    <Label htmlFor="companies">Companies (comma-separated)</Label>
                  </div>
                  <Input
                    id="companies"
                    name="companies"
                    value={formData.companies}
                    onChange={handleChange}
                    placeholder="e.g., Google, Amazon, Facebook"
                  />
                  {formData.companies && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.companies.split(',').map((company, index) => (
                        company.trim() && (
                          <Badge key={index} variant="outline">
                            {company.trim()}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="descriptions" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Problem Description (English) <span className="text-red-500">*</span>
                </Label>
                <div className="border rounded-md">
                  <MarkdownEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    height="400px"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Write a clear problem statement using Markdown. Include examples, constraints, and any special requirements.
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <Label htmlFor="bn_description">
                    Problem Description (Bangla)
                  </Label>
                </div>
                <div className="border rounded-md">
                  <MarkdownEditor
                    value={formData.bn_description}
                    onChange={handleBnDescriptionChange}
                    height="400px"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Optionally provide a Bangla translation of the problem statement
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code size={16} />
                  <Label htmlFor="func">Function Name (for Python)</Label>
                </div>
                <Input
                  id="func"
                  name="func"
                  value={formData.func}
                  onChange={handleChange}
                  placeholder="e.g., two_sum, max_profit"
                />
                <p className="text-xs text-gray-500">
                  Specify the main function name especially for Python solutions
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="javascriptCode">
                    JavaScript Starter Code <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="javascriptCode"
                    value={formData.defaultCode.javascript}
                    onChange={(e) => handleDefaultCodeChange('javascript', e.target.value)}
                    required
                    className="font-mono h-32"
                    placeholder="/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
}"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="typescriptCode">
                    TypeScript Starter Code <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="typescriptCode"
                    value={formData.defaultCode.typescript}
                    onChange={(e) => handleDefaultCodeChange('typescript', e.target.value)}
                    required
                    className="font-mono h-32"
                    placeholder="function twoSum(nums: number[], target: number): number[] {
    // Your solution here
}"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pythonCode">
                    Python Starter Code <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="pythonCode"
                    value={formData.defaultCode.python}
                    onChange={(e) => handleDefaultCodeChange('python', e.target.value)}
                    required
                    className="font-mono h-32"
                    placeholder="from typing import List

def two_sum(nums: List[int], target: int) -> List[int]:
    # Your solution here
    pass"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hints" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} />
                <h3 className="text-lg font-medium">Problem Hints</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Provide progressive hints that guide users toward the solution without giving it away completely.
              </p>
              
              {formData.hints.map((hint, index) => (
                <div key={index} className="flex gap-2 items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Hint {index + 1}</Badge>
                    </div>
                    <Textarea
                      value={hint}
                      onChange={(e) => handleHintChange(index, e.target.value)}
                      placeholder={`Provide hint ${index + 1} here...`}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeHint(index)}
                    disabled={formData.hints.length <= 1}
                  >
                    <Trash2 size={16} className="text-gray-500" />
                  </Button>
                </div>
              ))}
              
              <Button 
                type="button" 
                onClick={addHint} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <Plus size={16} className="mr-1" /> Add Hint
              </Button>
            </TabsContent>
            
            <TabsContent value="tests" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TestTube size={16} />
                <h3 className="text-lg font-medium">Test Cases</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Add test cases to validate user solutions. &apos;Run&apos; tests are visible to users, while &apos;Submit&apos; tests are used for final validation.
              </p>
              
              {formData.testCases.map((testCase, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Test Case {index + 1}</Badge>
                      <Select 
                        value={testCase.type} 
                        onValueChange={(value) => handleTestCaseChange(index, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RUN">Run (Visible)</SelectItem>
                          <SelectItem value="SUBMIT">Submit (Hidden)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`input-${index}`}>Input</Label>
                      <Textarea
                        id={`input-${index}`}
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        placeholder="e.g., [2,7,11,15], 9"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`output-${index}`}>Expected Output</Label>
                      <Textarea
                        id={`output-${index}`}
                        value={testCase.output}
                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                        placeholder="e.g., [0,1]"
                        className="font-mono"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end py-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeTestCase(index)}
                      disabled={formData.testCases.length <= 1}
                    >
                      <Trash2 size={16} className="mr-1" /> Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Button 
                type="button" 
                onClick={addTestCase} 
                variant="outline"
              >
                <Plus size={16} className="mr-1" /> Add Test Case
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center border-t p-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/problems')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6"
          >
            {isSubmitting ? 'Submitting...' : `${formData.isPublish ? 'Create & Publish' : 'Create as Draft'}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}