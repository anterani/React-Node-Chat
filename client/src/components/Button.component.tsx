type ButtonPropsType = {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset' | undefined;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const Button = (props: ButtonPropsType) => {
  const customClass = () => (props.className && props.className.length > 0 ? props.className : '');
  const onClickHandler = () => props.onClick && props.onClick();

  return (
    <button
      type={props.type || 'button'}
      disabled={props.disabled}
      onClick={onClickHandler}
      className={
        customClass() +
        ' py-1 px-3 rounded-lg shadow-lg transition disabled:transition-none' +
        ' disabled:transform-none disabled:opacity-50 hover:scale-110 active:scale-90'
      }
    >
      {props.children}
    </button>
  );
};

export default Button;
