import { useEffect, useRef } from 'react';
import Container from './Container.component';
import { IoCloseCircle } from 'react-icons/io5';

type ModalPropsType = {
  children: React.ReactNode;
  onClose: () => void;
};

const Modal = (props: ModalPropsType) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => modalRef.current?.focus(), [modalRef]);

  const onCloseHandler = () => props.onClose && props.onClose();

  return (
    <div
      className='fixed flex justify-center items-center w-full min-h-screen max-h-screen bg-slate-800'
      tabIndex={-1}
      ref={modalRef}
    >
      {/* Top button */}
      <button
        onClick={onCloseHandler}
        className='fixed top-0 bg-slate-900 px-9 py-3 rounded-b-full transition hover:scale-110 active:scale-90'
      >
        <IoCloseCircle className='h-8 w-8' />
      </button>

      {/* Content */}
      <Container>{props.children}</Container>
    </div>
  );
};

export default Modal;
