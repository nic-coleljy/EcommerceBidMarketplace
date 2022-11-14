import json
import pika
import pytest
import time

from os import environ

hostname = environ.get("rabbitmq_host")
port = environ.get("rabbitmq_port")
parameters = pika.ConnectionParameters(host=hostname, port=port)

exchange_name = "process-engine.topic"
queue_name_product = "Product_Request"
queue_name_auth = "User_Details_Request"
queue_name_payment = "Payment_Invoice_Request"
queue_name_email = "Customer_Email_Payment"


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


def fetch_message(queue_name):
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    method_frame, header_frame, body = channel.basic_get(queue=queue_name)

    if method_frame:
        print(method_frame, header_frame, body)
        channel.basic_ack(method_frame.delivery_tag)
        connection.close()
        return body
    else:
        connection.close()
        return None


@pytest.mark.dependency()
def test_bidding_close(client):
    body = {
        "email": "test@gmail.com",
        "item_code": "38BEE270",
        "price": 600,
        "bid_id": "12345",
    }
    send_message(
        exchange_name,
        "status.bidding.new",
        body,
    )

    # wait for the message to be processed
    time.sleep(3)

    response = fetch_message(queue_name_product)
    assert response is not None

    data = json.loads(response)
    assert data == body

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "SUCCESS"
    assert resp["log_msg"] == (
        "Bidding requires an update to status of item:38BEE270. "
        "Pending message to Product."
    )


@pytest.mark.dependency()
def test_product_success(client):
    body = {
        "email": "test@gmail.com",
        "item_code": "38BEE270",
        "price": 600,
        "bid_id": "12345",
        "item_name": "Nike Shoes",
        "biddingStatus": "bid close",
        "minBidPrice": 600,
    }
    send_message(
        exchange_name,
        "status.product.success",
        body,
    )

    # wait for the message to be processed
    time.sleep(3)

    response = fetch_message(queue_name_auth)
    assert response is not None

    data = json.loads(response)

    assert data["item_name"] == "Nike Shoes"
    assert data["email"] == "test@gmail.com"
    assert data["price"] == 600
    assert data["bid_id"] == "12345"

    should_not_exist = ["item_code", "biddingStatus", "minBidPrice"]
    assert all(f not in data for f in should_not_exist)

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "SUCCESS"
    assert resp["log_msg"] == (
        "Product successfully retrieved item_name: Nike Shoes. "
        "Pending message to Auth."
    )


@pytest.mark.dependency()
def test_auth_success(client):
    body = {
        "email": "test@gmail.com",
        "price": 600,
        "bid_id": "12345",
        "item_name": "Nike Shoes",
        "username": "Testing User",
    }
    send_message(
        exchange_name,
        "status.auth.success",
        body,
    )

    # wait for the message to be processed
    time.sleep(3)

    response = fetch_message(queue_name_payment)
    assert response is not None

    data = json.loads(response)

    assert data == body

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "SUCCESS"
    assert resp["log_msg"] == (
        "Auth successfully retrieved username for email:test@gmail.com. "
        "Pending message to Payment."
    )


@pytest.mark.dependency()
def test_payment_success(client):
    body = {
        "email": "test@gmail.com",
        "invoiceUrl": "http://invoice.com",
        "bid_id": "12345",
        "username": "Testing User",
    }
    send_message(
        exchange_name,
        "status.payment.success",
        body,
    )

    # wait for the message to be processed
    time.sleep(3)

    response = fetch_message(queue_name_email)
    assert response is not None

    data = json.loads(response)

    assert data == body

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "SUCCESS"
    assert resp["log_msg"] == (
        "Payment successfully created "
        "invoice URL: http://invoice.com. Pending message to Comms."
    )


@pytest.mark.dependency()
def test_comms_success(client):
    body = {
        "email": "test@gmail.com",
        "invoiceUrl": "http://invoice.com",
        "bid_id": "12345",
        "username": "Testing User",
    }
    send_message(
        exchange_name,
        "status.email.success",
        body,
    )

    # wait for the message to be processed
    time.sleep(5)

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "SUCCESS"
    assert resp["log_msg"] == (
        "Comms successfully sent email to: " "test@gmail.com. End."
    )


@pytest.mark.dependency()
def test_comms_fail_status_key(client):
    body = {
        "email": "test@gmail.com",
        "invoiceUrl": "http://invoice.com",
        "bid_id": "12345",
        "username": "Testing User",
    }
    send_message(
        exchange_name,
        "status.email.fail",
        body,
    )

    # wait for the message to be processed
    time.sleep(5)

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "FAILURE"
    assert resp["log_msg"] == "Failure code detected from email... Stopping."


@pytest.mark.dependency()
def test_comms_missing_fields(client):
    body = {
        # "email": "test@gmail.com", -> missing field
        "invoiceUrl": "http://invoice.com",
        "bid_id": "12345",
        "username": "Testing User",
    }
    send_message(
        exchange_name,
        "status.email.success",
        body,
    )

    # wait for the message to be processed
    time.sleep(5)

    resp = client.find_one()
    assert resp is not None

    assert resp["status"] == "FAILURE"
    assert resp["log_msg"] == "Missing fields in AMQP body"
