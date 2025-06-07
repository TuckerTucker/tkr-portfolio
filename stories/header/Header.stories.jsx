import React from 'react';
import Header from '@/components/layout/header';

export default {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    docs: {
      description: {
        component: 'Header component (not currently used in the app).',
      },
    },
  },
};

export const Default = () => <Header />;