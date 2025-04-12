import {test, expect, Page, } from '@playwright/test';
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import path from 'path';
import { randomUUID } from 'crypto';
import {  API_BASE_URL } from './helperfunctions';
import user from '../playwright/auth/user.json';
const userId = user.cookies.find((cookie) => cookie.name === 'AUTH_SESSION_ID')?.value;

let electionId = '';
const voterIds = ['1', '2', '3', '4', '5'];
const makeVotes = (numVotes: number, minRank:number) => {
    const votes:{ candidateName: string, value: number }[] = [];
    for (let i = 0; i < numVotes; i++) {
        votes.push({ candidateName: `Candidate ${i + 1}`, value: i + minRank });
    }
    return votes;
}

test.describe('Add Voters', () => {
    test.beforeEach(async ({page}) => {
        const apiContext =  page.request;
        const response = await apiContext.post(`${API_BASE_URL}/elections`, {
            data: {
                "Election": {
                    "title": "Playwright Test Election",
                    "owner_id": "6eb084c7-c572-40d1-bf53-26a62095285e",
                    "description": "",
                    "state": "draft",
                    "frontend_url": "",
                    "races": [
                        {
                            "title": "Race 1",
                            "race_id": randomUUID(),
                            "num_winners": 1,
                            "voting_method": "STAR",
                            "candidates": [
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 1"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 2"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 3"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 4"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 5"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 6"
                                }
                            ],
                            "description": "Race 1 Description"
                        },
                        {
                            "title": "Race 2",
                            "race_id": randomUUID(),
                            "num_winners": 1,
                            "voting_method": "RankedRobin",
                            "candidates": [
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 1"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 2"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 3"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 4"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 5"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 6"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 7"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 8"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 9"
                                },
                                {
                                    "candidate_id": randomUUID(),
                                    "candidate_name": "Candidate 10"
                                }
                            ],
                            "description": "Race 2 Description"
                        }
                    ],
                    "settings": {
                        "voter_authentication": {
                            "voter_id": true,
                            "email": false,
                            "ip_address": false
                        },
                        "ballot_updates": false,
                        "public_results": true,
                        "time_zone": "America/Denver",
                        "random_candidate_order": false,
                        "require_instruction_confirmation": true,
                        "term_type": "election",
                        "voter_access": "closed"
                    },
                    "is_public": false
                }
            }
        })
        const responseBody = await response.json();
        const election = responseBody.election as Election;
        electionId = election.election_id;
    });

    test('add voters', async ({page}) => {
    
        await page.goto(`/${electionId}/admin/voters`);
        await page.getByRole('button', {name: 'Add Voters'}).click();
        await page.getByLabel('Voter Data').fill(voterIds.join('\n'));
        await page.getByRole('button', {name: 'Submit'}).click();


    });
    test('vote in election restricted by ID', async ({page}) => {
        await page.goto(`/`);
        const response = await page.request.post(`${API_BASE_URL}/Election/${electionId}/rolls`, {
            data: {
                "electionRoll": [
                    {
                        "state": "approved",
                        "voter_id": "1"
                    },
                    {
                        "state": "approved",
                        "voter_id": "2"
                    },
                    {
                        "state": "approved",
                        "voter_id": "3"
                    },
                    {
                        "state": "approved",
                        "voter_id": "4"
                    },
                    {
                        "state": "approved",
                        "voter_id": "5"
                    }
                ]
            }
        });
        const responseJson = await response.ok();
        console.log(`response status: ${responseJson}`);
        await expect(responseJson).toBe(true);
        await page.goto(`/${electionId}/admin/voters`);

        await expect(page.getByRole('button', { name: 'Add Voters' })).toBeVisible();
        await expect(page.getByText('1–5 of 5')).toBeVisible();
        await page.getByRole('link', { name: 'Admin Home' }).click();
        await page.getByRole('button', { name: 'Finalize Election' }).click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('open')).toBeVisible();
        await expect(page.getByRole('button', { name: 'edit-election-details' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled();
        await page.getByLabel('edit-Race 1').click();
        await expect(page.getByRole('button', { name: 'delete-candidate-number-6' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'drag-candidate-number-6' })).toBeDisabled();
        await expect(page.locator('#candidate-name-7')).not.toBeVisible();
    
        await expect(page.getByRole('radiogroup').locator('label').filter({ hasText: 'Single-Winner' })).toBeDisabled();
        await page.getByRole('button', { name: 'Voting Method' }).click();
        await expect(page.getByLabel('STAR', { exact: true })).toBeDisabled();
        await expect(page.getByRole('textbox', { name: 'Title' })).toBeDisabled();
        await expect(page.getByRole('textbox', { name: 'Description' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByRole('heading', { name: '(no description)' })).toBeVisible();
        await expect(page.getByText('(start and end times disabled)')).toBeVisible();
        await expect(page.getByRole('button', { name: 'View Results' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Share Election' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Make results private' })).toBeVisible();
        await page.getByRole('link', { name: 'Voting Page' }).click();
        await page.getByLabel('Voter ID').fill(voterIds[0]);
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('button', { name: 'Vote' }).click();

        await page.getByLabel(('I have read the instructions')).click();
        let votes = makeVotes(6, 0);
        for (const vote of votes) {
            await page.locator(`button[name="${vote.candidateName}_rank-${vote.value}"]`).click();
        }
        const submitButton = await page.getByRole('button', { name: 'Submit Ballot' });
        await expect(submitButton).toBeDisabled();
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByLabel(('I have read the instructions')).click();
        await expect(submitButton).toBeEnabled();
        votes = makeVotes(6, 1);
        for (const vote of votes) {
            await page.locator(`button[name="${vote.candidateName}_rank-${vote.value}"]`).click();
        }
        await submitButton.click();
        await page.getByLabel('Send Ballot Receipt Email?').click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('link', { name: 'Voting Page' }).click();
        await page.getByLabel('Voter ID').fill(voterIds[0]);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('button', { name: 'Vote' })).not.toBeVisible();
        expect(page.getByRole('heading', { name: 'Ballot Submitted' })).toBeVisible();
        expect(page.getByRole('link', { name: 'View Results' })).toBeVisible();
        await page.getByRole('button', { name: 'Clear' }).click();
        await page.getByLabel('Voter ID').fill(voterIds[1]);
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('button', { name: 'Vote' }).click();
        await page.getByLabel(('I have read the instructions')).click();
        votes = makeVotes(6, 0);
        for (const vote of votes) {
            await page.locator(`button[name="${vote.candidateName}_rank-${vote.value}"]`).click();
        }
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByLabel(('I have read the instructions')).click();
        votes = makeVotes(6, 1);
        for (const vote of votes) {
            await page.locator(`button[name="${vote.candidateName}_rank-${vote.value}"]`).click();
        }
        await submitButton.click();
        await page.getByLabel('Send Ballot Receipt Email?').click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('heading', { name: 'Thank you for voting!' })).toBeVisible();
        await page.getByRole('link', { name: 'Voters' }).click();
        await page.getByLabel('Voters').getByRole('combobox').click();
        await page.getByRole('option', { name: 'false' }).getByRole('checkbox').click();
        await page.locator('#menu- > .MuiBackdrop-root').click();
        await expect(page.getByText('1–2 of 2')).toBeVisible();
        expect(page.getByRole('rowheader', { name: '1' })).toBeVisible();
        expect(page.getByRole('rowheader', { name: '2' })).toBeVisible();




    });

        
    test.afterEach(async ({ page }) => {
        //delete election when finished
        if (electionId) {
        await page.request.delete(`${API_BASE_URL}/election/${electionId}`);
        console.log(`deleted election: ${electionId}`);
    }})
});
