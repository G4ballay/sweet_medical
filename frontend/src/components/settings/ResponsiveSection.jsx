// components/settings/ResponsiveSection.jsx
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { cloneElement } from 'react';

function ResponsiveSection({ title, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sectionId = title.toLowerCase().replaceAll(' ', '-');

  if (!isMobile) {
    return children;
  }

  return (
    <Accordion disableGutters>
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        id={`${sectionId}-header`}
        aria-controls={`${sectionId}-content`}
        sx={{
        minHeight: 72,
        '& .MuiAccordionSummary-content': {
        my: 1,
        },
      }}>
        <Typography 
        sx={{
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        }}>
          {title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails id={`${sectionId}-content`}>
        {cloneElement(children, {
          variant: 'plain',
        })}
      </AccordionDetails>
    </Accordion>
  );
}

export default ResponsiveSection;