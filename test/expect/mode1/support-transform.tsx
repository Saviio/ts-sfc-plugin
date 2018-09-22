import React from 'react';
const Lifted = (props: any) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        const params = { message: 'hello' };
        return (<React.Fragment>
        {Lifted(Object.assign({}, { children: [Lifted()] }))}
        <div>
        <Lifted />
        <Lifted {...params}/>
        <Lifted {...params} k={1}/>
        <div>
          <Lifted {...params} test={1} val={'foo'}></Lifted>
          <Lifted {...params} test={1} val={'foo'}></Lifted>
        </div>
        <Lifted {...params} test={1} val={'foo'}>
          {Lifted()}
          {Lifted()}
        </Lifted>
        </div>
        {Lifted(Object.assign({}, { children: [Lifted(Object.assign({}, { children: [Lifted(Object.assign({}, { children: [<Lifted />] }))] }))] }))}
      </React.Fragment>);
    }
}
