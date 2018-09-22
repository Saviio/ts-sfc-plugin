import React from 'react';
export class Test extends React.PureComponent<void, void> {
    lifted() {
        return <div message='hello'/>;
    }
    render() {
        return (<div>
        {this.lifted()}
      </div>);
    }
}
