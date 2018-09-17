import React from 'react';
const Lifted = (props: {
    message?: string;
}) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        const params = { message: '123' };
        return (<div>
        <Lifted {...params}/>
      </div>);
    }
}
