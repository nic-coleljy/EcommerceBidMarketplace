import json
import pika
import pytest
import time

from os import environ

hostname = environ.get("rabbitmq_host")
port = environ.get("rabbitmq_port")
parameters = pika.ConnectionParameters(host=hostname, port=port)

exchange_name = "process-engine.topic"

# Shared process engine response queue
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
        queue=queue_name_publish)

    if method_frame:
        print(method_frame, header_frame, body)
        channel.basic_ack(method_frame.delivery_tag)
        connection.close()
        return body
    else:
        connection.close()
        return None


@pytest.mark.dependency()
def test_new_username_retrival_success(client):
    body = {
        "email": "johndoe@gmail.com",
        "price": 600,
        "item_name": "Shoes",
        "bid_id": 123,
    }

    send_message(
        exchange_name,
        "auth.request",
        body,
    )

    # wait for the message to be processed
    # Also need to wait for the PDF to generate
    time.sleep(15)

    response = fetch_message()
    assert response is not None

    data = json.loads(response)

    assert data["email"] == "johndoe@gmail.com"
    assert data["username"] == "John Doe"


@pytest.mark.dependency()
def test_new_username_retrival_failure(client):
    body = {
        "email": "doesnotexist@gmail.com",
        "price": 600,
        "item_name": "Shoes",
        "bid_id": 123,
    }

    send_message(
        exchange_name,
        "auth.request",
        body,
    )

    # wait for the message to be processed
    # Also need to wait for the PDF to generate
    time.sleep(15)

    response = fetch_message()
    assert response is not None

    data = json.loads(response)

    assert data["email"] == "doesnotexist@gmail.com"
    assert data["username"] is None
