import * as React from "react";
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor, getByText } from '@testing-library/react';
import { useSync } from '../index';

const sampleStore = ({
  alpha:0,
  beta:0
})
const readFn = jest.fn(({name}:{name: 'alpha' | 'beta'}, stores = { sampleStore }) => sampleStore[name]);
const readFn_2 = jest.fn(({name}:{name: 'alpha' | 'beta'}, stores = { sampleStore }) => sampleStore[name]);
const mockedFunctions = {
  my_on: jest.fn(() => 'on'),
  my_off: jest.fn(() => 'off'),
};

jest.mock('adax-core', () => {
  return {
    __esModule: true,
    subscribe: jest.fn(() => ({
      on: mockedFunctions.my_on,
      off: mockedFunctions.my_off,
    })),
  };
});

const MyComponent = ({query, name, skipInitalQuerying, onClick}:{query: (x: any) => any, name: 'alpha' | 'beta', skipInitalQuerying: boolean, onClick: () => void}) => {
  const value = useSync(query, {name}, {skipInitalQuerying})
  return <span data-testid="isAlpha-toggle" onClick={onClick}>{`${name}:${value}`}</span>
}

const MyApp = ({skipInitalQuerying}: {skipInitalQuerying?: boolean} = {skipInitalQuerying: false}) => {
  const [hidden, toggleHidden] = React.useState<boolean>(false);
  const [switchQuery, setSwitchQuery] = React.useState<boolean>(false);
  const [isAlpha, toggleIsAlpha] = React.useState<boolean>(true);
  return <>
  <span data-testid="hide-show-toggle" onClick={() => toggleHidden(!hidden)} >show/hide</span>
    {(!hidden) ? (
      <>
        <span data-testid="switch-query-toggle" onClick={() => setSwitchQuery(!switchQuery)} >show/hide</span>
        <MyComponent query={switchQuery ? readFn_2: readFn} name={isAlpha ? "alpha" : "beta"} 
          skipInitalQuerying={!!skipInitalQuerying} onClick={() => toggleIsAlpha(!isAlpha)}/>
      </>
    ): <span>Hidden</span>}
  </>
}

describe('adax-react interacts with adax as expected', () => {
  
  beforeEach(() => {
    readFn.mockClear();
    readFn_2.mockClear();
    mockedFunctions.my_on.mockClear();
    mockedFunctions.my_off.mockClear();
  });

  it('Component with useSync causes the invocation of on when mounted', async () => {
    render(<MyApp/>);
    expect(mockedFunctions.my_on).toHaveBeenCalledTimes(1);
  });

  it('Component with useSync causes the invocation of off when un-mounted', async () => {
    const { getByTestId } = render(<MyApp/>);
    expect(mockedFunctions.my_on).toHaveBeenCalledTimes(1);
    const hideShowToggle = getByTestId('hide-show-toggle');
    fireEvent.click(hideShowToggle);
    expect(mockedFunctions.my_off).toHaveBeenCalledTimes(1);
  });

  it('Component with useSync causes the invocation of off when useSync`s query`s arguments are updated', async () => {
    const { getByTestId } = render(<MyApp/>);
    expect(mockedFunctions.my_on).toHaveBeenCalledTimes(1);
    const isAlphaToggle = getByTestId('isAlpha-toggle');
    fireEvent.click(isAlphaToggle);
    expect(mockedFunctions.my_off).toHaveBeenCalledTimes(1);
    expect(mockedFunctions.my_on).toHaveBeenCalledTimes(2);    
  });

  it('Component with useSync causes re-invocation of readFn when useSync`s query`s arguments are updated', async () => {
    const { getByTestId } = render(<MyApp/>);
    expect(readFn).toHaveBeenCalledWith({name:'alpha'});
    readFn.mockClear();
    const isAlphaToggle = getByTestId('isAlpha-toggle');
    fireEvent.click(isAlphaToggle);
    expect(readFn).toHaveBeenCalledWith({name:'beta'});
  });


  it('Component with useSync causes the invocation of off when useSync`s query is updated', async () => {
    const { getByTestId } = render(<MyApp/>);
    expect(mockedFunctions.my_on).toHaveBeenCalledTimes(1);
    const switchQueryToggle = getByTestId('switch-query-toggle');
    fireEvent.click(switchQueryToggle);
    expect(mockedFunctions.my_off).toHaveBeenCalledTimes(1);
    expect(mockedFunctions.my_on).toHaveBeenCalledTimes(2);    
  });

  it('Component with useSync causes invocation of a diff readFn when useSync`s query is updated', async () => {
    const { getByTestId } = render(<MyApp/>);
    expect(readFn).toHaveBeenCalledWith({name:'alpha'});
    expect(readFn).toHaveBeenCalledTimes(1);
    expect(readFn_2).toHaveBeenCalledTimes(0);
    const switchQueryToggle = getByTestId('switch-query-toggle');
    fireEvent.click(switchQueryToggle);
    expect(readFn_2).toHaveBeenCalledWith({name:'alpha'});
    expect(readFn).toHaveBeenCalledTimes(1);
  });

  it('Component with useSync causes the invocation of readFn when mounted if skipInitalQuerying is not set to true', async () => {
    render(<MyApp/>);
    expect(readFn).toHaveBeenCalledWith({name:'alpha'});
  });

  it('Component with useSync causes no invocation of readFn when mounted if skipInitalQuerying is true', async () => {
    render(<MyApp skipInitalQuerying={true} />);
    expect(readFn).toHaveBeenCalledTimes(0);
  });

  it('Component with useSync causes no invocation of readFn when useSync is updated with diff subscription if skipInitalQuerying is true', async () => {
    const { getByTestId } = render(<MyApp skipInitalQuerying={true} />);
    expect(readFn).toHaveBeenCalledTimes(0);
    readFn.mockClear();
    const isAlphaToggle = getByTestId('isAlpha-toggle');
    fireEvent.click(isAlphaToggle);
    expect(readFn).toHaveBeenCalledTimes(0);
  });

});
