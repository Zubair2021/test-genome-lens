import { test, expect } from '@playwright/test'

test.describe('GenomeLens Basic Flow', () => {
  test('should load welcome screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('GenomeLens')).toBeVisible()
    await expect(page.getByText('New Project')).toBeVisible()
  })

  test('should create new project', async ({ page }) => {
    await page.goto('/')
    await page.getByText('New Project').click()
    
    await page.fill('input[placeholder="My Sequence Project"]', 'Test Project')
    await page.getByText('Create Project').click()
    
    await expect(page.getByText('Test Project')).toBeVisible()
  })

  test('should open workspace', async ({ page }) => {
    await page.goto('/')
    await page.getByText('New Project').click()
    await page.fill('input[placeholder="My Sequence Project"]', 'Test Project')
    await page.getByText('Create Project').click()
    
    // Should show workspace with sidebar
    await expect(page.getByText('Project Assets')).toBeVisible()
    await expect(page.getByText('Sequences')).toBeVisible()
  })
})



