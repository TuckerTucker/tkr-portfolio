import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIInteractionShowcase from './AIInteractionShowcase';

// Mock window.addEventListener and removeEventListener
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: vi.fn(),
});

// Mock window.innerWidth for mobile testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('AIInteractionShowcase', () => {
  const mockHumanInterface = {
    title: 'Manual Process',
    description: 'Traditional workflow',
    elements: [
      {
        type: 'input',
        content: 'Manual data entry',
        action: 'Enter Data'
      }
    ],
    capabilities: ['Manual Entry']
  };

  const mockAIInterface = {
    title: 'AI-Enhanced Process',
    description: 'Automated workflow',
    elements: [
      {
        type: 'output',
        content: 'Automated processing',
        action: 'Auto-Process'
      }
    ],
    capabilities: ['Auto-Processing', 'AI Analysis']
  };

  const mockSharedData = [
    {
      type: 'Metric',
      label: 'Efficiency',
      value: '300% improvement'
    }
  ];

  const mockSyncIndicators = [
    { label: 'Data sync' }
  ];

  beforeEach(() => {
    // Reset window width for each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AIInteractionShowcase />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('displays human and AI interfaces when provided', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
      />
    );

    expect(screen.getByText('Manual Process')).toBeInTheDocument();
    expect(screen.getByText('AI-Enhanced Process')).toBeInTheDocument();
    expect(screen.getByText('Traditional workflow')).toBeInTheDocument();
    expect(screen.getByText('Automated workflow')).toBeInTheDocument();
  });

  it('renders interface elements correctly', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
      />
    );

    expect(screen.getByText('Manual data entry')).toBeInTheDocument();
    expect(screen.getByText('Automated processing')).toBeInTheDocument();
    expect(screen.getByText('Enter Data')).toBeInTheDocument();
    expect(screen.getByText('Auto-Process')).toBeInTheDocument();
  });

  it('displays capabilities when provided', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
      />
    );

    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('Auto-Processing')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
  });

  it('renders shared data when provided', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
        sharedData={mockSharedData}
      />
    );

    expect(screen.getByText('Shared Data & Coordination')).toBeInTheDocument();
    expect(screen.getByText('Efficiency')).toBeInTheDocument();
    expect(screen.getByText('300% improvement')).toBeInTheDocument();
  });

  it('shows sync indicators when enabled', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
        syncIndicators={mockSyncIndicators}
        showSync={true}
      />
    );

    // On desktop, sync indicators should be visible
    const syncElements = screen.getAllByTitle('Data sync');
    expect(syncElements.length).toBeGreaterThan(0);
  });

  it('hides sync indicators when disabled', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
        syncIndicators={mockSyncIndicators}
        showSync={false}
      />
    );

    expect(screen.queryByTitle('Data sync')).not.toBeInTheDocument();
  });

  it('handles mobile layout correctly', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
        syncIndicators={mockSyncIndicators}
        showSync={true}
      />
    );

    // Component should render without errors on mobile
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
        className="custom-class"
      />
    );

    const container = screen.getByRole('region');
    expect(container).toHaveClass('custom-class');
  });

  it('handles different element types correctly', () => {
    const complexInterface = {
      title: 'Complex Interface',
      elements: [
        { type: 'input', content: 'Input element' },
        { type: 'output', content: 'Output element' },
        { type: 'control', content: 'Control element' }
      ]
    };

    render(
      <AIInteractionShowcase
        humanInterface={complexInterface}
        aiInterface={mockAIInterface}
      />
    );

    expect(screen.getByText('Input element')).toBeInTheDocument();
    expect(screen.getByText('Output element')).toBeInTheDocument();
    expect(screen.getByText('Control element')).toBeInTheDocument();
  });

  it('handles empty interfaces gracefully', () => {
    render(
      <AIInteractionShowcase
        humanInterface={{}}
        aiInterface={{}}
      />
    );

    // Should render interface headers even with empty data
    expect(screen.getByText('Human Interface')).toBeInTheDocument();
    expect(screen.getByText('AI Interface')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <AIInteractionShowcase
        humanInterface={mockHumanInterface}
        aiInterface={mockAIInterface}
      />
    );

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'AI and Human Interface Showcase');
  });
});