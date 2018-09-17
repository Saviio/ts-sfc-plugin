import React from 'react';
const Lifted = (_: {
    message?: string;
}) => <div message='div div div'/>;
export class Test extends React.PureComponent<void, void> {
    render() {
        const params = { message: '123' };
        return (<div>
        {Lifted(Object.assign({}, params, { children: [<br />,
                <br />,
                1,
                'foo'] }))}
      </div>);
    }
}
