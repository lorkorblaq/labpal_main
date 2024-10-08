# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory to /clinicalx_main
WORKDIR /labpal_main/

# Copy the current directory contents into the container at /clinicalx_main
COPY . /labpal_main/

# Install any needed packages specified in requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -r requirements.txt

# Install supervisord
RUN apt-get update && apt-get install -y supervisor

# Copy the supervisord.conf file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable

# Command to run supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
# CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:3000", "main:app"]
