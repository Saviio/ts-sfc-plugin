import React from 'react';
const Lifted = (props: any) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    ref: React.ReactInstance;
    saveRef = (ref: any) => this.ref = ref;
    render() {
        return (<div>
        {Lifted()}
      </div>);
    }
}
