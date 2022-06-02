import { Socket } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';

import { ClientDataType } from '../types';
import Container from '../components/Container.component';
import Form from '../components/Form.component';
import InputGroup from '../components/InputGroup.component';
import Button from '../components/Button.component';
import Checkbox from '../components/Checkbox.component';
import { IoArrowBackCircleOutline, IoSend } from 'react-icons/io5';

type ChatPropsType = {
  socket: Socket;
  onLeave: () => void;
  clientData: ClientDataType | null;
  historyLimit?: number;
};

type MessageType = {
  from: string;
  body: string;
};

type ChunkType = {
  side: 'right' | 'left';
  from: string;
  messages: string[];
};

const Chat = (props: ChatPropsType) => {
  const messagesContainer = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState(''); //current message input
  const [chunks, setChunks] = useState<ChunkType[]>([]); //contains messages.
  const [autoScroll, setAutoScroll] = useState(true);

  //auto scroll
  useEffect(() => {
    if (autoScroll) {
      const chatTotalHeight: number = messagesContainer.current?.scrollHeight || 0;
      const chatWindowHeight: number = messagesContainer.current?.clientHeight || 0;

      const scrollTop = chatTotalHeight - chatWindowHeight;
      messagesContainer.current?.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }
  }, [chunks, autoScroll]);

  //socket.io message event
  useEffect(() => {
    props.socket.on('message', ({ from, body }: MessageType) => {
      setChunks((prev) => {
        const newChunks = [...prev];

        /* If last message was from same user, then add message to last chunk.
           If last message was not from same user, then make new chunk with side different than last chunk. */
        if (newChunks.length > 0 && newChunks[newChunks.length - 1].from === from) {
          const oldChunk = newChunks[newChunks.length - 1];
          newChunks[newChunks.length - 1] = {
            from: oldChunk.from,
            side: oldChunk.side,
            messages: [...oldChunk.messages, body],
          };
        } else {
          const messages = [body];
          const side = newChunks.length === 0 || newChunks[newChunks.length - 1].side === 'left' ? 'right' : 'left';

          newChunks.push({ side, from, messages });
        }

        //limit stored messages to 200
        const totalMessages = newChunks.reduce((total, currentChunk) => total + currentChunk.messages.length, 0);
        if (totalMessages > (props.historyLimit || 200)) {
          if (newChunks[0].messages.length > 1) {
            newChunks[0].messages.splice(0, 1);
          } else {
            newChunks.splice(0, 1);
          }
        }

        return newChunks;
      });
    });

    return function cleanUp() {
      props.socket.removeAllListeners('message');
    };
  }, []); //eslint-disable-line

  const submitMessageHandler = () => {
    props.socket.emit('message', message.trim());
    setMessage('');
  };

  const changeMessageHandler = (value: string) => setMessage(value);
  const leaveHandler = () => props.onLeave();
  const changeAutoScrollHandler = (enabled: boolean) => setAutoScroll(enabled);

  return (
    <Container className='w-full max-w-3xl min-h-[calc(100vh-30px)] max-h-[calc(100vh-30px)] overflow-y-auto flex flex-col gap-3'>
      {/* Top Bar */}
      <div className='flex justify-between items-center gap-2'>
        <Container background='dark' padding='small'>
          name: <span className='font-bold'>{props.clientData?.name}</span>
        </Container>
        <Container background='dark' padding='small'>
          room: <span className='font-bold'>{props.clientData?.room}</span>
        </Container>
        <Button onClick={leaveHandler}>
          <IoArrowBackCircleOutline className='h-8 w-8' />
        </Button>
      </div>

      {/* Messages */}
      <Container
        ref={messagesContainer}
        className='flex-1 w-full flex flex-col gap-2 overflow-y-auto'
        background='dark'
      >
        {chunks.map((chunk) => {
          const isOwnChunk = chunk.from === props.clientData?.name;
          return chunk.messages.map((message, index) => (
            <Container
              background={isOwnChunk ? 'light' : undefined}
              className={chunk.side === 'right' ? 'ml-auto' : 'mr-auto'}
              padding='small'
              key={chunk.from + index}
            >
              {isOwnChunk || index > 0 ? '' : <b>{chunk.from}: </b>}
              {message}
            </Container>
          ));
        })}
      </Container>

      {/* Bottom bar */}
      <Container background='dark' padding='small' className='flex justify-center items-center gap-2'>
        {/* auto scroll checkbox */}
        <Checkbox checked={autoScroll} onChange={changeAutoScrollHandler} />
        {/* message form */}
        <Form onSubmit={submitMessageHandler} horizontal={true} className='flex-1'>
          <InputGroup
            name='message'
            background='darker'
            formClass='flex-1'
            inputClass='flex-1 py-1'
            min={1}
            max={100}
            onChange={changeMessageHandler}
            value={message}
          />
          <Button type='submit'>
            <IoSend className='h-7 w-7' />
          </Button>
        </Form>
      </Container>
    </Container>
  );
};

export default Chat;
