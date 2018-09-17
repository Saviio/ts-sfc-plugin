import React from "react"
import {render} from 'react-dom'

const Dot = (props) =>
  <span>.</span>

class DotComponent extends React.Component {
  render() {
    return <span>.</span>
  }
}

class Main extends React.Component {
  render() {
    var dots = Array(500).fill(0).map(x => {
      if(this.props.kind == 'Functional-Component-Direct-Call') {
        return Dot()
      } else if(this.props.kind == 'Functional-Component-Mounted') {
        return <Dot />
      } else if(this.props.kind == 'Class-Component') {
        return <DotComponent />
      } else if (this.props.kind = 'Optimized-Functional-Component') {
        return <Dot sfc />
      }
    })
    return React.createElement('div', {}, ...dots)
  }
}

let prevBenchmarkTime, benchmarkCount, statefulTotalTime, statelessFunctionalMountedTotalTime, statelessFunctionalDirectCallTotalTime, optimizedTime
benchmarkCount = 0
statefulTotalTime = 0
statelessFunctionalMountedTotalTime = 0
statelessFunctionalDirectCallTotalTime = 0
optimizedTime = 0

const run = () => {
  ['Class-Component', 'Functional-Component-Mounted', 'Functional-Component-Direct-Call', 'Optimized-Functional-Component'].forEach(kind => {
    const prevTime = performance.now()

    var items = []
    var i, len
    for (i = 0, len = 20; i < len; i++) {
      items.push(i)
    }
    items.forEach(i => {
      render((
        <Main kind={kind}/>
        ), document.getElementById(kind))
    })

    const time = Math.round(performance.now() - prevTime)

    if(kind == 'Functional-Component-Direct-Call') {
      statelessFunctionalDirectCallTotalTime = statelessFunctionalDirectCallTotalTime + time
    } else if(kind == 'Functional-Component-Mounted') {
      statelessFunctionalMountedTotalTime = statelessFunctionalMountedTotalTime + time
    } else if(kind == 'Class-Component') {
      statefulTotalTime = statefulTotalTime + time
    } else if (kind == 'Optimized-Functional-Component') {
      optimizedTime = optimizedTime + time
    }

    const perf = (Math.round((1-time/prevBenchmarkTime)*100) || '  ')
    prevBenchmarkTime = time
  })
  prevBenchmarkTime = undefined
  benchmarkCount = benchmarkCount + 1
  console.log('.')
  return
}

window.benchmark = (count = 50) => {
  console.log(`Running %c${count} %ctimes ...`, 'font-weight: bold', 'font-weight: normal')
  Array(count).fill(0).forEach(x => run())
  console.log(`Class based Component                         took ${statefulTotalTime}ms`)
  console.log(`Function based Component     took ${statelessFunctionalMountedTotalTime}ms %c${Math.round((1-statelessFunctionalMountedTotalTime/statefulTotalTime)*100)}% %c`, 'color:green', 'color:black')
  console.log(`Stateless Functional Direct Call took ${statelessFunctionalDirectCallTotalTime}ms %c${Math.round((1-statelessFunctionalDirectCallTotalTime/statefulTotalTime)*100)}% %c`, 'color:green', 'color:black')
  console.log(`Function based Component with \"SFC\" annotation  took ${optimizedTime}ms %c${Math.round((1-optimizedTime/statefulTotalTime)*100)}% %c`, 'color:green', 'color:black')
  console.log(`%c🎉`, 'font-size: 100px')
}
