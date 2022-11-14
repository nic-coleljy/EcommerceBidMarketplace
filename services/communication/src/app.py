import json
import amqp_setup
import pika

from emailer import email_alert


class CommunicationService(object):
    def __init__(self):
        self._connection = None
        self._channel = None

    def connect(self):
        self._connection = pika.BlockingConnection(amqp_setup.parameters)

    def close_connection(self):
        if self._connection is not None:
            self._connection.close()

    def close_channel(self):
        if self._channel is not None:
            self._channel.close()

    def create_channel(self):
        self._channel = self._connection.channel()

    def callback(self, channel, method, properties, body):
        message_body = json.loads(body)
        email = message_body["email"]
        username = message_body["username"]
        invoice_url = message_body["invoiceUrl"]

        print(
            f"Comms service receive data from process engine:"
            f"key - {method.routing_key}; body - {body}"
        )

        try:
            subject = "Payment Invoice for your favourite item is ready!"
            msg = (
                f"Hello {username}!\n\nThank you for shopping with us.\n"
                "Refer to the following link for the invoice: "
            )
            msg += invoice_url

            key = "status.email.success"
            if not email_alert(subject, msg, email):
                key = "status.email.fail"

            # Dump the entire body as status logs to process engine
            channel.basic_publish(
                exchange=amqp_setup.exchange_name,
                routing_key=key,
                body=body,
                properties=pika.BasicProperties(delivery_mode=2),
            )

            # print(body)

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
    commService = CommunicationService()
    commService.run()


if __name__ == "__main__":
    main()
