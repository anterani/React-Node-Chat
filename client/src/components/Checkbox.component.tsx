import { ChangeEvent } from 'react';

type CheckboxPropsType = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox = (props: CheckboxPropsType) => {
  const changeHandler = (event: ChangeEvent<HTMLInputElement>) =>
    props.onChange && props.onChange(event.target.checked);

  return (
    <input
      type='checkbox'
      checked={props.checked}
      onChange={changeHandler}
      className='h-7 w-7 rounded-lg shadow-lg appearance-none bg-slate-900 checked:bg-slate-200 transition'
    />
  );
};

export default Checkbox;
