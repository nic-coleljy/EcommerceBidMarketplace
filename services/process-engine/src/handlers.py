import amqp_setup
import json
import pika


class Handlers:
    def __init__(self, channel, field, next_key, status_key, message_body):
        self.channel = channel
        self.field = field
        self.next_key = next_key
        self.status_key = status_key
        self.message_body = message_body

    def check_fields(self):
        return all(f in self.message_body for f in self.field)

    def check_failure(self):
        return "fail" in self.status_key

    def send_message(self):
        self.channel.basic_publish(
            exchange=amqp_setup.exchange_name,
            routing_key=self.next_key,
            body=json.dumps(self.message_body),
            properties=pika.BasicProperties(delivery_mode=2),
        )


class Auth(Handlers):
    def __init__(self, channel, status_key, message_body):
        field = ["email", "price", "item_name", "username", "bid_id"]
        next_key = "payment.new"
        super().__init__(channel, field, next_key, status_key, message_body)

    def craft_log_msg(self):
        ret_msg = (
            "Auth successfully retrieved username for email:"
            f"{self.message_body['email']}. Pending message to Payment."
        )
        return ret_msg


class Bids(Handlers):
    def __init__(self, channel, status_key, message_body):
        field = ["email", "bid_id", "item_code", "price"]
        next_key = "product.request"
        super().__init__(channel, field, next_key, status_key, message_body)

    def craft_log_msg(self):
        ret_msg = (
            "Bidding requires an update to status of item:"
            f"{self.message_body['item_code']}. Pending message to Product."
        )
        return ret_msg


class Comms(Handlers):
    def __init__(self, channel, status_key, message_body):
        field = ["email", "invoiceUrl", "username", "bid_id"]
        next_key = ""
        super().__init__(channel, field, next_key, status_key, message_body)

    def craft_log_msg(self):
        ret_msg = (
            f"Comms successfully sent email to: {self.message_body['email']}."
            " End."
        )
        return ret_msg

    # No need to send any more messages
    def send_message(self):
        return


class Payment(Handlers):
    def __init__(self, channel, status_key, message_body):
        field = ["email", "invoiceUrl", "username", "bid_id"]
        next_key = "email.payment.new"
        super().__init__(channel, field, next_key, status_key, message_body)

    def craft_log_msg(self):
        ret_msg = (
            f"Payment successfully created invoice URL: "
            f"{self.message_body['invoiceUrl']}. Pending message to Comms."
        )
        return ret_msg


class Product(Handlers):
    def __init__(self, channel, status_key, message_body):
        field = [
            "email",
            "bid_id",
            "item_code",
            "price",
            "bid_id",
            "item_name",
            "minBidPrice",
            "biddingStatus",
        ]
        next_key = "auth.request"
        super().__init__(channel, field, next_key, status_key, message_body)

    def send_message(self):
        # Remove unnecessary details
        required_fields = ["email", "item_name", "price", "bid_id"]
        self.message_body = {k: self.message_body[k] for k in required_fields}

        super().send_message()

    def craft_log_msg(self):
        ret_msg = (
            f"Product successfully retrieved item_name: "
            f"{self.message_body['item_name']}. Pending message to Auth."
        )
        return ret_msg
