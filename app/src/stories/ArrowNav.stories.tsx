import React from 'react';
import { ArrowNav } from '../components/ArrowNav/ArrowNav';

// Basic story for ArrowNav
export const ArrowNavBasic = () => (
  <div style={{ position: 'relative', height: '200px', border: '1px dashed gray' }}>
    <ArrowNav 
      onPrevious={() => console.log('Previous clicked')} 
      onNext={() => console.log('Next clicked')} 
    />
  </div>
);

export default {
  title: 'Arrow nav',
  component: ArrowNav,
};
