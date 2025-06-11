import React from 'react';
import { AppBar, Toolbar, Box, Link, Typography } from '@mui/material';
import { Shield, Coffee } from 'lucide-react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href}
    sx={{ 
      color: 'text.primary',
      textDecoration: 'none',
      fontSize: '1rem',
      transition: 'color 0.2s',
      '&:hover': {
        color: 'primary.main'
      }
    }}
  >
    {children}
  </Link>
);

export const Navigation = () => {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Shield size={24} color="#2563eb" style={{ marginRight: 8 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #2563eb, #dc2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            The Clickbait Crusader
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <NavLink href="#analyze">Analyze</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <Link 
            href="https://buymeacoffee.com/jmorg" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Coffee size={24} />
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 