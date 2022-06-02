import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal.component';

describe('Modal component', () => {
  it('should handle params', () => {
    const mockOnClose = jest.fn();

    render(<Modal onClose={mockOnClose}>Modal Content!</Modal>);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Modal Content!')).toBeVisible();
    expect(mockOnClose).toBeCalled();
  });
});
