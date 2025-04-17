import { test, expect } from '@playwright/test';

import {  API_BASE_URL } from './helperfunctions';
let electionId = '';

test('full runthrough', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'New Election' }).click();
	await page.getByLabel('Election', { exact: true }).click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.locator('#election-title').fill('Playwright Test Election');
	//wait until there is only one continue button
	while (
		(
			await page
				.getByRole('button', { name: 'Continue' })
				.evaluateAll((el) => el)
		).length > 1
	) {
		continue;
	}
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByLabel('No').click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'demo' }).click();
	await expect(page.getByText('draft')).toBeVisible();
	expect(await page.getByLabel('no limit')).toBeChecked();
	const url = await page.url();
	const urlArray = url.split('/');
	electionId = urlArray[urlArray.length - 2];
	await page.getByRole('button', { name: 'edit-election-details' }).click();
	await page.fill(
		'input[name="election-title"]',
		'Playwright Test Election Updated'
	);
	await page.fill(
		'textarea[name="election-description"]',
		'Playwright Test Election Description'
	);
	await page.getByLabel('Enable Start/End Times?').click();
	await page.getByLabel('Time Zone').click();
	await page.getByRole('option', { name: 'Hawaii' }).click();
	await page.getByRole('option', { name: 'Hawaii' }).click();
	const endTimeInput = await page.getByTestId('end-time');
	const box = await endTimeInput.boundingBox();
	if (!box) {
		throw new Error('Could not find bounding box for end time input');
	}
	const { width, height } = box;
	console.log('width:', width, 'height:', height);
	await endTimeInput.click({
		position: {
			x: 0.75 * width,
			y: 16,
		},
	});
	await endTimeInput.pressSequentially('12122050');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('button', { name: 'edit-settings' }).click();
	await page
		.getByRole('checkbox', { name: 'Set Number of Rankings' })
		.click();
	await page.fill('input[name="rank-limit"]', '8');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByText('Add').click();
	await page.getByRole('textbox', { name: 'Title' }).fill('Race 1');
	await page
		.getByRole('textbox', { name: 'Description' })
		.fill('Race 1 Description');
	await page.getByRole('button', { name: 'Voting Method' }).click();
	await page.getByRole('radio', { name: 'STAR Voting' }).click();
	await expect(page.getByLabel('delete-candidate-number-2')).toBeDisabled();
	await expect(
		page.getByRole('button', { name: 'drag-candidate-number-2' })
	).toBeDisabled();
	for (let i = 1; i <= 6; i++) {
		await expect(page.locator(`#candidate-name-${i}`)).toBeEnabled();
		await page.locator(`#candidate-name-${i}`).fill(`Candidate ${i}`);
	}
	await page.getByRole('button', { name: 'Save' }).click();
	await page
		.getByRole('button', { name: 'Add' })
		.click({ timeout: 100000000 });
	const raceDialog = await page.getByRole('dialog', { name: 'Edit Race' });
	await raceDialog.getByRole('textbox', { name: 'Title' }).fill('Race 2');
	await raceDialog
		.getByRole('textbox', { name: 'Description' })
		.fill('Race 2 Description');
	await raceDialog.getByRole('button', { name: 'Voting Method' }).click();
	await page.getByLabel('Ranked Robin').click();
	for (let i = 1; i <= 10; i++) {
		await raceDialog
			.locator(`#candidate-name-${i}`)
			.fill(`Candidate ${i}`);
	}

	await page.getByLabel('drag-candidate-number-10').click();
	await page.getByLabel('delete-candidate-number-10').click();
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page.getByLabel('candidate-form-11')).not.toBeVisible();
	await page.locator('#candidate-name-10').fill('Candidate 10');
	const dragSource = await page.getByLabel('drag-candidate-number-10');
	const dragTarget = await page.getByRole('button', {
		name: 'drag-candidate-number-6',
	});
	await dragSource.dragTo(dragTarget);
	await expect(raceDialog.locator('#candidate-name-6')).toHaveValue(
		'Candidate 10'
	);
	await raceDialog.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('button', { name: 'Cast Ballot' }).click();
	const vote = async (page) => {
		await page.getByRole('link', { name: 'Vote', exact: true }).click();
		await page.waitForURL(`**/${electionId}/vote`)

		await expect(page.getByText('Test Mode')).toBeVisible({
			timeout: 10000000,
		});
		// const submitButton = await page.getByRole('button', {
		// 	name: 'Submit Ballot',
		// });
		// await expect(submitButton).toBeDisabled();
		await page.getByLabel('I have read the instructions').click();
		await page.locator('button[name="Candidate 1_rank-5"]').click();
		await page.locator('button[name="Candidate 2_rank-4"]').click();
		await page.locator('button[name="Candidate 3_rank-3"]').click();
		await page.locator('button[name="Candidate 4_rank-2"]').click();
		await page.locator('button[name="Candidate 5_rank-1"]').click();
		await page.locator('button[name="Candidate 6_rank-0"]').click();
		// await expect(submitButton).toBeDisabled();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByLabel('I have read the instructions').click();
		// await expect(submitButton).toBeEnabled();
		//check that the highest rank is 8
		const columnHeadings = await page.locator('.column-headings');
		const columnHeadingElements = await columnHeadings.evaluateAll(
			(elements) => elements.map((element) => element.textContent)
		);
		expect(columnHeadingElements.length).toBe(8);
		await page.locator('button[name="Candidate 1_rank-8"]').click();
		// await expect(submitButton).toBeDisabled();
		await page.locator('button[name="Candidate 2_rank-7"]').click();
		await page.locator('button[name="Candidate 3_rank-6"]').click();
		await page.locator('button[name="Candidate 4_rank-5"]').click();
		await page.locator('button[name="Candidate 5_rank-4"]').click();
		await page.locator('button[name="Candidate 6_rank-3"]').click();
		await page.locator('button[name="Candidate 7_rank-2"]').click();
		await page.locator('button[name="Candidate 8_rank-1"]').click();
		await page.getByRole('button', { name: 'Submit' }).click();
		await page.getByLabel('Send Ballot Receipt Email?').click();
		await page.getByRole('button', { name: 'Submit' }).click();
	};
	await vote(page);
	await page.getByRole('link', { name: 'Results' }).click();
	await page.waitForURL(`**/${electionId}/results`)
	await expect(
		page.getByText("There's only one vote so far.").first()
	).toBeVisible({ timeout: 100000000 });
	await page.getByRole('link', { name: 'Ballots' }).click();
	await page.waitForURL(`**/${electionId}/admin/ballots`)
	await expect(page.getByText('View Ballots')).toBeVisible({
		timeout: 10000000,
	});
	await page.getByRole('link', { name: 'Voting Page' }).click();
	await page.waitForURL(`**/${electionId}/`)
	await vote(page);
	await page.getByRole('link', { name: 'Results' }).click();
	await page.waitForURL(`**/${electionId}/results`)
	await expect(page.getByText('Candidate 1 Wins!')).toBeVisible({
		timeout: 10000000,
	});
});


test.afterEach(async ({ page }) => {
	//delete election when finished
	if (electionId) {
		await page.request.delete(`${API_BASE_URL}/election/${electionId}`);
		console.log(`deleted election: ${electionId}`);
	}
});
