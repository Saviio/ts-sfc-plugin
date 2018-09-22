[![Codacy grade](https://img.shields.io/codacy/grade/846b3e86d57c4697b681b53e78a9742b.svg?style=for-the-badge)](https://app.codacy.com/app/Saviio/ts-sfc-plugin?utm_source=github.com&utm_medium=referral&utm_content=Saviio/ts-sfc-plugin&utm_campaign=Badge_Grade_Dashboard)
[![npm](https://img.shields.io/npm/v/ts-sfc-plugin.svg?style=for-the-badge)](https://www.npmjs.com/package/ts-sfc-plugin)
[![Coveralls github branch](https://img.shields.io/coveralls/github/Saviio/ts-sfc-plugin/master.svg?style=for-the-badge)](https://coveralls.io/github/Saviio/ts-sfc-plugin?branch=master)
[![CircleCI branch](https://img.shields.io/circleci/project/github/Saviio/ts-sfc-plugin/master.svg?style=for-the-badge)](https://circleci.com/gh/Saviio/ts-sfc-plugin/tree/master)
[![GitHub license](https://img.shields.io/github/license/Saviio/ts-sfc-plugin.svg?style=for-the-badge)](https://github.com/Saviio/ts-sfc-plugin/blob/master/LICENSE)

# ts-sfc-plugin

A plugin for optimizing stateless component of React (tsx)

## Why
React functional component(SFC) is easy to use and help to reduce code size significantly, but sometimes
people might have been some misunderstanding about its perfomance. Usually, we think functional components would avoid some overheads like mounting / unmounting / lifecycle checking and memory allocations, but in fact, there're no special optimizations currently (but after react 16 was released, sfc is indeed faster than before).

Fortunately SFC just function in react world, if we do care about performance in production there're still a way to improve and this plugin here come to simplify these situation.

```javascript
const code1 = (
  <div>
    <Avatar />
  </div>
)

const code2 = (
  <div>
    { Avatar() }
  </div>
)
```
As we cannot recognize if the component is functional, we have to use an anotation to tag the expression:

```javascript
<Avatar sfc />
// Plugin use `sfc` as identifier by default, but you can pass an option to override it.
```

## How to use

### webpack
```javascript
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [sfcPlugin()],
          }),
          compilerOptions: {
            module: 'esnext',
          },
        },
        exclude: /node_modules/,
      }
    ],
  }
```

### code

```javascript
import React from 'react'

export const Avatar = ({ name }) => {
  return (
    <div>
      <img src=... />
      <span>{ name }</span>
    </div>
  )
}
```

```javascript
import React from 'react'
import { Avatar } from './avatar.component'

export class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Avatar name={ 'hello world' } sfc />
      </div>
    )
  }
}
```

### option
```typescript
sfcPlugin(option?: Option)

interface Option {
  pragma?: string
  mode?: 1 | 2
}
```

## Deopt
| Reason | Deopt (mode 1) | Deopt (mode 2)
|--|--|--|
| spread operator | true | false
| prop: key | true | false

Considering we transform the code from tsx to native function-call which means the additional vd-layer will be eliminatd, and the effects of `key` will be removed as well.

```javascript
// before

const Message = () => <div>bravo</div>

export class App extends React.PureComponent {
  render() {
    return <Message key={ 1 } />
  }
}
```

```javascript
// after

const Message = () => <div>bravo</div>

export class App extends React.PureComponent {
  render() {
    // won't get benefit from prop: `key`
    return Message()
  }
}
```

## Notice
Unlike [@babel/plugin-transform-react-inline-elements](https://babeljs.io/docs/en/next/babel-plugin-transform-react-inline-elements), we won't take `ref` into account because of this plugin will be applied to typescript only.
```javascript
const Message = () => <div>bravo</div>

export class App extends React.PureComponent {
  render() {
    // ERROR: this is not type-safe
    // { ref: any } is not assignable to IntrinsicAttributes
    return <Message ref={ ... } />
  }
}
```

## Defect
The following code is recommanded:

```javascript
<Avatar sfc>
// enable rule: `jsx-boolean-value` in tslint.json
```

using declaration merging in global .d.ts

```javascript
import React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes extends React.Attributes {
      sfc?: boolean
    }
  }
}
```
### Exception
code like the usage will not work, because the plugin does not include any runtime type checking.

```javascript
const component = <Avatar sfc={ this.props.flag } />
```

## Benchmark

React 16.4, ```<Dot />```, 50 times, MacBook Pro (Retina, 13-inch, Early 2013)

| Classical | Functional | Direct-call | Auto-transform |
|--|--|--|--|
| 660ms | 408ms | 226ms | 229ms |

## Refs

[scu vs sfc](https://stackoverflow.com/questions/45795380/component-with-shouldcomponentupdate-vs-stateless-component-performance)

[45% faster react functional components now](https://medium.com/missive-app/45-faster-react-functional-components-now-3509a668e69f)
