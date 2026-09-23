resource "aws_s3_bucket" "crm_storage" {
  bucket = "farf-crm-storage-dev" 

  tags = {
    Name = "crm-storage-dev"
    Environment = "Development"
  }
}

# Bloquear acceso público por defecto
resource "aws_s3_bucket_public_access_block" "crm_storage_public_block" {
 bucket = aws_s3_bucket.crm_storage.id 

 block_public_acls = true 
 block_public_policy = true 
 ignore_public_acls = true 
 restrict_public_buckets = true 
}

