import React from 'react';
const Lifted = (_: any) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<div>
        {Lifted()}
        {Lifted(Object.assign({}, { message: 1, bool: false }))}
      </div>);
    }
}
