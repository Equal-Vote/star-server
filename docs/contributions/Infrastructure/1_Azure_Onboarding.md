---
layout: default
title: 💎️ Azure Onboarding
nav_order: 1
parent: ☁️ Infrastructure
grand_parent: Contribution Guide
---

# Azure Onboarding

Follow these steps to get access to Azure and the Dev Ops resources in general

## Find a buddy

Here are the people who have permissions to add new users (along with their slack alias)

 * Mike Franze (@Mike Franze)
 * Arend Peter Castelein (@Arend Peter)
 * Evans Tucker (@evans)

Ping one of them on slack to help with this section

## Create user in Active Directory

Executed by Buddy
1. Open "Users" Service
1. Create User: New user > Create New User
1. Give them their email & password so they can login

Executed by You
1. Open portal.azure.com
1. Login using the new email (should be ...@starvoting.onmicrosoft.com ), and the temp password
1. You'll be prompted to reset your password
1. You'll also be prompted to get the Microsoft Authenticator app and link it with a QR code
1. Make sure to select "work or school" when logging into the app
1. Congrats! You're in 🎉

## Assign Subscription Permissions

These next steps will give them permissions to modify resources

Executed by Buddy
1. Open "Subscriptions" Service
1. Open Azure subscription 1 > Access control (IAM)
1. Open Add > Role Assignment
1. Under Role > Priviledged administrator roles select "Contributor"
1. (Optional) If they'll need to create other users choose "Owner" instead
1. Under Member, select the corresponding member


## (Optional) If they need access to create other users...

Executed by Buddy
1. Open "Users" Service
1. Select User > Assigned Roles
1. Add "User Administrator" for creating users
1. (Optional) If they'll need to create other user admins users you can assign "Global Administrator" instead

## (Optional) GitHub Write Access

DevOps contributors will be making a lot of their changes through Terraform, and in the early stages we'll need to make a lot of commits to test things.

If this user needs write access to terraform do the following

Executed by Buddy
1. Open https://github.com/Equal-Vote/terraform
1. Under Settings > Collaborators and teams, add the user and give write access
1. (Optional) There's also the star-server-infra repo, but that's being deprecated in favor of the terraform repo