import React from 'react';
import { Header } from '../components/Header/Header';
import '../components/Header/Header.css';

export const Basic = () => <Header />;

export const WithBackground = () => (
  <div style={{ backgroundColor: '#f3f4f6', padding: '1rem' }}>
    <Header />
  </div>
);

export default {
  title: 'Header',
  component: Header,
};
