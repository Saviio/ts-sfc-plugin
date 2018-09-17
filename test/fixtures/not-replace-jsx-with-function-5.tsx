import React from 'react'

const Lifted = (props: any) => <div message='div div div' />

export class Test extends React.PureComponent<void, void> {
  render() {
    const params = { message: '123' }
    return (
      <div>
        <Lifted { ...params } val={ 1 } />
        <Lifted val={ 1 } { ...params } />
        <Lifted val={ 1 } { ...params }>
          <div />
        </Lifted>
      </div>
    )
  }
}
