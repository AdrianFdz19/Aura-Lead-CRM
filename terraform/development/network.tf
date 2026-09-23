resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true # check
  enable_dns_support   = true # check

  tags = {
    Name = "crm-vpc-dev"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true # check

  tags = {
    Name = "crm-public-subnet-dev"
  }
}

// Segunda subnet publica para el application load balancer
resource "aws_subnet" "public_2" {
  vpc_id = aws_vpc.main.id 
  cidr_block = var.public_2_subnet_cidr 
  availability_zone = "us-east-1b"
  map_public_ip_on_launch = true 

  tags = {
    Name = "crm-public-subnet-dev-2"
  }
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = var.private_subnet_cidr

  tags = {
    Name = "crm-private-subnet-dev"
  }
}

resource "aws_internet_gateway" "gw" {
    vpc_id = aws_vpc.main.id

    tags = {
        Name = "crm-igw-dev"
    }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0" # Todo el tráfico de internet ...
    gateway_id = aws_internet_gateway.gw.id # ... se dirige hacie el Internet Gateway
  } # check

  tags = {
    Name = "crm-route-table-public-dev"
  }
}

resource "aws_route_table_association" "public_association" {
  route_table_id = aws_route_table.public.id
  subnet_id = aws_subnet.public.id
}

resource "aws_route_table_association" "public_association_2" {
  route_table_id = aws_route_table.public.id 
  subnet_id = aws_subnet.public_2.id
}




