import { forwardRef } from 'react';

type ContainerPropsType = {
  children: React.ReactNode;
  background?: 'dark' | 'light';
  padding?: 'small' | 'large';
  className?: string;
};

const Container = forwardRef<HTMLDivElement, ContainerPropsType>((props, ref) => {
  const bgClass = () => {
    switch (props.background) {
      case 'light':
        return ' bg-slate-200 text-slate-800';
      case 'dark':
        return ' bg-slate-800';
      default:
        return ' bg-slate-900';
    }
  };

  const paddingClass = () => (props.padding === 'small' ? ' p-2' : ' p-4');
  const customClass = () => (props.className && props.className.length > 0 ? ' ' + props.className : '');

  return (
    <div ref={ref} className={'rounded-lg shadow-lg' + paddingClass() + bgClass() + customClass()}>
      {props.children}
    </div>
  );
});

export default Container;
