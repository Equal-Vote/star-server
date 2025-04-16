import {  API_BASE_URL } from './helperfunctions';
import { test, expect } from '@playwright/test';

let electionId = '';
test.describe('Create Election', () => {
    test('create poll', async ({ page }) => {
        page.goto('/');
        await page.getByRole('button', { name: 'New Election' }).click();
        await page.getByLabel('Poll', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.fill('input[name="election-title"]', 'Playwright Test Poll');
        //wait until there is only one continue button
        while ((await page.getByRole('button', { name: 'Continue' }).evaluateAll((el) => el)).length > 1) {
        continue
        }
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByLabel('No').click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByText('Allows multiple votes per device').click();
        await expect(page.getByText('draft')).toBeVisible();
        const url = await page.url();
        const urlArray = url.split('/');
        electionId = urlArray[urlArray.length - 2];
        expect(await page.getByLabel('no limit')).toBeChecked();

    });

    test('create election with email list', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'New Election' }).click();
        await page.getByLabel('Election', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.fill('input[name="election-title"]', 'Playwright Test Election');
        //wait until there is only one continue button
        while ((await page.getByRole('button', { name: 'Continue' }).evaluateAll((el) => el)).length > 1) {
        continue
        }
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByLabel('Yes').click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByRole('button', { name: 'Email List Provide a list of' }).click();
        await expect(page.getByText('draft')).toBeVisible();
        const url = await page.url();
        const urlArray = url.split('/');
        electionId = urlArray[urlArray.length - 2];
        await page.getByRole('link', { name: 'Voters' }).click();
        await page.waitForURL(`**/${electionId}/admin/voters`)
        await page.getByRole('button', { name: 'Add Voters' }).click();
        await expect(await page.getByLabel('Email')).toBeChecked();


    });

    test('create election with ID List', async ({ page }) => {
            await page.goto('/');
        await page.getByRole('button', { name: 'New Election' }).click();
        await page.getByLabel('Election', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.fill('input[name="election-title"]', 'Playwright Test Election');
        //wait until there is only one continue button
        while ((await page.getByRole('button', { name: 'Continue' }).evaluateAll((el) => el)).length > 1) {
        continue
        }
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByLabel('Yes').click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByText('ID List').click();
        await expect(page.getByText('draft')).toBeVisible();
        const url = await page.url();
        const urlArray = url.split('/');
        electionId = urlArray[urlArray.length - 2];
        await page.getByRole('link', { name: 'Voters' }).click();
        

    });

    test('create election with one per device', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'New Election' }).click();
        await page.getByLabel('Election', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.fill('input[name="election-title"]', 'Playwright Test Election');
        //wait until there is only one continue button
        while ((await page.getByRole('button', { name: 'Continue' }).evaluateAll((el) => el)).length > 1) {
        continue
        }
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByLabel('No').click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByText('one person, one vote').click();
        await expect(page.getByText('draft')).toBeVisible();
        const url = await page.url();
        const urlArray = url.split('/');
        electionId = urlArray[urlArray.length - 2];
        expect(await page.getByLabel('device')).toBeChecked();
    });

    test('create election with whitespace title', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'New Election' }).click();
        await page.getByLabel('Election', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.fill('input[name="election-title"]', ' ');
        await expect(page.getByRole('button', { name: 'Continue' }).first()).toBeDisabled();
    });

    test('create election with too long title', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'New Election' }).click();
        await page.getByLabel('Election', { exact: true }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.fill('input[name="election-title"]', 'a'.repeat(51));
        await expect(page.getByRole('button', { name: 'Continue' }).first()).toBeDisabled();
    });

    test.afterEach(async ({ page }) => {
        //delete election when finished
        if (electionId) {
        await page.request.delete(`${API_BASE_URL}/election/${electionId}`);
        console.log(`deleted election: ${electionId}`);
        }
    });
});