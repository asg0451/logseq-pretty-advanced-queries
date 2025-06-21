import { describe, it, expect, beforeEach } from 'vitest'
import {
  clojureScriptEvaluator,
  evaluateViewFunction,
  evaluateResultTransform,
} from './clojureScriptEvaluator'

describe('ClojureScript Evaluator', () => {
  beforeEach(async () => {
    await clojureScriptEvaluator.initialize()
  })

  describe('basic evaluation', () => {
    it('should return an identity function for simple symbols', async () => {
      const result = await clojureScriptEvaluator.evaluateString('my-view')
      expect(typeof result).toBe('function')

      const testData = [1, 2, 3]
      const fn = result as (data: unknown) => unknown
      expect(fn(testData)).toEqual(testData)
    })

    it('should return an identity function for keywords', async () => {
      const result = await clojureScriptEvaluator.evaluateString(':table')
      expect(typeof result).toBe('function')

      const testData = { a: 1, b: 2 }
      const fn = result as (data: unknown) => unknown
      expect(fn(testData)).toEqual(testData)
    })
  })

  describe('simple function patterns', () => {
    it('should handle map first pattern', async () => {
      const code = '(fn [data] (map first data))'
      const viewFn = (await clojureScriptEvaluator.evaluateString(code)) as (
        data: unknown,
      ) => unknown

      const testData = [
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]
      const result = viewFn(testData)

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should handle count pattern', async () => {
      const code = '(fn [data] (count data))'
      const viewFn = (await clojureScriptEvaluator.evaluateString(code)) as (
        data: unknown,
      ) => unknown

      const testData = [1, 2, 3, 4, 5]
      const result = viewFn(testData)

      expect(result).toBe(5)
    })

    it('should handle take pattern', async () => {
      const code = '(fn [data] (take 3 data))'
      const viewFn = (await clojureScriptEvaluator.evaluateString(code)) as (
        data: unknown,
      ) => unknown

      const testData = [1, 2, 3, 4, 5]
      const result = viewFn(testData)

      expect(result).toEqual([1, 2, 3])
    })

    it('should return identity function for unsupported patterns', async () => {
      const code = '(fn [data] (some-complex-operation data))'
      const viewFn = (await clojureScriptEvaluator.evaluateString(code)) as (
        data: unknown,
      ) => unknown

      const testData = [1, 2, 3]
      const result = viewFn(testData)

      expect(result).toEqual(testData)
    })
  })

  describe('compilation', () => {
    it('should return mock compiled code', async () => {
      const code = '(fn [x] (inc x))'
      const compiled = await clojureScriptEvaluator.compileString(code)

      expect(compiled).toContain('// Compiled ClojureScript (mock)')
      expect(compiled).toContain(code)
    })
  })
})

describe('View Function Evaluation', () => {
  it('should apply view function to query results', async () => {
    const viewCode = '(fn [data] (map first data))'
    const queryResults = [
      ['block1', 'content1'],
      ['block2', 'content2'],
    ]

    const result = await evaluateViewFunction(viewCode, queryResults)

    expect(result).toEqual(['block1', 'block2'])
  })

  it('should return original results if view code is not a function', async () => {
    const viewCode = ':table'
    const queryResults = [
      ['block1', 'content1'],
      ['block2', 'content2'],
    ]

    const result = await evaluateViewFunction(viewCode, queryResults)

    expect(result).toEqual(queryResults)
  })

  it('should return original results if view evaluation fails', async () => {
    const viewCode = 'invalid-clojure-code'
    const queryResults = [
      ['block1', 'content1'],
      ['block2', 'content2'],
    ]

    const result = await evaluateViewFunction(viewCode, queryResults)

    expect(result).toEqual(queryResults)
  })
})

describe('Result Transform Evaluation', () => {
  it('should apply transform function to query results', async () => {
    const transformCode = '(fn [data] (take 2 data))'
    const queryResults = [1, 2, 3, 4, 5]

    const result = await evaluateResultTransform(transformCode, queryResults)

    expect(result).toEqual([1, 2])
  })

  it('should return original results if transform code is not a function', async () => {
    const transformCode = ':identity'
    const queryResults = [1, 2, 3, 4, 5]

    const result = await evaluateResultTransform(transformCode, queryResults)

    expect(result).toEqual(queryResults)
  })

  it('should return original results if transform evaluation fails', async () => {
    const transformCode = 'invalid-transform'
    const queryResults = [1, 2, 3, 4, 5]

    const result = await evaluateResultTransform(transformCode, queryResults)

    expect(result).toEqual(queryResults)
  })
})
