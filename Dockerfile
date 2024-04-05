# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory to /app
WORKDIR /clinicalx_main/

# Copy the current directory contents into the container at /app
COPY . /clinicalx_main/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV FLASK_APP=main.py

# Run app.py when the container launches
# CMD ["flask", "run", "--host=0.0.0.0","--port=8080"]

# Command to run the application with Gunicorn
# CMD ["gunicorn", "-w", "3", "-t", "1", "-b", "0.0.0.0:8080", "main:app"]
CMD ["python3", "main.py"]

