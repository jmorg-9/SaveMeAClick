import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { Features } from '../../components/Features';

describe('Features', () => {
  it('renders all step numbers', () => {
    render(
      <ThemeProvider theme={theme}>
        <Features />
      </ThemeProvider>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders step titles and descriptions', () => {
    render(
      <ThemeProvider theme={theme}>
        <Features />
      </ThemeProvider>
    );
    expect(screen.getByText('Paste or Share')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Get Results')).toBeInTheDocument();
    expect(screen.getByText(/Simply paste an article URL or use our browser extension/)).toBeInTheDocument();
    expect(screen.getByText(/Our advanced AI reads the full article/)).toBeInTheDocument();
    expect(screen.getByText(/Receive an instant summary, clickbait score/)).toBeInTheDocument();
  });

  it('renders all step headings', () => {
    render(
      <ThemeProvider theme={theme}>
        <Features />
      </ThemeProvider>
    );

    const steps = screen.getAllByRole('heading', { level: 5 });
    expect(steps.length).toBeGreaterThan(0);
  });
}); 