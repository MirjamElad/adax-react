import * as React from 'react';

interface FanGroupPickerProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}
const getClasses = (isActive: boolean) => {
    if (isActive) {
      return 'bg-blue-100 font-bold text-black';
    } else {
      return 'bg-gray-100 text-gray-600';
    }
  };
const FanGroupPicker: React.FC<FanGroupPickerProps> = ({ options, value, onChange }) => {
  const [selectedValue, setSelectedValue] = React.useState(value);

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
    onChange(value);
  };
  return (
    <div className="flex justify-center">
      {options.map((option, index) => (
        <div key={index} className={`mr-4 px-2 ${getClasses(selectedValue === option.value)}`} onClick={() => handleRadioChange(option.value)}>
          <input
            data-testid={`checkbox-${option.value}`}
            type="checkbox"
            name="radio-group"
            value={option.value}
            checked={selectedValue === option.value}         
            onChange={() => {}}   
            className="mr-4"
          />
          <label>{option.label}</label>
        </div>
      ))}
    </div>
  );
};

export default FanGroupPicker;