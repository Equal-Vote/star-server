import { type Page, expect } from '@playwright/test';
export const createElection = async (
    page:Page, 
    electionOrPoll:'Election' | 'Poll', 
    title:string, restricted:boolean, 
    choseVoters: 'Email List' | 'ID List' | 'Allows multiple votes per device' | 'one person, one vote') => 
    {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Election' }).click();
    await page.getByLabel(electionOrPoll, { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.fill('input[name="election-title"]', title);
    //wait until there is only one continue button
    while ((await page.getByRole('button', { name: 'Continue' }).evaluateAll((el) => el)).length > 1) {
      continue
    }
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel(restricted ? 'No' : 'Yes').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText(choseVoters).click();
    await expect(page.getByText('draft')).toBeVisible();
    const url = await page.url();
    const urlArray = url.split('/');
    return urlArray[urlArray.length - 2];
  }

export const API_BASE_URL = 'http://localhost:5000/API';
