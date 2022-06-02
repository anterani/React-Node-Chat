import { ChangeEvent } from 'react';

type InputGroupPropsType = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  background?: 'dark' | 'darker';
  formClass?: string;
  inputClass?: string;
  max?: number;
  min?: number;
};

const InputGroup = (props: InputGroupPropsType) => {
  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    props.onChange && props.onChange(event.target.value);
  };

  const inputBgClass = () => (props.background === 'darker' ? ' bg-slate-900' : ' bg-slate-800');
  const customFormClass = () => (props.formClass ? ' ' + props.formClass : '');
  const customInputClass = () => (props.inputClass ? ' ' + props.inputClass : '');

  return (
    <div className={'flex gap-2 justify-end items-center' + customFormClass()}>
      {props.label ? (
        <label htmlFor={props.name} id={props.name + '-label'}>
          {props.label}
        </label>
      ) : (
        ''
      )}
      <input
        aria-labelledby={props.label ? props.name + '-label' : ''}
        name={props.name}
        type='text'
        className={'outline-none rounded-lg text-center px-2' + inputBgClass() + customInputClass()}
        minLength={props.min || 3}
        maxLength={props.max || 20}
        required
        value={props.value}
        onChange={onChangeHandler}
      />
    </div>
  );
};

export default InputGroup;
