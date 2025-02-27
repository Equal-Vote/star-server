---
layout: default
title: ️♾️ DevOps Local Setup
nav_order: 2
parent: ☁️ DevOps
grand_parent: Contribution Guide
---

# DevOps Onboarding

Here's how you get setup for Devops development on your local machine

## Repos

These are the 3 repos that are currently in use

* [terraform](https://github.com/Equal-Vote/terraform) : Represents Azure resources as code
* [argocd](https://github.com/Equal-Vote/argocd) : Configuration for deploying and updating kubernetes
* [star-server-infra](https://github.com/Equal-Vote/star-server-infra) : Terraform for current Azure stack. This will be deprecated in favor of terraform later

The vision is to represent all our services using Kubernetes (including BetterVoting but also all Equal Vote Projects), and the Azure resources will be the minimum necessary for supporting Kubernetes

## Local Software

Install the following CLI clients

 * [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows?tabs=azure-cli) : For managing Azure resources
 * [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): For managing Kubernetes cluster
 * [Terraform](https://developer.hashicorp.com/terraform/install): For deploying terraform configuration to Azure
 * [Helm](https://helm.sh/docs/intro/install/): A tool for installing kubernetes configurations from the community (Kubernetes equivalent of brew or pip install)

 > For Windows Only: I recommend creating a bin foler under `C:\Users\<your user>\bin`, then to add it to your path search "Edit the system environment variables" > "Environment Variables..." > "Path" and add the folder

## Add equalvote cluster to your kubeconfig

The following command will open a browser for you to login

```
az aks get-credentials --resource-group equalvote --name equalvote
```

## Create your own namespace in Kubernetes

This allows you to experiment and create resources under your namespace without affecting the rest of the stack.

Create Namespace

```
kubectl create ns <your name>
```

Set namespace to be the default
```
kubectl config set-context --current --namespace=<your name>
```

All future commands will use your namespace by default, but if you wall to look at other namespaces you can add flags

Some examples
```
kubectl get pods -n=default # View pods in the default namespace
kubectl get pods -A # View pods across all namespaces
```

## Deploying a new Service in Kuberneties

> NOTE: This method is for adhoc deployments and experiments. To formally introduce a service into production this should be represented in code in the argocd repo

If you want to deploy a new service (ex. Keycloak or Matomo), here's what you do

1. Search for a corresponding helm chart on [Artifact Hub](https://artifacthub.io/), but if you can find an official helm chart on the service's website even better

2. Install helm chart

```
helm install <name of service> <chart name> -n <optional namespace>

# example
helm install matomo bitname/matomo -n namespace
```

3. Verify Deployment

List the pods to check on which pods were added, and verify that they're all in the running state

```
kubectl get pods -A
```

## Adding a service to ArgoCD

TODO

## Educational Resources

* [Cloud Native Landscape](https://landscape.cncf.io/): Coalition of open source projects. CNCF helps guide which projects are mature ("graduated") and ready for production use
* [Kubernetes Crash Course](https://www.youtube.com/watch?v=s_o8dwzRlu4)
* [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)