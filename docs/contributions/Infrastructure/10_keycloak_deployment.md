---
layout: default
title: 🔑 Deploy Keycloak
nav_order: 10
parent: ☁️ Infrastructure
grand_parent: Contribution Guide
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
    * Key Pair: Create Key pair (RSA/pem), and download the pem file (keep the pem file in a safe you'll need it later to access the instance, I stored it in an S3 bucket "star-vote-secrets" in case others need it)
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
1. Repeat these steps for ports 8443, 443, 22, and 80. (Not sure if they're all necessary, but that's what I did and it may help during the cerbot step)

## Login to instance

To SSH to the instance using the .pem file follow instructions here
https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html

## Setup Docker

Follow "Installing Docker on Amazon Linux 2" steps here
https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-container-image.html

## Add HTTPs support

Keycloak won't run without HTTPS. To get it setup we associate the domain with the ip addresss, and then use certbot and lets encrypt to create a ssl cert. Having the cert allows us to run keycloak with https

1. Associate the domain

Currently we the server ip is 52.205.245.149, and the https://auth.star.vote domain is configured to point to that ip address. If the domain needs to changed, reach out to @Sara (HQ) on slack and then she can update the domain or ip address in namecheap (or hover? not sure where star.vote is managed)

2. Create SSL cert

Follow the steps [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html#letsencrypt ) (specifically the final certificate automation portion) to install the prerequisite software on the host and use certbot to create an ssl certificate

Keep track of the fullchain.pem and privkey.pem files, you'll need these later when running keycloak

3. Automate certificate renewal

The [guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html#letsencrypt) also covers certificate renewal. You add a certificate rewewal command to your cron, and then restart system ctl

The only change we make is to add a post-hook so that keycloak will restart and use the new ceritifcate. You may need to reference "docker container ls" and replace c17... accordingly to restart your corresponding container

```
39    1,13       *       *       * root certbot renew --no-self-upgrade --post-hook "docker restart c17de7f51dbc"
```

This command will run at 1:39 am/pm everyday (as recommended by certbot), but it'll only renew the certificate if it expires within 30 days

4. Update permissions

```
sudo chmod 755 /etc/letsencrypt/live/auth.star.vote/fullchain.pem
sudo chmod 755 /etc/letsencrypt/live/auth.star.vote/privkey.pem
```

NOTE: You can probably skip the update permissions step, this is just what I happened to do

<details>
<summary>Notes from prevoius attempts</summary>

1. Self signed cert: This method doesn't work because the cert hasn't been confirmed by an authority

The below approach worked to add https, but it didn't setup a chain of trust so I still got warnings

Here's the commands I ran for this

```
openssl req -newkey rsa:2048 -nodes \
  -keyout server.key.pem -x509 -days 3650 -out server.crt.pem
chmod 755 server.key.pem
```

> I actually found 2 sources for this [official keycloak documentation](https://www.keycloak.org/docs/latest/server_installation/#_setting_up_ssl) and [stackoverflow](https://stackoverflow.com/questions/49859066/keycloak-docker-https-required). But stackoverflow was much easier so that's what I used above

2. Caddy + nip.io

This option seemed tempting as it didn't require registering a domain name

detials: https://bansalanuj.com/https-aws-ec2-without-custom-domain

following that guide I got an error while installing caddy so I also followed this guide: https://stackoverflow.com/questions/71256446/error-package-caddy-2-4-6-1-el9-x86-64-coprcopr-fedorainfracloud-orggroup-c

</details>

## Run Keycloak via Docker

Run Keycloak with the certs from the previous step

```
docker run \
  --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=password \
  -e KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/conf/server.crt.pem \
  -e KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/conf/server.key.pem \
  -v /etc/letsencrypt/live/auth.star.vote/fullchain.pem:/opt/keycloak/conf/server.crt.pem \
  -v /etc/letsencrypt/live/auth.star.vote/privkey.pem:/opt/keycloak/conf/server.key.pem \
  -p 8443:8443 \
  quay.io/keycloak/keycloak:latest \
  start-dev > /dev/null 2>&1 &
```

TIP: If you run within tmux you can remove the "/dev/null 2>&1", this will make it easier to access the logs in the future. That said I didn't want to complicate things by including the extra tmux step

More details: [keycloak official](https://www.keycloak.org/getting-started/getting-started-docker) , [stackoverflow](https://stackoverflow.com/questions/49859066/keycloak-docker-https-required)

## Verify website

Now it should be viewable from the web. Navigate to https://auth.star.vote:8443 and you should get the keycloak console

For the remaining setup head over to "configure keycloak"

## Trouble Shooting

### "/keycloak" is already in use by a container

```docker: Error response from daemon: Conflict. The container name "/keycloak" is already in use by container "e9d7b3de8e68fd3efc792fe4a357acb8ae82834fd592d7e9b7a709de36a9319e". You have to remove (or rename) that container to be able to reuse that name.
See 'docker run --help'.```

This probably means you already have a docker image running, 

Option 1: Restart the existing image

If the exising container is configured correctly you can just restart it

```
docker container ls --all
```

Copy the id

```
docker restart <id from prevoius step>
```

Option 2: Delete the old image

If you want to start from scratch, you can also delete the container

WARNING: This will wipe all the existing data on the server! In the future we'll link keycloak to a external database to avoid this issue. There's also probably a way to restart the server but this method works as a quick solution

```
docker container ls --all
```

Copy the container id

```
docker container rm <id from prevoius step>
```
