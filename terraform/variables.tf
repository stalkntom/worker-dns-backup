variable "cloudflare_api_token" {
  type    = string
  default = ""
}

variable "cloudflare_account_id" {
  type    = string
  default = ""
}

variable "cloudflare_r2_bucket_name" {
  type    = string
  default = "dns-backups"
}

variable "cloudflare_r2_bucket_location" {
  type    = string
  default = "APAC"
}

variable "cloudflare_token_name" {
  type    = string
  default = "worker-dns-backup"
}

variable "cloudflare_worker_script_name" {
  type    = string
  default = "worker-dns-backup"
}

variable "cloudflare_worker_cron_schedules" {
  type    = list(string)
  default = ["*/5 * * * *"]
}

variable "webhook_url" {
  type    = string
  default = "https://<default>.webhook.office.com/"
}

variable "webhook_enabled" {
  type    = string
  default = "true"
}

variable "webhook_failure_only" {
  type    = string
  default = "true"
}
