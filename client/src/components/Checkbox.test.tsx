import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './Checkbox.component';

describe('Checkbox component', () => {
  it('should handle param', () => {
    const mockOnChange = jest.fn(() => null);
    render(<Checkbox checked={true} onChange={mockOnChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(mockOnChange).toBeCalledWith(false);
  });
});
