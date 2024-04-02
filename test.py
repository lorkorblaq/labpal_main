import os

# Check if an environment variable exists
if 'VARIABLE_NAME' in os.environ:
    print('The environment variable exists')
else:
    print('The environment variable does not exist')