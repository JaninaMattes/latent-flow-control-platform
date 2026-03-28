"""An AWS Python Pulumi program"""

import pulumi
from pulumi_aws import s3
from pulumi_aws import ec2

# Create an AWS resource (S3 Bucket)
bucket = s3.Bucket('my-bucket')

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)



vpc = ec2.get_vpc('vpc-0bc9ad02de4ba4f70')
subnet = ec2.get_subnet('subnet-0847ab9380fb12c4d')
subnet_id = subnet.id

instance = ec2.Instance(subnet_id=subnet_id, vpc_security_group_ids=[vpc.id], instance_type='')