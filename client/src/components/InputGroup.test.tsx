import { render, screen, fireEvent } from '@testing-library/react';
import InputGroup from './InputGroup.component';

describe('InputGroup component', () => {
  it('should work without optional params', () => {
    const mockOnChange = jest.fn();
    render(<InputGroup name='test' value='test-value' onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-value' } });

    expect(input).toHaveValue('test-value');
    expect(input).toHaveClass('bg-slate-800');
    expect(input).toHaveAttribute('minLength', '3');
    expect(input).toHaveAttribute('maxLength', '20');
    expect(mockOnChange).toBeCalledWith('new-value');
  });

  it('should work with optional params', () => {
    const mockOnChange = jest.fn();
    render(
      <InputGroup
        name='test'
        value='test-value'
        onChange={mockOnChange}
        background='darker'
        label='name'
        inputClass='mt-20'
        formClass='mb-20'
        max={100}
        min={20}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-value' } });

    expect(input).toHaveValue('test-value');
    expect(input).toHaveClass('bg-slate-900', 'mt-20');
    expect(input).toHaveAttribute('minLength', '20');
    expect(input).toHaveAttribute('maxLength', '100');
    expect(input.parentElement).toHaveClass('mb-20'); //eslint-disable-line
    expect(mockOnChange).toBeCalledWith('new-value');
  });
});
