import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Shield, Star, Trophy, Award, CheckCircle, Heart } from 'lucide-react';

const StatusCard = () => (
  <Paper
    elevation={3}
    sx={{
      p: 4,
      mb: 6,
      background: 'linear-gradient(135deg, #f0f9ff 0%, #fff1f2 100%)',
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Shield size={32} color="#2563eb" style={{ marginRight: 12 }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Clickbait Detection Active
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CheckCircle size={20} color="#22c55e" />
        <Typography>Article summarized in 30 seconds</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CheckCircle size={20} color="#22c55e" />
        <Typography>Clickbait score: 85% (High risk)</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Heart size={20} color="#ef4444" />
        <Typography>Time saved: 5 minutes</Typography>
      </Box>
    </Box>
  </Paper>
);

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        background: color,
      }}
    >
      <Icon size={24} color="white" />
    </Box>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

interface StepProps {
  number: number;
  title: string;
  description: string;
  color: string;
}

const Step = ({ number, title, description, color }: StepProps) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2,
        background: color,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
        {number}
      </Typography>
    </Box>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

const features = [
  {
    icon: Shield,
    title: 'Instant Summaries',
    description: 'Get the key points of any article in seconds, not minutes. Our AI reads so you don\'t have to.',
    color: 'linear-gradient(to right, #2563eb, #3b82f6)',
  },
  {
    icon: Award,
    title: 'Clickbait Detection',
    description: 'Advanced AI analysis identifies misleading headlines and saves you from disappointing content.',
    color: 'linear-gradient(to right, #dc2626, #ef4444)',
  },
  {
    icon: Star,
    title: 'Quality Scoring',
    description: 'Every article gets a quality score so you know what\'s worth your valuable time.',
    color: 'linear-gradient(to right, #7c3aed, #8b5cf6)',
  },
  {
    icon: Trophy,
    title: 'Time Tracking',
    description: 'See exactly how much time you\'ve saved by avoiding clickbait and low-quality content.',
    color: 'linear-gradient(to right, #059669, #10b981)',
  },
  {
    icon: CheckCircle,
    title: 'Browser Extension',
    description: 'Works seamlessly across all your favorite websites with our lightweight browser extension.',
    color: 'linear-gradient(to right, #d97706, #f59e0b)',
  },
  {
    icon: Heart,
    title: 'Privacy First',
    description: 'Your browsing habits stay private. We process content without storing your personal data.',
    color: 'linear-gradient(to right, #db2777, #ec4899)',
  },
];

const steps = [
  {
    number: 1,
    title: 'Paste or Share',
    description: 'Simply paste an article URL or use our browser extension when you encounter suspicious content.',
    color: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
  },
  {
    number: 2,
    title: 'AI Analysis',
    description: 'Our advanced AI reads the full article, analyzes the content quality, and detects clickbait patterns.',
    color: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
  },
  {
    number: 3,
    title: 'Get Results',
    description: 'Receive an instant summary, clickbait score, and recommendation in seconds, not minutes.',
    color: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)'
  }
];

export const Features = () => {
  return (
    <>
      <StatusCard />

      <Box id="features" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" gutterBottom>
            Superpowers Included
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Our AI hero comes equipped with everything you need to defeat clickbait and save your time
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box id="how-it-works" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" gutterBottom>
            How Our Hero Works
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Three simple steps to freedom from clickbait
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step) => (
            <Grid item xs={12} md={4} key={step.number}>
              <Step {...step} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}; 