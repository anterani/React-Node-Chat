import { render, screen, fireEvent } from '@testing-library/react';
import Connection from './Connection.page';

describe('Connection page', () => {
  it('should handle params', () => {
    const mockJoin = jest.fn();
    render(<Connection join={mockJoin} socketConnecting={false} />);

    const nameInput = screen.getByLabelText('name');
    const roomInput = screen.getByLabelText('room');

    fireEvent.change(nameInput, { target: { value: 'TestName' } });
    fireEvent.change(roomInput, { target: { value: 'TestRoom' } });
    fireEvent.click(screen.getByRole('button'));

    expect(nameInput).toHaveValue('TestName');
    expect(roomInput).toHaveValue('TestRoom');
    expect(mockJoin).toBeCalledWith({ name: 'TestName', room: 'TestRoom' });
  });

  it('should validate correctly', () => {
    const mockJoin = jest.fn();
    render(<Connection join={mockJoin} socketConnecting={false} />);

    const nameInput = screen.getByLabelText('name');
    const roomInput = screen.getByLabelText('room');

    fireEvent.change(nameInput, { target: { value: 'Test @ Name' } });
    fireEvent.change(roomInput, { target: { value: 'Test @ Room' } });
    fireEvent.click(screen.getByRole('button'));

    expect(nameInput).toHaveValue('');
    expect(roomInput).toHaveValue('');
    expect(mockJoin).toBeCalledWith({ name: '', room: '' });
  });

  it('should disable button if socketConnecting is true', () => {
    render(<Connection join={() => {}} socketConnecting={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
