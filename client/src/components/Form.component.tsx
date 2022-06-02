import { FormEvent } from 'react';

type FormPropsType = {
  children: React.ReactNode;
  onSubmit: () => void;
  horizontal?: boolean;
  className?: string;
};

const Form = (props: FormPropsType) => {
  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit && props.onSubmit();
  };

  const customClass = () => (props.className ? ' ' + props.className : '');

  return (
    <form className={'flex gap-2' + (props.horizontal ? '' : ' flex-col') + customClass()} onSubmit={submitHandler}>
      {props.children}
    </form>
  );
};

export default Form;
