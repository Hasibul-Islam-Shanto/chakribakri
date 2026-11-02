import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { JobDashboard } from '@/components/dashboard/job-dashboard';
import { JobRecord } from '@/types/job';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

const mockJobsFixture: JobRecord[] = [
  {
    id: 'job-1',
    company: 'Stripe',
    position: 'Staff Infrastructure Engineer',
    location: 'Remote, US',
    salary: '$220,000',
    status: 'Wishlist',
    applicationDate: new Date('2026-01-10'),
    jobUrl: 'https://stripe.com/jobs/1',
    notes: 'Exciting infra role',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'job-2',
    company: 'Linear',
    position: 'Senior Frontend Engineer',
    location: 'San Francisco, CA',
    salary: '$180,000',
    status: 'Applied',
    applicationDate: new Date('2026-02-15'),
    jobUrl: 'https://linear.app/jobs/2',
    notes: 'Referred by teammate',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'job-3',
    company: 'Vercel',
    position: 'Full Stack Engineer',
    location: 'Remote',
    salary: '$175,000',
    status: 'Interviewing',
    applicationDate: new Date('2026-03-01'),
    jobUrl: 'https://vercel.com/jobs/3',
    notes: 'Technical interview next week',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'job-4',
    company: 'Figma',
    position: 'Systems Architect',
    location: 'New York, NY',
    salary: '$240,000',
    status: 'Offer',
    applicationDate: new Date('2026-03-20'),
    jobUrl: 'https://figma.com/jobs/4',
    notes: 'Offer letter received',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'job-5',
    company: 'Datadog',
    position: 'Site Reliability Engineer',
    location: 'Boston, MA',
    salary: '$160,000',
    status: 'Rejected',
    applicationDate: new Date('2026-01-05'),
    jobUrl: 'https://datadog.com/jobs/5',
    notes: 'Position closed internally',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('Dashboard Kanban & Table Views (components/job-dashboard.test.tsx)', () => {
  it('renders job cards accurately across all 5 status columns in Kanban mode', () => {
    render(<JobDashboard initialJobList={mockJobsFixture} initialView="kanban" />);

    const expectedColumnTitles = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

    // Verify all 5 status column badges are present in the DOM
    expectedColumnTitles.forEach((columnTitle) => {
      const columnBadgeElements = screen.getAllByText(new RegExp(`^${columnTitle}$`, 'i'));
      expect(columnBadgeElements.length).toBeGreaterThanOrEqual(1);
    });

    // Verify job cards are rendered with company and position title
    expect(screen.getByText('Staff Infrastructure Engineer')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();

    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();

    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
    expect(screen.getByText('Vercel')).toBeInTheDocument();

    expect(screen.getByText('Systems Architect')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();

    expect(screen.getByText('Site Reliability Engineer')).toBeInTheDocument();
    expect(screen.getByText('Datadog')).toBeInTheDocument();
  });

  it('prunes displayed jobs in real-time when searching by company name and position title', () => {
    render(<JobDashboard initialJobList={mockJobsFixture} initialView="kanban" />);

    const searchInputElement = screen.getByRole('searchbox', { name: /search applications/i });

    // Search by company name "Linear"
    fireEvent.change(searchInputElement, { target: { value: 'Linear' } });

    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();

    expect(screen.queryByText('Stripe')).not.toBeInTheDocument();
    expect(screen.queryByText('Vercel')).not.toBeInTheDocument();
    expect(screen.queryByText('Figma')).not.toBeInTheDocument();
    expect(screen.queryByText('Datadog')).not.toBeInTheDocument();

    // Search by position title "Infrastructure"
    fireEvent.change(searchInputElement, { target: { value: 'Infrastructure' } });

    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Staff Infrastructure Engineer')).toBeInTheDocument();

    expect(screen.queryByText('Linear')).not.toBeInTheDocument();
    expect(screen.queryByText('Vercel')).not.toBeInTheDocument();

    // Clear search using the clear button
    const clearSearchButton = screen.getByRole('button', { name: /clear search query/i });
    fireEvent.click(clearSearchButton);

    // All jobs should be restored
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Vercel')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Datadog')).toBeInTheDocument();
  });

  it('persists active search filtering when switching between Kanban and Table views', () => {
    render(<JobDashboard initialJobList={mockJobsFixture} initialView="kanban" />);

    const searchInputElement = screen.getByRole('searchbox', { name: /search applications/i });
    const switchToTableButton = screen.getByRole('button', { name: /switch to table view/i });
    const switchToKanbanButton = screen.getByRole('button', { name: /switch to kanban view/i });

    // Apply a search filter while in Kanban view
    fireEvent.change(searchInputElement, { target: { value: 'Figma' } });

    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Systems Architect')).toBeInTheDocument();
    expect(screen.queryByText('Stripe')).not.toBeInTheDocument();

    // Switch view to Table mode
    fireEvent.click(switchToTableButton);

    // Verify Table view is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Role & Company')).toBeInTheDocument();

    // Search input should still retain the search query
    expect(searchInputElement).toHaveValue('Figma');

    // Table view must strictly display the filtered job only
    const tableElement = screen.getByRole('table');
    expect(within(tableElement).getByText('Figma')).toBeInTheDocument();
    expect(within(tableElement).getByText('Systems Architect')).toBeInTheDocument();
    expect(within(tableElement).queryByText('Stripe')).not.toBeInTheDocument();
    expect(within(tableElement).queryByText('Linear')).not.toBeInTheDocument();

    // Switch back to Kanban mode
    fireEvent.click(switchToKanbanButton);

    // Filter should still be actively persisted in Kanban mode
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(searchInputElement).toHaveValue('Figma');
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.queryByText('Stripe')).not.toBeInTheDocument();
  });
});
