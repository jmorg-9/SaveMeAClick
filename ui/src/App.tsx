import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  ThemeProvider,
  Link,
  Fade,
  Grid,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Shield, ArrowRight, Coffee } from 'lucide-react';
import axios from 'axios';
import { theme } from './theme';
import { Features } from './components/Features';
import { Navigation } from './components/Navigation';
import { ResultsModal } from './components/ResultsModal';

interface AnalysisResult {
  title: string;
  assessment: string;
  summary: string;
  keyPoints: string[];
  url: string;
  qualityScore: number;
  timeSaved: number;
  processingTime: number;
  clickbaitScore: number;
  contentQuality: {
    readability: number;
    objectivity: number;
    depth: number;
  };
}

const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return import.meta.env.VITE_API_URL || '';
};

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AnalysisResult>(`${getApiUrl()}/summarize`, { url });
      setResult(response.data);
      setShowResults(true);
    } catch (err) {
      setError('Failed to analyze article. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Navigation />
        <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
          <Box sx={{ 
            textAlign: 'center',
            mb: { xs: 6, md: 8 }
          }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '3.5rem', md: '5.5rem' },
                fontWeight: 700,
                mb: 2,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontFamily: '"Space Grotesk", sans-serif',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 2px 10px rgba(37, 99, 235, 0.2)',
                textTransform: 'uppercase'
              }}
            >
              The Clickbait Crusader
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
              Your AI-powered hero in the fight against misleading headlines
            </Typography>

            {!showInput ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowInput(true)}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 50%, #be185d 100%)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <Shield />
                </Box>
                Start Fighting Clickbait
              </Button>
            ) : (
              <Fade in={showInput}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3,
                    maxWidth: '600px',
                    mx: 'auto'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Paste Article URL
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading || !url}
                      sx={{ 
                        minWidth: '120px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%) !important',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 50%, #be185d 100%) !important',
                        }
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <>
                          Analyze
                          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                            <ArrowRight />
                          </Box>
                        </>
                      )}
                    </Button>
                  </Box>
                  {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {error}
                    </Typography>
                  )}
                </Paper>
              </Fade>
            )}
          </Box>
          {result && (
            <ResultsModal
              result={result}
              open={showResults}
              onClose={() => setShowResults(false)}
            />
          )}

          <Features />
        </Container>

        <Box sx={{ 
          textAlign: 'center', 
          py: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            © 2025 The Clickbait Crusader. Fighting misleading headlines, one article at a time.
          </Typography>
          <Link 
            href="https://buymeacoffee.com/jmorg" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Support this project with a coffee ☕
          </Link>
        </Box>
      </Box>
    </ThemeProvider>
  );
} 