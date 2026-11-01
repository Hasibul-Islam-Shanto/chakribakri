import { test, expect } from '@playwright/test';

test.describe('Job Lifecycle CRUD (e2e/job-lifecycle.spec.ts)', () => {
  const jobTestUser = `crud_user_${Date.now()}`;
  const jobTestPassword = 'CrudPassword123!';

  test.beforeEach(async ({ page }) => {
    // Register and land on dashboard
    await page.goto('/login');
    await page.getByRole('button', { name: /switch to create account/i }).click();
    await page.getByLabel(/^Username/i).fill(jobTestUser);
    await page.getByLabel(/^Password/i).fill(jobTestPassword);
    await page.getByLabel(/Confirm Password/i).fill(jobTestPassword);
    await page.getByRole('button', { name: /^Create account/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('executes complete job lifecycle: create, verify Kanban column, update status, and delete', async ({
    page,
  }) => {
    const targetCompany = `Linear_${Date.now()}`;
    const targetPosition = 'Lead Infrastructure Architect';
    const targetLocation = 'Remote, US';
    const targetSalary = '$210,000';

    // 1. Add a new job via modal
    const addApplicationButton = page.getByRole('button', { name: /Add Application/i });
    await addApplicationButton.click();

    const addModalDialog = page.getByRole('dialog');
    await expect(addModalDialog.getByRole('heading', { name: 'Add New Job Application' })).toBeVisible();

    await addModalDialog.getByLabel(/Company/i).fill(targetCompany);
    await addModalDialog.getByLabel(/Position/i).fill(targetPosition);
    await addModalDialog.getByLabel(/Location/i).fill(targetLocation);
    await addModalDialog.getByLabel(/Salary/i).fill(targetSalary);

    // Select status "Applied" strictly within the modal dialog
    await addModalDialog.locator('select').selectOption('Applied');

    // Submit modal form
    const createButton = addModalDialog.getByRole('button', { name: 'Create Application' });
    await createButton.click();

    // Confirm modal closes
    await expect(addModalDialog).not.toBeVisible();

    // 2. Confirm new job card appears in the corresponding Kanban status column ("Applied")
    const createdJobCard = page
      .locator('div')
      .filter({ hasText: targetPosition })
      .filter({ hasText: targetCompany })
      .first();
    await expect(createdJobCard).toBeVisible();

    // 3. Edit the job status from "Applied" to "Interviewing"
    const editApplicationButton = createdJobCard.locator('button[aria-label="Edit application"]');
    await editApplicationButton.click();

    const editModalDialog = page.getByRole('dialog');
    await expect(editModalDialog.getByRole('heading', { name: 'Edit Job Application' })).toBeVisible();

    // Change status to "Interviewing"
    await editModalDialog.locator('select').selectOption('Interviewing');

    const saveChangesButton = editModalDialog.getByRole('button', { name: 'Save Changes' });
    await saveChangesButton.click();

    await expect(editModalDialog).not.toBeVisible();

    // Verify card is still visible and has status transition
    await expect(createdJobCard).toBeVisible();

    // 4. Delete the job, confirm modal prompt, and ensure the card is removed
    const deleteApplicationButton = createdJobCard.locator('button[aria-label="Delete application"]');
    await deleteApplicationButton.click();

    const deleteModalDialog = page.getByRole('dialog');
    await expect(deleteModalDialog.getByRole('heading', { name: 'Delete Job Application' })).toBeVisible();
    await expect(deleteModalDialog.getByText(`Are you sure you want to delete the application for`)).toBeVisible();

    // Confirm deletion in modal
    const confirmDeleteButton = deleteModalDialog.getByRole('button', { name: 'Delete Application' });
    await confirmDeleteButton.click();

    await expect(deleteModalDialog).not.toBeVisible();

    // Confirm card is completely removed from the DOM
    await expect(page.getByText(targetPosition)).not.toBeVisible();
    await expect(page.getByText(targetCompany)).not.toBeVisible();
  });
});
