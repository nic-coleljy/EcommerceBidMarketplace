import ssl
import pika
import time

from os import environ
from dotenv import load_dotenv

if environ.get("stage") != "production-aws":
    load_dotenv()

hostname = environ.get("rabbitmq_host")
port = environ.get("rabbitmq_port")

# SSL connections are required for Amazon MQ's brokers
if environ.get("stage") == "production-aws":
    ssl_enabled = True
else:
    ssl_enabled = False

if ssl_enabled:
    username = environ.get("rabbitmq_username")
    password = environ.get("rabbitmq_password")
    credentials = pika.PlainCredentials(username, password)

    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    parameters = pika.ConnectionParameters(
        host=hostname,
        port=port,
        virtual_host="/",
        credentials=credentials,
        ssl_options=pika.SSLOptions(context),
        heartbeat=60,
    )
else:
    parameters = pika.ConnectionParameters(
        host=hostname, port=port, heartbeat=60)


connected = False
start_time = time.time()

print("Connecting...")

while not connected:
    try:
        connection = pika.BlockingConnection(parameters)
        connected = True
    except pika.exceptions.AMQPConnectionError:
        if time.time() - start_time > 20:
            exit(1)

print("CONNECTED!")

# Create an AMQP topic exchange for receiving details about successful payment
# Uses the single shared exchange called "proces-engine.topic"
channel = connection.channel()
exchange_name = "process-engine.topic"
exchange_type = "topic"
channel.exchange_declare(
    exchange=exchange_name, exchange_type=exchange_type, durable=True
)

# Create a queue for payment related notifications that
# captures ALL payment msgs
# (e.g. email.payment.new, email.payment.cancel, email.payment.rej)

# This allows more types of email to be sent if required in the future.

queue_name_consume = "Customer_Email_Payment"
channel.queue_declare(queue=queue_name_consume, durable=True)
channel.queue_bind(
    exchange=exchange_name, queue=queue_name_consume, routing_key="email.#"
)

# Create a shared queue for status related notifications that
# will be sent to process engine
# (e.g. status.email.success, status.email.fail)

queue_name_publish = "Process_Engine_Response"
channel.queue_declare(queue=queue_name_publish, durable=True)
channel.queue_bind(
    exchange=exchange_name, queue=queue_name_publish, routing_key="status.#"
)

connection.close()
