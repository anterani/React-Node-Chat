import { useEffect, useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { io } from 'socket.io-client';

import { ClientDataType, ResponseType, SocketStateEnum } from './types';
import Connection from './pages/Connection.page';
import Chat from './pages/Chat.page';
import Modal from './components/Modal.component';

const socket = io(process.env.REACT_APP_SOCKET as string, {
  transports: ['websocket'],
});

const App = () => {
  const pagesRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [clientData, setClientData] = useState<null | ClientDataType>(null);
  const [socketState, setSocketState] = useState<SocketStateEnum>(SocketStateEnum.idle);

  //socket.io error events
  useEffect(() => {
    const handleSocketError = () => {
      setClientData(null);
      setSocketState(SocketStateEnum.idle);
      setErrorMessage('connection error');
    };

    socket.on('disconnect', () => handleSocketError());
    socket.on('connect_error', () => handleSocketError());

    socket.on('spam-protection', () => setErrorMessage('You are sending messages too fast. Wait for a few seconds.'));
  }, []); //eslint-disable-line

  const join = (data: ClientDataType) => {
    setSocketState(SocketStateEnum.joining);

    socket.emit('join', data, (response: ResponseType) => {
      if (!response.status) {
        setErrorMessage(response.message || 'unknown error');
        setSocketState(SocketStateEnum.idle);
      } else {
        setClientData(data);
        setSocketState(SocketStateEnum.joined);
      }
    });
  };

  const leave = () => {
    socket.emit('leave', (response: ResponseType) => {
      if (response.status) {
        setClientData(null);
        setSocketState(SocketStateEnum.idle);
      }
    });
  };

  const clearSocketError = () => setErrorMessage(null);

  return (
    <>
      {/* Modal that display error messages */}
      <CSSTransition in={errorMessage !== null} nodeRef={modalRef} classNames='fade' timeout={200} unmountOnExit>
        <div ref={modalRef} className='fixed z-50'>
          <Modal onClose={clearSocketError}>{errorMessage}</Modal>
        </div>
      </CSSTransition>

      {/* Current page based on socketState */}
      <SwitchTransition mode='out-in'>
        <CSSTransition
          nodeRef={pagesRef}
          key={(socketState === SocketStateEnum.joined).toString()}
          classNames='fade'
          timeout={200}
          unmountOnExit
        >
          <div ref={pagesRef} className='w-full min-h-screen flex justify-center items-center'>
            {socketState !== SocketStateEnum.joined ? (
              <Connection socketConnecting={socketState === SocketStateEnum.joining} join={join} />
            ) : (
              <Chat socket={socket} clientData={clientData} onLeave={leave} />
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </>
  );
};

export default App;
