variable "aws_region" {
  description = "Région de AWS para el entorno de desarrollo"
  type = string
  default = "us-east-1a"
}

variable "vpc_cidr" {
  description = "Bloque CIDR principal para la VPC"
  type = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Bloque CIDR para la subnet pública (donde vivirá la app)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_2_subnet_cidr" {
  description = "Bloque CIDR para la segunda subnet pública (donde vivirá la app)"
  type        = string
  default     = "10.0.3.0/24"
}

variable "private_subnet_cidr" {
  description = "Bloque CIDR para la subnet privada (donde vivirá la base de datos)"
  type        = string
  default     = "10.0.2.0/24"
}

// Variables de entorno
variable "NODE_ENV" {
  type = string 
  default = "development"
}
