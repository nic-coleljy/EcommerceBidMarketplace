import json
import amqp_setup
import pika
import pymongo
import logging
import handlers
from os import environ

MONGODB_URL = environ.get("MONGODB_URL")

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ProcessEngine(object):
    def __init__(self):
        self._connection = None
        self._channel = None
        self.handle = {
            "auth": handlers.Auth,
            "bidding": handlers.Bids,
            "email": handlers.Comms,
            "payment": handlers.Payment,
            "product": handlers.Product,
        }

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
        routing_key = method.routing_key

        # Example: status.auth.success
        # Split the routing key and discard the first value
        # Determine the function using the second value (e.g. auth)
        # Pass in the status to the handler functions (success)
        split_key = routing_key.split(".")[1:]
        main_key = split_key[0]
        status_key = split_key[1]

        # Call the relevant function to invoke the next microservice
        service = self.handle[main_key](channel, status_key, message_body)

        # Perform some basic checking
        success = True
        if service.check_failure():
            log_msg = f"Failure code detected from {main_key}... Stopping."
            success = False

        elif not service.check_fields():
            log_msg = "Missing fields in AMQP body"
            success = False

        else:
            try:
                service.send_message()
                log_msg = service.craft_log_msg()

            except Exception as e:
                logger.error(e)
                log_msg = e
                success = False

        # Log the values in the DB
        self.log(success, log_msg, message_body)

    def log(self, success, log_msg, original_body):
        status = "SUCCESS" if success else "FAILURE"

        bid_id = original_body["bid_id"]
        del original_body["bid_id"]

        context = json.dumps(original_body)

        if not status:
            logger.error(log_msg)
            print("Error:" + log_msg)
        else:
            logger.info(log_msg)
            print(log_msg)

        log_data = {
            "bid_id": bid_id,
            "status": status,
            "log_msg": log_msg,
            "context": context,
        }

        mycol.insert_one(log_data)

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
    processEngine = ProcessEngine()
    processEngine.run()


if __name__ == "__main__":
    myclient = pymongo.MongoClient(MONGODB_URL)
    mydb = myclient["test"]
    mycol = mydb["logs"]

    main()
