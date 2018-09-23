import React from 'react';
const Lifted = (_: any) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<>
        {Lifted()}
        <Lifted key={1}/>
      </>);
    }
}
