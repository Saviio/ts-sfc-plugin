import React from 'react';
const Lifted = (_: any) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        const params = { message: '123' };
        return (<div>
        {Lifted(Object.assign({}, params, { test: 1, foo: '1', bar: {}, quz: null, re: /\d/, bool: false }))}
      </div>);
    }
}
