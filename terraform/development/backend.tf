terraform {
  backend "s3" {
    bucket         = "farf-aura-lead-crm-assets-dev" # O tu bucket dedicado para estados
    key            = "terraform/state/crm-dev.tfstate"
    region         = "us-east-1"
    encrypt        = true
    # Terraform maneja el bloqueo nativo a través de S3 actualmente
  }
}