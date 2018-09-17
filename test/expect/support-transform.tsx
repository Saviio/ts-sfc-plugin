import React from 'react';
const Lifted = (props: any) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        const params = { message: 'hello' };
        return (<React.Fragment>
        {Lifted(Object.assign({}, { children: [Lifted()] }))}
        <div>
        <Lifted />
        {Lifted(params)}
        <Lifted {...params} k={1}/>
        <div>
          {Lifted(Object.assign({}, params, { children: [], test: 1, val: 'foo' }))}
          <Lifted {...params} test={1} val={'foo'}></Lifted>
        </div>
        {Lifted(Object.assign({}, params, { children: [Lifted(), Lifted()], test: 1, val: 'foo' }))}
        </div>
        {Lifted(Object.assign({}, { children: [Lifted(Object.assign({}, { children: [Lifted(Object.assign({}, { children: [<Lifted />] }))] }))] }))}
      </React.Fragment>);
    }
}
