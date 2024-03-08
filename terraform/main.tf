terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.26"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_r2_bucket" "dns_backup_bucket" {
  account_id = var.cloudflare_account_id
  name       = var.cloudflare_r2_bucket_name
  location   = var.cloudflare_r2_bucket_location
}

data "cloudflare_api_token_permission_groups" "all" {}

resource "cloudflare_api_token" "dns_backup_token" {
  name = var.cloudflare_token_name

  policy {
    permission_groups = [
      data.cloudflare_api_token_permission_groups.all.account["Workers R2 Storage Write"]
    ]
    resources = {
      "com.cloudflare.api.account.${var.cloudflare_account_id}" = "*"
    }
  }

  policy {
    permission_groups = [
      data.cloudflare_api_token_permission_groups.all.zone["DNS Read"],
    ]
    resources = {
      "com.cloudflare.api.account.zone.*" = "*"
    }
  }
}

resource "cloudflare_worker_script" "dns_backup_script" {
  account_id = var.cloudflare_account_id
  name       = var.cloudflare_worker_script_name
  content    = file("../src/script.js")
  module     = true

  secret_text_binding {
    name = "CLOUDFLARE_API_TOKEN" # Name is hardcoded in script.js
    text = resource.cloudflare_api_token.dns_backup_token.value
  }

  secret_text_binding {
    name = "WEBHOOK_URL" # Name is hardcoded in script.js
    text = var.webhook_url
  }

  plain_text_binding {
    name = "ENABLE_WEBHOOK" # Name is hardcoded in script.js
    text = var.webhook_enabled
  }

  plain_text_binding {
    name = "NOTIFY_ON_FAILURE_ONLY" # Name is hardcoded in script.js
    text = var.webhook_failure_only
  }

  r2_bucket_binding {
    name        = "DNS_BACKUPS_BUCKET" # Name is hardcoded in script.js
    bucket_name = var.cloudflare_r2_bucket_name
  }
}

resource "cloudflare_worker_cron_trigger" "dns_backup_script_trigger" {
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_worker_script.dns_backup_script.name
  schedules   = var.cloudflare_worker_cron_schedules
}
