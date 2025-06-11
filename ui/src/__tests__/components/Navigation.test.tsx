import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { Navigation } from '../../components/Navigation';

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    );

    expect(screen.getByText('The Clickbait Crusader')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders coffee icon link', () => {
    render(
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    );

    const coffeeLink = screen.getByRole('link', { name: '' });
    // Find the link with the correct href
    const coffeeHref = 'https://buymeacoffee.com/jmorg';
    const found = Array.from(screen.getAllByRole('link')).find(link => link.getAttribute('href') === coffeeHref);
    expect(found).toBeTruthy();
    expect(found).toHaveAttribute('target', '_blank');
    expect(found).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the AppBar', () => {
    render(
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    );

    const appBar = screen.getByRole('banner');
    expect(appBar).toBeInTheDocument();
  });
}); 