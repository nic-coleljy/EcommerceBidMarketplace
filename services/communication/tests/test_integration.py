import json
import pika
import pytest
import time

from os import environ

hostname = environ.get("rabbitmq_host")
port = environ.get("rabbitmq_port")
parameters = pika.ConnectionParameters(host=hostname, port=port)

exchange_name = "process-engine.topic"
queue_name_publish = "Process_Engine_Response"


def send_message(exchange_name, key, body_dict):
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    channel.basic_publish(
        exchange=exchange_name,
        routing_key=key,
        body=json.dumps(body_dict),
        properties=pika.BasicProperties(delivery_mode=2),
    )

    connection.close()


def fetch_message():
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    method_frame, header_frame, body = channel.basic_get(
        queue="Process_Engine_Response")

    if method_frame:
        print(method_frame, header_frame, body)
        channel.basic_ack(method_frame.delivery_tag)
        connection.close()
        return body
    else:
        connection.close()
        return None


@pytest.mark.dependency()
def test_new_email():
    body = {
        "email": "kingyeh.cheah@gmail.com",
        "username": "King",
        "invoiceUrl": "http://test-invoice.com",
        "bid_id": 123,
    }
    send_message(
        exchange_name,
        "email.payment.new",
        body,
    )

    # wait for the message to be processed
    time.sleep(15)

    response = fetch_message()
    assert response is not None

    data = json.loads(response)

    assert data["email"] == "kingyeh.cheah@gmail.com"
    assert data == body
