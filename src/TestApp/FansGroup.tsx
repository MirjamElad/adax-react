import React from 'react';
import { useSync } from '../index';
import { trigger } from 'adax-core';

// We chose to pass data (i.e. name) and functions (i.e. query & action) as props just to point that it is possible to
//   re-use components to display different state parts and access the global state with different actions!
export const FansGroup = ({ index, name, query, action }: 
  { index: number, name: string, query: (x: any) => {mood: any}, action: (x: { name: string}) => void }) => {
    const { mood } = useSync(query, { name: name });
    return (
      <div>
        <div><span data-testid={`name-${index}`}>{name}</span> FANS: <span data-testid={`mood-${index}`}>{mood}</span></div>
        <button data-testid={`btn-${index}`} onClick={() => trigger(action, { name: name })} >
          Click to Vote
        </button>
      </div>
    );
};
    