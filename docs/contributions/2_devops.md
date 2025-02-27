---
layout: default
title: ☁️ DevOps
nav_order: 2
parent: Contribution Guide
has_children: true
---

# DevOps

We're in the process of hosting our service on 💧Azure. Here's a high level overview of all the components

 * Kuberneties Cluster: Hosted our Azure and runs the backend. In the future it will run keycloak as well
 * Keycloak: Manages all the users and authentication for BetterVoting. We're in the process of migrating this from AWS to Azure
 * Terraform: The infrastructure is deployed using terraform via GitHub actions. You can find the repo [here](https://github.com/Equal-Vote/terraform)
