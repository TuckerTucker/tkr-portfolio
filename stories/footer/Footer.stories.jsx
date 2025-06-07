import React from 'react';
import Footer from '@/components/layout/footer';

export default {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    docs: {
      description: {
        component: 'Footer component as used in the application.',
      },
    },
  },
};

export const Default = () => <Footer />;