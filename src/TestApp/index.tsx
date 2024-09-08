import React from 'react';
import { FansGroup }   from './FansGroup';
import { ResultPanel }   from './ResultPanel';
export { ResultPanel }   from './ResultPanel';
export { FansGroup }   from './FansGroup';
import FanGroupPicker from './FanGroupPicker';
import { voteFor, getMood } from './facade';

const options = [
    { value: 'none', label: 'none' },
    { value: 'Red', label: 'Red' },
    { value: 'Blue', label: 'Blue' },
  ];

export const VoteApp = () => {
    const [duplicateFanGroup, setDuplicateFanGroup] = React.useState("none");
    const handleRadioChange = (value: string) => {
      setDuplicateFanGroup(value);
    };
    return (
        <>
            <div data-testid="VoteApp">
                <div>
                    {/* Passing both queries and actions as props opens the door to components re-usability! */}
                    <FansGroup index={0} name="Red" query={getMood} action={voteFor} />
                    <FansGroup index={1} name="Blue" query={getMood} action={voteFor} />
                </div>
                <ResultPanel />
            </div>
            <p>Duplicate FAN's group:
            <span className="ml-2"><b>{duplicateFanGroup}</b></span>
            </p>
            <FanGroupPicker
                options={options}
                value={duplicateFanGroup}
                onChange={handleRadioChange}
            />
            {duplicateFanGroup !== 'none' && <FansGroup data-testid="dynamic-fangroup" index={2} name={duplicateFanGroup} query={getMood} action={voteFor} />}
        </>
)};
export default VoteApp;