const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Models
const User = require('./models/User');
const AptitudeQuestion = require('./models/AptitudeQuestion');
const CodingQuestion = require('./models/CodingQuestion');
const Interview = require('./models/Interview');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_portal';

const aptitudeQuestions = [
  // Quantitative
  { question: 'A train travels 360 km in 4 hours. What is its speed in m/s?', options: ['20 m/s', '25 m/s', '30 m/s', '22.5 m/s'], correctAnswer: 1, explanation: '360 km/4 hrs = 90 km/hr = 90 × (1000/3600) = 25 m/s', category: 'quantitative', difficulty: 'easy', company: 'TCS', points: 10 },
  { question: 'If 15 workers can build a wall in 48 hours, how many workers are needed to build the same wall in 30 hours?', options: ['20', '22', '24', '26'], correctAnswer: 2, explanation: 'Workers × Hours = Constant. 15 × 48 = x × 30. x = 720/30 = 24', category: 'quantitative', difficulty: 'medium', company: 'Infosys', points: 10 },
  { question: 'The compound interest on Rs. 8000 for 3 years at 10% per annum is:', options: ['Rs. 2400', 'Rs. 2648', 'Rs. 2500', 'Rs. 2700'], correctAnswer: 1, explanation: 'CI = 8000[(1+0.1)^3 - 1] = 8000[1.331 - 1] = 8000 × 0.331 = Rs. 2648', category: 'quantitative', difficulty: 'medium', company: 'Wipro', points: 10 },
  { question: 'Two pipes A and B can fill a tank in 12 min and 15 min respectively. If both are opened together, in how many minutes will the tank be filled?', options: ['6 min', '6.67 min', '7 min', '5.5 min'], correctAnswer: 1, explanation: 'Combined rate = 1/12 + 1/15 = 5/60 + 4/60 = 9/60 = 3/20. Time = 20/3 = 6.67 min', category: 'quantitative', difficulty: 'medium', company: 'TCS', points: 10 },
  { question: 'What is 15% of 240?', options: ['36', '38', '32', '34'], correctAnswer: 0, explanation: '15% of 240 = (15/100) × 240 = 36', category: 'quantitative', difficulty: 'easy', company: 'General', points: 10 },
  { question: 'A car covers a distance of 450 km in 9 hours. What is the average speed?', options: ['45 km/h', '50 km/h', '55 km/h', '60 km/h'], correctAnswer: 1, explanation: 'Speed = Distance/Time = 450/9 = 50 km/h', category: 'quantitative', difficulty: 'easy', company: 'General', points: 10 },
  { question: 'If the ratio of ages of A and B is 3:5 and the sum of their ages is 40, what is A\'s age?', options: ['12', '15', '18', '20'], correctAnswer: 1, explanation: 'A = 3x, B = 5x. 3x + 5x = 40. 8x = 40. x = 5. A = 15', category: 'quantitative', difficulty: 'easy', company: 'General', points: 10 },
  { question: 'A shopkeeper sells goods at a 20% profit. If the cost price is Rs. 500, what is the selling price?', options: ['Rs. 580', 'Rs. 600', 'Rs. 620', 'Rs. 650'], correctAnswer: 1, explanation: 'SP = CP × (1 + Profit%) = 500 × 1.20 = Rs. 600', category: 'quantitative', difficulty: 'easy', company: 'Cognizant', points: 10 },

  // Logical
  { question: 'If COMPUTER is coded as RFUVQNPC, how is PRINTER coded?', options: ['QSJOUFQ', 'QSJOUFS', 'SFOUFSQ', 'QSJOSFQ'], correctAnswer: 1, explanation: 'Each letter is shifted by -1 in reverse order. P→Q, R→S, I→J, N→O, T→U, E→F, R→S', category: 'logical', difficulty: 'medium', company: 'Infosys', points: 10 },
  { question: 'Find the next number in the series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], correctAnswer: 1, explanation: 'Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42', category: 'logical', difficulty: 'easy', company: 'TCS', points: 10 },
  { question: 'All roses are flowers. Some flowers are red. Conclusion: Some roses are red.', options: ['True', 'False', 'Cannot determine', 'Partially true'], correctAnswer: 2, explanation: 'We can\'t conclude that roses are red just because some flowers are red.', category: 'logical', difficulty: 'medium', company: 'Wipro', points: 10 },
  { question: 'In a row of 40 students, Ravi is 11th from the left. What is his position from the right?', options: ['28th', '29th', '30th', '31st'], correctAnswer: 2, explanation: 'Position from right = Total + 1 - Position from left = 40 + 1 - 11 = 30', category: 'logical', difficulty: 'easy', company: 'General', points: 10 },
  { question: 'Which number should replace the ? : 5, 10, 20, 40, ?', options: ['60', '70', '80', '100'], correctAnswer: 2, explanation: 'Each number is multiplied by 2. 40 × 2 = 80', category: 'logical', difficulty: 'easy', company: 'General', points: 10 },

  // Verbal
  { question: 'Choose the word most similar in meaning to "BENEVOLENT":', options: ['Cruel', 'Kind', 'Selfish', 'Strict'], correctAnswer: 1, explanation: 'Benevolent means kind and generous.', category: 'verbal', difficulty: 'easy', company: 'General', points: 10 },
  { question: 'Choose the antonym of "VERBOSE":', options: ['Wordy', 'Talkative', 'Concise', 'Lengthy'], correctAnswer: 2, explanation: 'Verbose means using too many words. Its antonym is Concise.', category: 'verbal', difficulty: 'easy', company: 'Accenture', points: 10 },
  { question: 'Fill in the blank: "Despite working hard, he failed to ___ his goals."', options: ['achieve', 'archieve', 'acheive', 'achievve'], correctAnswer: 0, explanation: 'The correct spelling is "achieve".', category: 'verbal', difficulty: 'easy', company: 'General', points: 10 },

  // Technical
  { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], correctAnswer: 2, explanation: 'Binary search divides the search space in half each time, giving O(log n) complexity.', category: 'technical', difficulty: 'easy', company: 'Google', points: 10 },
  { question: 'Which data structure uses LIFO (Last In, First Out) principle?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctAnswer: 1, explanation: 'Stack follows LIFO - the last element pushed is the first to be popped.', category: 'technical', difficulty: 'easy', company: 'Amazon', points: 10 },
  { question: 'What is the worst case time complexity of QuickSort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correctAnswer: 1, explanation: 'QuickSort worst case occurs when pivot is always the smallest/largest element: O(n²).', category: 'technical', difficulty: 'medium', company: 'Microsoft', points: 10 },
  { question: 'Which SQL command is used to remove a table and its data permanently?', options: ['DELETE', 'REMOVE', 'DROP', 'TRUNCATE'], correctAnswer: 2, explanation: 'DROP TABLE permanently removes the table structure and all its data.', category: 'technical', difficulty: 'easy', company: 'TCS', points: 10 },
  { question: 'In OOP, what is polymorphism?', options: ['Hiding data', 'Ability to take many forms', 'Inheriting properties', 'Creating objects'], correctAnswer: 1, explanation: 'Polymorphism allows objects of different types to be treated as objects of a common type.', category: 'technical', difficulty: 'easy', company: 'Wipro', points: 10 },
];

const codingQuestions = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'easy',
    category: 'arrays',
    company: ['Amazon', 'Google', 'Microsoft'],
    tags: ['array', 'hash-table'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
    hints: ['Try using a hash map to store complements', 'For each element, check if target - element exists in the map'],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your code here\n}',
      python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'Use a hash map to store each element and its index. For each element, check if the complement (target - element) exists in the map.', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
    points: 20
  },
  {
    title: 'Reverse a Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'easy',
    category: 'linked-list',
    company: ['Amazon', 'Microsoft', 'Adobe'],
    tags: ['linked-list', 'recursion'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' }
    ],
    constraints: 'The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000',
    hints: ['Use three pointers: prev, current, next', 'Iteratively reverse links one by one'],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false }
    ],
    starterCode: {
      javascript: '/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head) {\n    // Your code here\n}',
      python: 'def reverse_list(head):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'Use three pointers prev, curr, next. At each step, reverse the link and move forward.', timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
    points: 20
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    difficulty: 'easy',
    category: 'stack-queue',
    company: ['Amazon', 'Facebook', 'Bloomberg'],
    tags: ['stack', 'string'],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\' ',
    hints: ['Use a stack data structure', 'Push opening brackets, pop and match for closing brackets'],
    testCases: [
      { input: '()', expectedOutput: 'true', isHidden: false },
      { input: '()[]{} ', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: false }
    ],
    starterCode: {
      javascript: '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // Your code here\n}',
      python: 'def is_valid(s):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'Use a stack. Push opening brackets. For closing brackets, check if top of stack matches.', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
    points: 20
  },
  {
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nThis is a classic dynamic programming problem known as Kadane\'s Algorithm.',
    difficulty: 'medium',
    category: 'dp',
    company: ['Google', 'Amazon', 'Apple', 'Microsoft'],
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' }
    ],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    hints: ['Try Kadane\'s Algorithm', 'At each index, decide whether to extend the current subarray or start a new one'],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false }
    ],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n    // Your code here\n}',
      python: 'def max_sub_array(nums):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'Kadane\'s Algorithm: maxEndingHere = max(num, maxEndingHere + num)', timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
    points: 30
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'easy',
    category: 'dp',
    company: ['Amazon', 'Apple', 'Adobe'],
    tags: ['math', 'dynamic-programming', 'memoization'],
    examples: [
      { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: '1. 1+1+1\n2. 1+2\n3. 2+1' }
    ],
    constraints: '1 <= n <= 45',
    hints: ['This is essentially a Fibonacci sequence', 'ways(n) = ways(n-1) + ways(n-2)'],
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '10', expectedOutput: '89', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n) {\n    // Your code here\n}',
      python: 'def climb_stairs(n):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'Fibonacci: dp[i] = dp[i-1] + dp[i-2]', timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
    points: 20
  },
  {
    title: 'Binary Search',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.',
    difficulty: 'easy',
    category: 'searching',
    company: ['Google', 'Facebook', 'Bloomberg'],
    tags: ['array', 'binary-search'],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
    ],
    constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i] <= 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.',
    hints: ['Use two pointers: left and right', 'Find mid and compare with target'],
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false }
    ],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n    // Your code here\n}',
      python: 'def search(nums, target):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'Classic binary search with left and right pointers', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)' },
    points: 20
  },
  {
    title: 'Longest Common Subsequence',
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.',
    difficulty: 'medium',
    category: 'dp',
    company: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    tags: ['string', 'dynamic-programming'],
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The LCS is "ace", which has length 3.' },
      { input: 'text1 = "abc", text2 = "abc"', output: '3' },
      { input: 'text1 = "abc", text2 = "def"', output: '0' }
    ],
    constraints: '1 <= text1.length, text2.length <= 1000\ntext1 and text2 consist of only lowercase English characters.',
    hints: ['Use 2D DP table', 'dp[i][j] = LCS of text1[0..i] and text2[0..j]'],
    testCases: [
      { input: 'abcde\nace', expectedOutput: '3', isHidden: false },
      { input: 'abc\nabc', expectedOutput: '3', isHidden: false }
    ],
    starterCode: {
      javascript: '/**\n * @param {string} text1\n * @param {string} text2\n * @return {number}\n */\nfunction longestCommonSubsequence(text1, text2) {\n    // Your code here\n}',
      python: 'def longest_common_subsequence(text1, text2):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: '2D DP: if chars match, dp[i][j] = 1 + dp[i-1][j-1], else max(dp[i-1][j], dp[i][j-1])', timeComplexity: 'O(m*n)', spaceComplexity: 'O(m*n)' },
    points: 30
  },
  {
    title: 'Number of Islands',
    description: 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    difficulty: 'medium',
    category: 'graphs',
    company: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
    tags: ['array', 'graph', 'dfs', 'bfs'],
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
    ],
    constraints: 'm == grid.length\nn == grid[i].length\n1 <= m, n <= 300',
    hints: ['Use DFS to mark visited land cells', 'Count how many times you start a new DFS'],
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isHidden: false }
    ],
    starterCode: {
      javascript: '/**\n * @param {character[][]} grid\n * @return {number}\n */\nfunction numIslands(grid) {\n    // Your code here\n}',
      python: 'def num_islands(grid):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Your code here\n    }\n};'
    },
    solution: { approach: 'DFS/BFS: for each unvisited land cell, do DFS marking all connected land as visited, incrementing counter', timeComplexity: 'O(m*n)', spaceComplexity: 'O(m*n)' },
    points: 30
  }
];

const interviewExperiences = [
  {
    company: 'TCS',
    role: 'System Engineer',
    package: '3.36 LPA',
    difficulty: 'easy',
    result: 'selected',
    experience: 'The TCS NQT was divided into four sections: Verbal, Reasoning, Quantitative, and Programming Logic. The verbal section had reading comprehension and grammar questions. Reasoning had series completion and data sufficiency. Quant had time-speed-distance and profit-loss. Programming logic had pseudocode questions.\n\nAfter clearing NQT, there was a technical interview focusing on C, Java, DBMS basics, and OS concepts. I was asked about pointers in C, normalization in databases, and process scheduling.\n\nThe HR interview was simple - standard questions about yourself, why TCS, where do you see yourself in 5 years.',
    tips: 'Focus heavily on verbal and quant sections as they have more weightage. Practice TCS NQT previous papers available on PrepInsta.',
    rounds: [
      { roundName: 'NQT Exam', description: 'Online aptitude test with 4 sections', questions: ['Series completion', 'Reading comprehension', 'Speed-distance problems'], tips: 'Practice mock tests' },
      { roundName: 'Technical Interview', description: 'Face to face technical discussion', questions: ['Explain OOPS concepts', 'Write a SQL query for second highest salary', 'What is normalization?'], tips: 'Be clear on DBMS and OOP fundamentals' },
      { roundName: 'HR Interview', description: 'HR discussion about career goals', questions: ['Tell me about yourself', 'Why TCS?', 'Are you willing to relocate?'], tips: 'Be confident and honest' }
    ],
    isAnonymous: false
  },
  {
    company: 'Infosys',
    role: 'Systems Engineer',
    package: '3.6 LPA',
    difficulty: 'medium',
    result: 'selected',
    experience: 'Infosys recruitment had 3 stages. First was the InfyTQ online assessment with sections on Reasoning, Mathematical Ability, and Verbal Ability followed by a coding round with 2 problems.\n\nThe coding problems were of easy-medium difficulty. I solved problems on string manipulation and array operations.\n\nTechnical interview focused on data structures - they asked me to code a binary search, explain merge sort, and discuss HashMap internals. Also asked about project from resume.\n\nHR was straightforward - questions about flexibility, teamwork, and handling pressure.',
    tips: 'The coding round is crucial. Practice at least 50-100 LeetCode easy/medium problems. Know your resume projects very well.',
    rounds: [
      { roundName: 'Online Assessment', description: 'Aptitude + 2 coding problems', questions: ['Aptitude questions', 'Reverse a string without extra space', 'Find duplicates in array'], tips: 'Practice coding basics' },
      { roundName: 'Technical Interview', description: '45-minute technical discussion', questions: ['Code binary search', 'Explain HashMap collision handling', 'Tell me about your project'], tips: 'Practice whiteboard coding' }
    ],
    isAnonymous: false
  },
  {
    company: 'Google',
    role: 'Software Engineer Intern',
    package: '80,000/month stipend',
    difficulty: 'hard',
    result: 'selected',
    experience: 'Google campus interview consisted of 5 rounds. The process started with an online coding round with 3 hard-difficulty algorithmic problems to be solved in 90 minutes.\n\nRound 1 was on data structures - I got a graph problem involving BFS/DFS. Round 2 focused on dynamic programming - a variation of the knapsack problem. Round 3 was system design - I had to design a URL shortener.\n\nRound 4 was Googleyness interview - behavioral questions about collaboration, dealing with ambiguity, and failure stories. Round 5 was with the team manager about research interests.\n\nPreparation took 6 months - I solved 400+ LeetCode problems, studied system design from Grokking the System Design Interview, and practiced mock interviews.',
    tips: 'Start preparing 6 months in advance. Focus on graphs, DP, and trees for coding. Read about Google\'s engineering culture. Mock interviews with peers are invaluable.',
    rounds: [
      { roundName: 'Online Coding Round', description: '3 hard algorithmic problems in 90 minutes', questions: ['Graph traversal problem', 'DP with memoization', 'String manipulation with constraints'], tips: 'Practice LeetCode Hard problems' },
      { roundName: 'Data Structures Round', description: 'Live coding with interviewer', questions: ['Find shortest path in weighted graph', 'Implement LRU cache'], tips: 'Think aloud while coding' },
      { roundName: 'System Design', description: 'Design a scalable system', questions: ['Design URL shortener', 'How would you scale to 1 billion users?'], tips: 'Study Grokking the System Design Interview' }
    ],
    isAnonymous: false
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      AptitudeQuestion.deleteMany({}),
      CodingQuestion.deleteMany({}),
      Interview.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'admin',
      college: 'PlacePro HQ',
      department: 'Admin',
      year: 4,
      totalPoints: 9999,
      streak: 30
    });
    console.log('Created admin user: admin@demo.com / admin123');

    // Create demo student
    const studentPassword = await bcrypt.hash('demo123', 12);
    const student = await User.create({
      name: 'Demo Student',
      email: 'student@demo.com',
      password: studentPassword,
      role: 'student',
      college: 'Anna University',
      department: 'CSE',
      year: 3,
      totalPoints: 450,
      streak: 7,
      bio: 'Aspiring software engineer. Passionate about algorithms and problem solving.',
      skills: ['Java', 'Python', 'React', 'SQL', 'Data Structures'],
      codingStats: { totalSolved: 18, easySolved: 12, mediumSolved: 5, hardSolved: 1, languagesUsed: ['javascript', 'python'] },
      aptitudeStats: { totalAttempted: 60, totalCorrect: 42 },
      badges: [
        { name: 'First Step', description: 'Solved first problem', icon: '🌟', earnedAt: new Date() },
        { name: 'Week Warrior', description: 'Maintained 7-day streak', icon: '🔥', earnedAt: new Date() }
      ]
    });
    console.log('Created demo student: student@demo.com / demo123');

    // Seed aptitude questions
    const createdAptitude = await AptitudeQuestion.insertMany(
      aptitudeQuestions.map(q => ({ ...q, createdBy: admin._id }))
    );
    console.log(`Created ${createdAptitude.length} aptitude questions`);

    // Seed coding questions
    const createdCoding = await CodingQuestion.insertMany(codingQuestions);
    console.log(`Created ${createdCoding.length} coding questions`);

    // Seed interview experiences
    const experiencesWithUser = interviewExperiences.map(exp => ({ ...exp, user: student._id }));
    const createdInterviews = await Interview.insertMany(experiencesWithUser);
    console.log(`Created ${createdInterviews.length} interview experiences`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin: admin@demo.com / admin123');
    console.log('  Student: student@demo.com / demo123');
    console.log('\n🚀 Run "npm start" to start the server');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
