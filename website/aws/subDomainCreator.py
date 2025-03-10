import boto3
import json

# Initialize Route 53 client
route53_client = boto3.client('route53')

# Your Hosted Zone ID (Get this from AWS Route 53 console)
HOSTED_ZONE_ID = "Z3AADJGX6KJ36G"  # Replace with actual Hosted Zone ID

# Your Server's Public IP Address (Replace with your real IP)
SERVER_IP = "18.218.45.32"  # Example EC2 IP or Static IP

def create_subdomain(subdomain):
    subdomain_name = f"{subdomain}.yourdomain.com."

    change_batch = {
        "Comment": "Adding new subdomain",
        "Changes": [
            {
                "Action": "CREATE",
                "ResourceRecordSet": {
                    "Name": subdomain_name,
                    "Type": "A",
                    "TTL": 60,
                    "ResourceRecords": [
                        {"Value": SERVER_IP}  # Point to your server
                    ]
                }
            }
        ]
    }

    # Apply the changes
    response = route53_client.change_resource_record_sets(
        HostedZoneId=HOSTED_ZONE_ID,
        ChangeBatch=change_batch
    )

    print("Subdomain creation response:")
    print(json.dumps(response, indent=4))

# Example: Create a subdomain for a new business
create_subdomain("business1")
