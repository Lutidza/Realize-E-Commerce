/**
 * @file src/RealizeCore/services/search/api/errors.ts
 * @version 0.1.0 – 2026-03-01 23:10
 * @description Общие ошибки Search API.
 */

export class BudgetExceededError extends Error {
  budget: 'aggCountBudget' | 'bucketCountBudget'
  limit: number
  actual: number

  constructor(params: {
    budget: 'aggCountBudget' | 'bucketCountBudget'
    limit: number
    actual: number
  }) {
    super(
      `Budget "${params.budget}" exceeded: actual=${params.actual}, limit=${params.limit}`,
    )
    this.name = 'BudgetExceededError'
    this.budget = params.budget
    this.limit = params.limit
    this.actual = params.actual
  }
}

export default BudgetExceededError
