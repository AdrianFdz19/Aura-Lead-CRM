resource "aws_ecr_repository" "crm_client_repo" {
  name                 = "crm-client"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

