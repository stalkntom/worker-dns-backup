# DNS Backup Cloudflare Worker
Terraform Deployment of a Cloudflare Worker and associated resources. This Worker will run on a cron schedule to Export the BIND config of every Zone to an R2 bucket. Export BIND config endpoint
https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-export-dns-records

### Webhook
Providing a Webhook endpoint is required unless the webhook_enabled is set to "false". The webhook can can notify on failure only if setting webhook_failure_only to "true". After the Worker runs the Webhook is used to notify success/failure of Zone Backups. 

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

If the Terraform deployment is to be used once for setup and no managed via pipeline, the token used to provision the Workers token should be deleted. 
