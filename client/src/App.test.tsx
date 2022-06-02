import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

let mockSocketEvents: { event: string; callback: () => void }[] = []; //store socket.on events
let mockResponseStatus: { status: boolean; message?: string } = { status: true }; //server side response message

window.HTMLElement.prototype.scrollTo = jest.fn();
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => {
      return {
        on: (event: string, callback: any) => {
          mockSocketEvents.push({ event, callback });
        },
        //if data provided in emit, then callback is at index 1
        emit: (_: string, ...args: any[]) => (args[1] ? args[1](mockResponseStatus) : args[0](mockResponseStatus)),
        removeAllListeners: jest.fn(),
      };
    }),
  };
});

const byTextContent = (text: string, node: Element | null) => {
  const hasText = (node: Element) => node.textContent === text;
  const nodeHasText = node ? hasText(node) : false;
  const childrenDontHaveText = node ? Array.from(node.children).every((child) => !hasText(child)) : false; //eslint-disable-line

  return nodeHasText && childrenDontHaveText;
};

const getByTextContent = (text: string) => {
  return screen.getByText((_, node) => byTextContent(text, node));
};

const findByTextContent = async (text: string) => {
  return await screen.findByText((_, node) => byTextContent(text, node));
};

const getEventByName = (name: string) => {
  return mockSocketEvents.find((mockEvent) => {
    if (mockEvent.event === name) {
      return true;
    } else {
      return false;
    }
  });
};

describe('App', () => {
  beforeEach(() => {
    mockSocketEvents = [];
    mockResponseStatus = { status: true };

    jest.clearAllMocks();
  });

  it('should handle connection', async () => {
    render(<App />);

    const nameInput = screen.getByLabelText('name');
    const roomInput = screen.getByLabelText('room');

    fireEvent.change(nameInput, { target: { value: 'TestName' } });
    fireEvent.change(roomInput, { target: { value: 'TestRoom' } });
    expect(nameInput).toHaveValue('TestName');
    expect(roomInput).toHaveValue('TestRoom');

    fireEvent.click(screen.getByRole('button'));

    await findByTextContent('name: TestName');
    expect(getByTextContent('room: TestRoom')).toBeInTheDocument();
  });

  it('should handle join rejection', async () => {
    render(<App />);

    const nameInput = screen.getByLabelText('name');
    const roomInput = screen.getByLabelText('room');

    fireEvent.change(nameInput, { target: { value: 'TestName' } });
    fireEvent.change(roomInput, { target: { value: 'TestRoom' } });

    mockResponseStatus = { status: false };
    fireEvent.click(screen.getByRole('button'));
    await screen.findByText('unknown error');
  });

  it('should go back to connection page on successful leave', async () => {
    render(<App />);

    const nameInput = screen.getByLabelText('name');
    const roomInput = screen.getByLabelText('room');

    fireEvent.change(nameInput, { target: { value: 'TestName' } });
    fireEvent.change(roomInput, { target: { value: 'TestRoom' } });
    fireEvent.click(screen.getByRole('button'));

    await findByTextContent('name: TestName');

    mockResponseStatus = { status: false }; //leave rejected, should stay on chat page
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(getByTextContent('name: TestName')).toBeInTheDocument();

    mockResponseStatus = { status: true }; //leave successful, should go back to connection page
    fireEvent.click(screen.getAllByRole('button')[0]);
    await screen.findByLabelText('name');
  });

  it('should display error message', async () => {
    render(<App />);

    act(() => getEventByName('disconnect')?.callback());
    await screen.findByText('connection error');

    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);
    await waitFor(() => expect(screen.queryByText('connection error')).not.toBeInTheDocument());

    act(() => getEventByName('connect_error')?.callback());
    await screen.findByText('connection error');

    fireEvent.click(buttons[0]);
    await waitFor(() => expect(screen.queryByText('connection error')).not.toBeInTheDocument());

    act(() => getEventByName('spam-protection')?.callback());
    await screen.findByText('You are sending messages too fast. Wait for a few seconds.');
  });
});
