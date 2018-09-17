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

describe('should do transformation successfully', () => {
  const transformer = transformerFactory()

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
      const expectCode = fs.readFileSync(resolve(__dirname, 'expect', filename), 'utf-8')
      result.dispose()

      expect(resultCode).to.equal(expectCode)

      // genResult(filename, resultCode)

    })
  // }
  })

})
