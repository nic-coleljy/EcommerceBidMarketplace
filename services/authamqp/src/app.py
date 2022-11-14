import json
import amqp_setup
import pika
import pymongo
from os import environ

MONGODB_URL = environ.get("MONGODB_URL")


class AuthService(object):
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

        print(
            f"Auth service receive data from process engine:"
            f"key - {method.routing_key}; body - {body}"
        )

        query = {
            "email": email
        }

        try:
            key = "status.auth.success"

            result = mycol.find_one(query)

            if not result:
                key = "status.auth.fail"
                name = None
                print(f"User not found! Email: {email}")

            else:
                name = result["name"]
                print(f"Username found: {name}")

            # Adds the name object into the field
            message_body.update({"username": name})

            # Dump the entire body as status logs to process engine
            channel.basic_publish(
                exchange=amqp_setup.exchange_name,
                routing_key=key,
                body=json.dumps(message_body),
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
    authService = AuthService()
    authService.run()


if __name__ == "__main__":
    myclient = pymongo.MongoClient(MONGODB_URL)
    mydb = myclient["test"]
    mycol = mydb["users"]

    main()
