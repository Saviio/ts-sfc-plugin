import React from 'react'

const Lifted = (props: { message?: string }) => <div message='div div div' />

export class Test extends React.PureComponent<void, void> {
  render() {
    return (
      <div>
        <Lifted sfc />
      </div>
    )
  }
}
