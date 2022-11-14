import ssl
import pika
import time
from os import environ
from dotenv import load_dotenv

if environ.get("stage") != "production-aws":
    load_dotenv()

hostname = environ.get('rabbitmq_host')
port = environ.get('rabbitmq_port')

# SSL connections are required for Amazon MQ's brokers

if environ.get('stage') == 'production-aws':
    ssl_enabled = True
else:
    ssl_enabled = False

if ssl_enabled:
    username = environ.get('rabbitmq_username')
    password = environ.get('rabbitmq_password')
    credentials = pika.PlainCredentials(username, password)

    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    parameters = pika.ConnectionParameters(host=hostname,
                                           port=port,
                                           virtual_host='/',
                                           credentials=credentials,
                                           ssl_options=pika.SSLOptions(
                                               context),
                                           heartbeat=60
                                           )
else:
    parameters = pika.ConnectionParameters(host=hostname,
                                           port=port,
                                           heartbeat=60)


connected = False
start_time = time.time()

print('Connecting...')

while not connected:
    try:
        connection = pika.BlockingConnection(parameters)
        connected = True
    except pika.exceptions.AMQPConnectionError:
        if time.time() - start_time > 20:
            exit(1)

print('CONNECTED!')

# Create an AMQP topic exchange for Notifications

channel = connection.channel()
exchange_name = "process-engine.topic"
exchange_type = "topic"
channel.exchange_declare(exchange=exchange_name,
                         exchange_type=exchange_type, durable=True)

# Create ALL the queues for notifications that
# comes in from all the different microservices

queue_name_consume = "Process_Engine_Response"

queue_names_dict = {
    "Process_Engine_Response": "status.#",
    "User_Details_Request": "auth.*",
    "Customer_Email_Payment": "email.#",
    "Payment_Invoice_Request": "payment.*",
    "Product_Request": "product.*"
}

for queue, key in queue_names_dict.items():
    channel.queue_declare(queue=queue, durable=True)
    channel.queue_bind(exchange=exchange_name,
                       queue=queue, routing_key=key)
