import React from 'react'

const Lifted = (_: any) => <div message='div div div' />

export class Test extends React.PureComponent<void, void> {
  render() {
    return (
      <div>
        <Lifted key={ 1 } sfc />
        <Lifted key={ 1 } message={ 1 } bool={ false } sfc />
      </div>
    )
  }
}
