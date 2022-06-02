import { useState } from 'react';

import { ClientDataType } from '../types';
import Container from '../components/Container.component';
import Form from '../components/Form.component';
import InputGroup from '../components/InputGroup.component';
import Button from '../components/Button.component';
import { IoArrowForwardCircle } from 'react-icons/io5';

type ConnectionPropsType = {
  join: (data: ClientDataType) => void;
  socketConnecting: boolean;
};

const validateChange = (value: string): boolean => {
  if (/^[a-zA-Z0-9]*$/.test(value)) {
    return true;
  }

  return false;
};

const Connection = (props: ConnectionPropsType) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const nameChangeHandler = (value: string) => validateChange(value) && setName(value);
  const roomChangeHandler = (value: string) => validateChange(value) && setRoom(value);

  const submitHandler = () => props.join({ name, room });

  return (
    <Container className='my-auto'>
      <Form onSubmit={submitHandler}>
        <InputGroup label='name' name='name' onChange={nameChangeHandler} value={name} />
        <InputGroup label='room' name='room' onChange={roomChangeHandler} value={room} />
        <Button type='submit' className='mt-2 mx-auto' disabled={props.socketConnecting}>
          <IoArrowForwardCircle className='w-8 h-8' />
        </Button>
      </Form>
    </Container>
  );
};

export default Connection;
