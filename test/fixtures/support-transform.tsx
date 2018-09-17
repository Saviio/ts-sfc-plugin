import React from 'react'

const Lifted = (props: any) => <div message='div div div' />

export class Test extends React.PureComponent<void, void> {
  render() {
    const params = { message: 'hello' }
    return (
      <React.Fragment>
        <Lifted sfc>
          <Lifted sfc />
        </Lifted>
        <div>
        <Lifted />
        <Lifted { ...params } sfc />
        <Lifted { ...params } k={ 1 } />
        <div>
          <Lifted { ...params } test={ 1 } val={ 'foo' } sfc></Lifted>
          <Lifted { ...params } test={ 1 } val={ 'foo' }></Lifted>
        </div>
        <Lifted { ...params } test={ 1 } val={ 'foo' } sfc>
          <Lifted sfc />
          <Lifted sfc={ true } />
        </Lifted>
        </div>
        <Lifted sfc>
          <Lifted sfc>
            <Lifted sfc>
              <Lifted />
            </Lifted>
          </Lifted>
        </Lifted>
      </React.Fragment>
    )
  }
}
