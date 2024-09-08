import React from 'react';
import { useSync } from '../index';
import { getResult } from './facade';

// Not passing any props! Global state interactions' details defined within the component. 
//  Just to point that is possible
export const ResultPanel = () => {
    const {
        winnerName, 
        winnerScore,
        runnerUpName, 
        runnerUpScore
      } = useSync(getResult);    
    return (
        <div data-testid="ResultPanel">
            <div data-testid="winner">
                <span data-testid="winnerName">{winnerName}</span>:
                <span data-testid="winnerScore">{winnerScore}</span>
            </div>
            <div data-testid="runnerUp">
                <span data-testid="runnerUpName">{runnerUpName}</span>:
                <span data-testid="runnerUpScore">{runnerUpScore}</span>
            </div>
        </div>
    );
}
    