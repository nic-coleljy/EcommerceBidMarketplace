# noqa: E711

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
        queue="Process_Engine_Response"
    )

    if method_frame:
        print(method_frame, header_frame, body)
        channel.basic_ack(method_frame.delivery_tag)
        connection.close()
        return body
    else:
        connection.close()
        return None


@pytest.mark.dependency()
def test_update_product(client):
    body = {
        "email": "test@gmail.com",
        "item_code": "38BEE270",
        "price": 600,
        "bid_id": "12345",
    }
    send_message(
        exchange_name,
        "product.request",
        body,
    )

    # wait for the message to be processed
    time.sleep(15)

    response = fetch_message()
    assert response is not None

    data = json.loads(response)

    assert data["item_name"] == "Nike Shoes"
    assert data["biddingStatus"] == "bid close"
    assert data["minBidPrice"] == 600


@pytest.mark.dependency()
def test_no_product(client):
    body = {
        "email": "test@gmail.com",
        "item_code": "doesnotexist",
        "price": 600,
        "bid_id": "12345",
    }
    send_message(
        exchange_name,
        "product.request",
        body,
    )

    # wait for the message to be processed
    time.sleep(15)

    response = fetch_message()
    assert response is not None

    data = json.loads(response)

    assert data["item_name"] is None
    assert data["biddingStatus"] is None
    assert data["minBidPrice"] is None
