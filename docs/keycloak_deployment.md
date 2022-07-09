---
layout: default
title: Deploy Keycloak
nav_order: 3000
---

# Keycloak Deployment Guide

Keycloak is the service we use for managing users and login sessions. Here we'll cover how to setup a fresh keycloak service from scratch

## Get access to the STAR AWS account

An admin will need to set you up with a IAM user. Here's the current list of slack users:

 * ``@Arend Peter``
 * ``@Mike Franze``
 * ``@Scott PlusPlus``
 * ``@evans``

Contact one fo them and ask them to run the following setups

 * Login to the AWS Console, and navigate to the IAM Service
 * Click Users in the side bar, and select "Add Users", and fill out the following
  * Give them a username
  * Check both programatic and console access
  * Use an auto generated password
  * Check "User must create a new password ..."
 * Configure Permissions (I'm giving admin instructions, but you can adjust accordingly)
  * Goto "Attach existing policies directly"
  * Check "AdministratorAccess"
 * Click next until you see the user info
 * Send username and password back to the person who contacted you

You can now login at https://831091939144.signin.aws.amazon.com/console
 
## Run Instance

1. Go to the EC2 Console
1. Select "Launch Instance"
1. Configure as follows
    * Name: Keycloak Server
    * OS: Amazon Linux 2 64 Bit (I used ami-0cff7528ff583bf9a but you can use the latest)
    * Instance Type: t2.micro (Keycloak needs at least .5 GB of memory and this is the cheapest one with 1 GB of memory)
    * Key Pair: Create Key pair (RSA/pem), and download the pem file (keep the pem file in a safe you'll need it later to access the instance)
    * Network Settings: Select "Allow HTTPs traffic from the internet"
    * Configure Storage: Select advanced, 16 GB (default is 8 GB, that might be enough but it just seemed low to me), and set Encrypted to Yes, and KMS Key to aws/ebs
    * Advanced Details: Set "Stop - Hibernate behaviour" to Enable (this should make it easier to maintain processes in case we need to reboot the server)
1. Go to view instances, and wait for instance to be in a Running State

## Allocate Elastic IP

By default, EC2 instance will receive a new IP address on every reboot

To keep it the same we need to allocate an elastic IP

1. Within the EC2 console, go to the "Network & Security" section and select "Elastic IPs"
1. Click "Allocate Elastic IP"
1. Use the default options, and hit allocate
1. Under Actions, select "Associate Elastic IP Address"
1. In the instance section, select the Keycloak instance
1. Click "Associate"
1. Copy the IP Address for future use (we'll be referencing it several times throughout the setup)

## Allow port 8080 in security group

The default keycloak setup uses port 8080, but this will be blocked in the default EC2 setup, follow these steps to fix that

1. Search for the EC2 service
1. Select the keycloak instance under Instaces
1. Open the Security tab
1. Click the security group (probably ``sg-.... (launch-wizard-1)``)
1. Edit inbound rules
1. Add rules
1. Set 8080 for port, and "Anywhere IPv4" for source
1. Save Rules

## Login to instance

To SSH to the instance using the .pem file follow instructions here
https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html

## Setup Docker

Follow "Installing Docker on Amazon Linux 2" steps here
https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-container-image.html

## Create HTTPS cert

Keycloak won't run without HTTPS

Here's the commands I ran for this

```
openssl req -newkey rsa:2048 -nodes \
  -keyout server.key.pem -x509 -days 3650 -out server.crt.pem
chmod 755 server.key.pem
```

> I actually found 2 sources for this [official keycloak documentation](https://www.keycloak.org/docs/latest/server_installation/#_setting_up_ssl) and [stackoverflow](https://stackoverflow.com/questions/49859066/keycloak-docker-https-required). But stackoverflow was much easier so that's what I used above


## Run Keycloak via Docker

Run Keycloak with the certs from the previous step

```
docker run \
  --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=password \
  -e KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/conf/server.crt.pem \
  -e KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/conf/server.key.pem \
  -v $PWD/server.crt.pem:/opt/keycloak/conf/server.crt.pem \
  -v $PWD/server.key.pem:/opt/keycloak/conf/server.key.pem \
  -p 8443:8443 \
  quay.io/keycloak/keycloak:latest \
  start-dev > /dev/null 2>&1 &
```

More details: [keycloak official](https://www.keycloak.org/getting-started/getting-started-docker) , [stackoverflow](https://stackoverflow.com/questions/49859066/keycloak-docker-https-required)

## Verify website

Now it should be viewable from the web. Navigate to https://<allocated ip>:8443 and you should get the keycloak console

> Why my browser say insecure!!! So it is using HTTPS, but the browser doesn't trust our certificate since we made it ourselves without a certificate authority. We'll need to figure out that step later

For the remaining setup head over to "configure keycloak"