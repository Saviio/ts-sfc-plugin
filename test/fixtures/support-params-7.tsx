import React from 'react'

const Lifted = (_: { message?: string, test: number }) => <div message='div div div' />

export class Test extends React.PureComponent<void, void> {
  render() {
    const params = { message: '123' }
    return <Lifted { ...params } test={ 1 }  sfc />
  }
}
