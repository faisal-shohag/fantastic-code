export const problems = [
    {
      id: 'sum-two-numbers',
      title: 'Sum Two Numbers',
      description: 'Write a function that takes two numbers as input and returns their sum.',
      starterCode: `def sum_two_numbers(a, b):
      # Your code here
      pass
  
  # Example usage
  print(sum_two_numbers(3, 5))`,
      testCases: [
        { input: '3 5', expectedOutput: '8' },
        { input: '-1 7', expectedOutput: '6' },
        { input: '0 0', expectedOutput: '0' },
      ],
    },
    {
      id: 'fibonacci',
      title: 'Fibonacci Sequence',
      description: 'Write a function that returns the nth number in the Fibonacci sequence.',
      starterCode: `def fibonacci(n):
      # Your code here
      pass
  
  # Example usage
  print(fibonacci(6))`,
      testCases: [
        { input: '6', expectedOutput: '8' },
        { input: '1', expectedOutput: '1' },
        { input: '10', expectedOutput: '55' },
      ],
    },
  ]
  
  