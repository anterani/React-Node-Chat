import { render, screen, fireEvent } from '@testing-library/react';
import Form from './Form.component';

describe('Form component', () => {
  it('should work without optional params', () => {
    const mockSubmit = jest.fn();
    render(<Form onSubmit={mockSubmit}>Test Form</Form>);

    const form = screen.getByText('Test Form');
    fireEvent.submit(form);

    expect(form).toHaveClass('flex-col');
    expect(mockSubmit).toBeCalled();
  });

  it('should handle optional params', () => {
    const mockSubmit = jest.fn();
    render(
      <Form onSubmit={mockSubmit} horizontal={true} className='mt-20'>
        Test Form
      </Form>
    );

    const form = screen.getByText('Test Form');
    fireEvent.submit(form);

    expect(form).not.toHaveClass('flex-col');
    expect(form).toHaveClass('mt-20');
    expect(mockSubmit).toBeCalled();
  });
});
