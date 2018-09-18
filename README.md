# ts-sfc-plugin

A plugin for optimizing stateless component of React (tsx)

## Why
React functional component(SFC) is easy to use and help to reduce code size significantly, but sometimes
people might have been some misunderstanding about its perfomance. Usually, we think functional components would avoid some overheads like mounting / unmounting / lifecycle checking and memory allocations, but in fact, there're no special optimizations currently (but after react 16 was released, sfc is indeed faster than before).

Fortunately SFC just function in react world, if we do care about performance in production there're still a way to improve and this plugin here come to optimize these situation.

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


## Defect
The following code is recommanded

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

Also, code like the usage will not work as expect, because the plugin does not include any runtime type checking.

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
