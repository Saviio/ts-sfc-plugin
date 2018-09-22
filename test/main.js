const ts = require('typescript')
const fs = require('fs')
const { resolve } = require('path')
const { expect } = require('chai')

const transformerFactory = require('../lib').default
const printer = ts.createPrinter()
const fixtureDir = fs.readdirSync(resolve(__dirname, 'fixtures'))

const genResult = (fileName, source) => {
  fs.writeFileSync(resolve(__dirname, 'result', fileName), source)
}

describe('[Mode 1] should do transformation successfully', () => {
  const transformer = transformerFactory({ mode: 1 })

  fixtureDir.forEach((filename, i) => {
    // if (filename === 'support-transform.tsx') {
    const testcase = filename
      .replace('.tsx', '')
      .replace(/\-/g, ' ')
      .replace(/\s(\d)/, (_, c) => `: ${c.trim()}`)

    it(`should ${testcase}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', filename), 'utf-8')
      const source = ts.createSourceFile(filename, sourceCode, ts.ScriptTarget.ES2016, true)
      const result = ts.transform(source, [ transformer ])
      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)
      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'mode1', filename), 'utf-8')
      result.dispose()

      expect(resultCode).to.equal(expectCode)

      // genResult(filename, resultCode)

    })
  // }
  })

})

describe('[Mode 2] should do transformation successfully', () => {
  const transformer = transformerFactory({ mode: 2 })

  fixtureDir.forEach((filename, i) => {
    // if (filename === 'should-support-key.tsx') {
    const testcase = filename
      .replace('.tsx', '')
      .replace(/\-/g, ' ')
      .replace(/\s(\d)/, (_, c) => `: ${c.trim()}`)

    it(`should ${testcase}`, () => {
      const sourceCode = fs.readFileSync(resolve(__dirname, 'fixtures', filename), 'utf-8')
      const source = ts.createSourceFile(filename, sourceCode, ts.ScriptTarget.ES2016, true)
      const result = ts.transform(source, [ transformer ])
      const transformedSourceFile = result.transformed[0]

      const resultCode = printer.printFile(transformedSourceFile)
      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', 'mode2', filename), 'utf-8')
      result.dispose()

      expect(resultCode).to.equal(expectCode)

      // genResult(filename, resultCode)

    })
  // }
  })

})
