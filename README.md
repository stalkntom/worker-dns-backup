# DNS Backup Cloudflare Worker
Terraform Deployment of a Cloudflare Worker and associated resources. This Worker will run on a cron schedule to Export the BIND config of every Zone to an R2 bucket. Export BIND config endpoint
https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-export-dns-records

### Resources Created
1. Create R2 Bucket
2. Create API Token with
3. Create Worker Script
4. Create Worker CRON Trigger

### Required Terraform Token permissions
The Terraform Deployment provisions a token and stores this as a secret text binding for the Worker to use. The automatically provisioned token has these permissions
```
account - Workers R2 Storage:Edit
All zones - DNS:Read
```
This could be setup manually if required. 

For the token to created as part of the Terraform Deployment, create a token with the same account the Worker should run as with these permissions
```
account - Workers R2 Storage:Edit, Workers Scripts:Edit
All users - API Tokens:Edit
```
To create a Token with these permissions use the "Create Additional Tokens" template.
