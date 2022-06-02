import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button.component';

describe('Button component', () => {
  it('should display without optional params', () => {
    render(<Button>Button!</Button>);
    const button = screen.getByRole('button');

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(button.innerHTML).toBe('Button!');
  });

  it('should handle optional params', () => {
    render(
      <Button type='submit' disabled={true}>
        Button!
      </Button>
    );

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button.innerHTML).toBe('Button!');
  });

  it('should handle custom class', () => {
    render(<Button className='hidden'>Button!</Button>);
    expect(screen.getByRole('button')).toHaveClass('hidden');
  });

  it('should call onClick when clicked', () => {
    const onClickMock = jest.fn();

    render(<Button onClick={onClickMock}>Button!</Button>);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(onClickMock).toBeCalled();
  });
});
