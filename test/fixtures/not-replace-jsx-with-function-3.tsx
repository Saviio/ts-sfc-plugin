import React from 'react'

const Lifted = (props: { message?: string }) => <div message='div div div' />

export class Test extends React.PureComponent<void, void> {
  render() {
    return (
      <div>
        <Lifted sfc={ false } />
        <Lifted sfc={ false }></Lifted>
        <Lifted sfc={ false }>
          <div>foo</div>
        </Lifted>
        <Lifted />
        <Lifted ></Lifted>
        <Lifted>
          <div>foo</div>
        </Lifted>
      </div>
    )
  }
}
