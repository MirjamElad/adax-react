import { addRule } from 'adax-core';

const candidatesList = [
  { name: 'Red', votes: 0 },
  { name: 'Blue', votes: 0 }
];

export const voteFor = ({name}: {name: string}, stores = { candidatesList }) => {
  const candidate = stores.candidatesList.find((c) => c.name === name);
  if (candidate) {
    candidate.votes++;
  }
}

export const getResult = (_: any = null, stores = { candidatesList }) => {
  const sortedByVotes = stores.candidatesList.sort((a, b) => b.votes - a.votes);
  return { 
    winnerName: sortedByVotes[0].name,
    winnerScore: sortedByVotes[0].votes,
    runnerUpName: sortedByVotes[1].name, 
    runnerUpScore: sortedByVotes[1].votes 
  }; 
};

export const getMood = (
  { name }: { name: string },
  stores = { candidatesList }
) => {
  const result = getResult(null, stores);
  if (result.winnerScore == result.runnerUpScore) {
    return {mood: '😐'};
  }
  if (result.winnerName == name) {
    return {mood: '😃'};
  }
  return {mood: '🤬'};
}


const skipMoodChangeAfterVote = (_w: { name: string }, _r: { name: string }, stores = { candidatesList }) => {
  //Get result before applying the vote
  const result = getResult(null, stores);
  //If it's a tie, do NOT skip as there won't be a tie after the vote!
  if (result.winnerScore === result.runnerUpScore) {
    return false;
  }
  //If the winner is the one who's getting an extra vote, skip as it will still be the winner after the vote
  if (result.winnerName === _w.name) {
    /* istanbul ignore next */
    return true;
  }
  //If the runner up is the one who's being voted but is too far, skip as it will still be loosing after the vote
  if ( result.winnerScore > result.runnerUpScore + 1) {
    /* istanbul ignore next */
    return true;
  }
  //In any other case do NOT skip as there will be a change (i.e. Tie)
  return false;
};

const loadRules = () => {  
  addRule({writeFn: voteFor, queryFn: getResult});
  addRule({writeFn: voteFor, queryFn: getMood, skip: skipMoodChangeAfterVote});
};

loadRules();
