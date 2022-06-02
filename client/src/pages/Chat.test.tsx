import { render, screen, fireEvent, act } from '@testing-library/react';
import { Socket } from 'socket.io-client';

import Chat from './Chat.page';

//used to mock socket.on('message')
let mockOnMessage: (({ from, body }: { from: string; body: string }) => void) | undefined = undefined;

window.HTMLElement.prototype.scrollTo = jest.fn(); //scrollTo event mock
const socket = jest.createMockFromModule<Socket>('socket.io-client');

socket.removeAllListeners = jest.fn();
socket.emit = jest.fn();
socket.on = (_: any, callback: any) => (mockOnMessage = callback);

describe('Chat page', () => {
  const mockClientData = { name: 'TestName', room: 'TestRoom' };
  const mockOnLeave = jest.fn();

  beforeEach(() => {
    mockOnMessage = undefined;
    jest.clearAllMocks();
  });

  it('should handle message sending', () => {
    render(<Chat clientData={mockClientData} onLeave={mockOnLeave} socket={socket} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test Message' } });
    fireEvent.click(screen.getAllByRole('button')[1]);

    expect(socket.emit).toBeCalledWith('message', 'Test Message');
  });

  it('should display messages', () => {
    render(<Chat clientData={mockClientData} onLeave={mockOnLeave} socket={socket} />);

    act(() => mockOnMessage && mockOnMessage({ from: mockClientData.name, body: 'Test Message 1' }));
    act(() => mockOnMessage && mockOnMessage({ from: mockClientData.name, body: 'Test Message 2' }));
    act(() => mockOnMessage && mockOnMessage({ from: 'OtherName', body: 'Test Message 3' }));

    expect(screen.getByText('Test Message 1')).toHaveClass('ml-auto');
    expect(screen.getByText('Test Message 2')).toHaveClass('ml-auto');
    expect(screen.getByText('Test Message 3')).toHaveClass('mr-auto');
  });

  it('should handle history limit', () => {
    render(<Chat clientData={mockClientData} onLeave={mockOnLeave} socket={socket} historyLimit={2} />);

    act(() => mockOnMessage && mockOnMessage({ from: mockClientData.name, body: 'Test Message 1' }));
    act(() => mockOnMessage && mockOnMessage({ from: mockClientData.name, body: 'Test Message 2' }));

    expect(screen.getByText('Test Message 1')).toBeInTheDocument();
    expect(screen.getByText('Test Message 2')).toBeInTheDocument();

    act(() => mockOnMessage && mockOnMessage({ from: 'OtherName', body: 'Test Message 3' }));
    act(() => mockOnMessage && mockOnMessage({ from: 'OtherName', body: 'Test Message 4' }));

    expect(screen.queryByText('Test Message 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Message 2')).not.toBeInTheDocument();
    expect(screen.getByText('Test Message 3')).toBeInTheDocument();
    expect(screen.getByText('Test Message 4')).toBeInTheDocument();
  });

  it('should handle auto scroll state', () => {
    render(<Chat clientData={mockClientData} onLeave={mockOnLeave} socket={socket} />);

    fireEvent.click(screen.getByRole('checkbox'));
    act(() => mockOnMessage && mockOnMessage({ from: mockClientData.name, body: 'Test Message 1' }));

    expect(window.HTMLElement.prototype.scrollTo).toBeCalledTimes(1);
  });
});
