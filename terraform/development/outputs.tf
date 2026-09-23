# Network

output "vpc_id" {
    description = "ID de la VPC creada para desarrollo"
    value = aws_vpc.main.id
}

output "public_subnet_id" {
    description = "ID de la subnet publica"
    value = aws_subnet.public.id
}

output "private_subnet_id" {
    description = "ID de la subnet privada"
    value = aws_subnet.private.id
}

# Storage

output "s3_bucket_name" {
  description = "Nombre del bucket S3 para el CRM"
  value = aws_s3_bucket.crm_storage.id 
}

# Compute

output "alb_dns_name" {
  description = "URL publica del Application Load Balancer para acceder al CRM"
  value       = aws_lb.main.dns_name
}

# Cloudfront

output "cloudfront_domain_name" {
  description = "El dominio estático de CloudFront que debes apuntar en tu DNS"
  value       = aws_cloudfront_distribution.cdn.domain_name
}