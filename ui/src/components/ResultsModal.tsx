import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Link,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import { X, Shield, Clock, Heart, Star } from 'lucide-react';

interface ContentQuality {
  readability: number;
  objectivity: number;
  depth: number;
}

interface AnalysisResult {
  title: string;
  assessment: string;
  qualityScore: number;
  clickbaitScore: number;
  timeSaved: number;
  processingTime: number;
  contentQuality: ContentQuality;
  summary: string;
  keyPoints: string[];
  url: string;
}

interface ResultsModalProps {
  result: AnalysisResult;
  open: boolean;
  onClose: () => void;
}

const getAssessmentColor = (clickbaitScore: number) => {
  if (clickbaitScore >= 70) {
    return 'error.main'; // Red for high clickbait
  } else if (clickbaitScore >= 40) {
    return 'warning.main'; // Orange for moderate clickbait
  } else if (clickbaitScore >= 20) {
    return 'info.main'; // Blue for low clickbait
  } else {
    return 'success.main'; // Green for very low clickbait
  }
};

export const ResultsModal = ({ result, open, onClose }: ResultsModalProps) => {
  const assessmentColor = getAssessmentColor(result.clickbaitScore);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 4, 
          background: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative'
        }}>
          <IconButton
            onClick={onClose}
            aria-label="close"
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <X size={24} />
          </IconButton>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
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
            <hr />
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Article Title
            </Typography>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              {result.title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mt: 2, 
                fontWeight: 500,
                color: assessmentColor,
                transition: 'color 0.3s ease'
              }}
            >
              {result.assessment}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {/* Quality Metrics */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Quality Analysis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    mb: 1
                  }}>
                    <Shield size={24} />
                  </Box>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {result.qualityScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Quality
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'error.main',
                    color: 'white',
                    mb: 1
                  }}>
                    <Star size={24} />
                  </Box>
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    {result.clickbaitScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clickbait Risk
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    color: 'white',
                    mb: 1
                  }}>
                    <Clock size={24} />
                  </Box>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    {Math.round(result.timeSaved)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Minutes Saved
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'info.main',
                    color: 'white',
                    mb: 1
                  }}>
                    <Heart size={24} />
                  </Box>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                    {result.processingTime.toFixed(1)}s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processing Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Content Quality Breakdown */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Content Quality
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Readability
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={result.contentQuality.readability}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(37, 99, 235, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main'
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {result.contentQuality.readability}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Objectivity
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={result.contentQuality.objectivity}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(37, 99, 235, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main'
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {result.contentQuality.objectivity}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Content Depth
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={result.contentQuality.depth}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(37, 99, 235, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main'
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {result.contentQuality.depth}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* Article Summary */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Article Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {result.summary}
            </Typography>
          </Paper>

          {/* Key Points */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Key Points
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {result.keyPoints.map((point, index) => (
                <Typography 
                  component="li" 
                  key={index} 
                  variant="body1" 
                  sx={{ mb: 1 }}
                >
                  {point}
                </Typography>
              ))}
            </Box>
          </Paper>

          {/* Source Link */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Link 
              href={result.url} 
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
              View Original Article
            </Link>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 