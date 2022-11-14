import json
import amqp_setup
import pika

from invoice_generator import generate_invoice


class PaymentService(object):
    def __init__(self):
        self._connection = None
        self._channel = None

    def connect(self):
        self._connection = pika.BlockingConnection(amqp_setup.parameters)

    def close_connection(self):
        self._connection.close()

    def close_channel(self):
        self._channel.close()

    def create_channel(self):
        self._channel = self._connection.channel()

    def callback(self, channel, method, properties, body):
        message_body = json.loads(body)
        email = message_body["email"]
        username = message_body["username"]
        item_name = message_body["item_name"]
        price = message_body["price"]
        bid_id = message_body["bid_id"]

        print(
            f"Payment service receive data from process engine:"
            f"key - {method.routing_key}; body - {body}"
        )

        try:
            key = "status.payment.success"
            invoice_url = generate_invoice(username, email, item_name, price)

            if not invoice_url:
                key = "status.payment.fail"

            data = {
                "email": email,
                "username": username,
                "invoiceUrl": invoice_url,
                "bid_id": bid_id
            }

            # Dump the entire body as status logs to process engine
            channel.basic_publish(
                exchange=amqp_setup.exchange_name,
                routing_key=key,
                body=json.dumps(data),
                properties=pika.BasicProperties(delivery_mode=2),
            )

        except Exception as e:
            print(e)

    def run(self):
        try:
            self.connect()
            self.create_channel()
            self._channel.basic_consume(
                queue=amqp_setup.queue_name_consume,
                on_message_callback=self.callback,
                auto_ack=True,
            )

            self._channel.start_consuming()
        except KeyboardInterrupt:
            print("\nDisconnecting...")
            self.stop()

    def stop(self):
        self.close_channel()
        self.close_connection()
        print("DISCONNECTED")


def main():
    paymentService = PaymentService()
    paymentService.run()


if __name__ == "__main__":
    main()
