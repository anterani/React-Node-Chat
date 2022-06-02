import { render, screen } from '@testing-library/react';
import Container from './Container.component';

describe('Container component', () => {
  it('should display content', () => {
    render(<Container>Content!</Container>);
    expect(screen.getByText('Content!')).toHaveClass('bg-slate-900', 'p-4');
  });

  it('should handle optional params', () => {
    render(
      <Container background='light' padding='small' className='mt-20'>
        Content!
      </Container>
    );
    expect(screen.getByText('Content!')).toHaveClass('bg-slate-200', 'text-slate-800', 'p-2');
  });

  it('should handle dark background', () => {
    render(<Container background='dark'>Content!</Container>);
    expect(screen.getByText('Content!')).toHaveClass('bg-slate-800');
  });
});
