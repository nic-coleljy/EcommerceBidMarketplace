import json
import amqp_setup
import pika
import pymongo
from pymongo import ReturnDocument
from os import environ

MONGODB_URL = environ.get("MONGODB_URL")


class ProductService(object):
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
        item_code = message_body["item_code"]
        price = message_body["price"]

        print(
            f"Product service receive data from process engine:"
            f"key - {method.routing_key}; body - {body}"
        )

        try:
            key = "status.product.success"

            result = mycol.find_one_and_update(
                {"code": item_code},
                {"$set": {
                    "minBiddingPrice": price,
                    "biddingStatus": "bid close"
                }
                },
                upsert=False,
                return_document=ReturnDocument.AFTER,
            )

            if not result:
                item_name = None
                min_bid_price = None
                biddingStatus = None
                key = "status.product.fail"
            else:
                item_name = result["name"]
                min_bid_price = result["minBiddingPrice"]
                biddingStatus = result["biddingStatus"]

            new_data = {
                "item_name": item_name,
                "minBidPrice": min_bid_price,
                "biddingStatus": biddingStatus,
            }

            message_body.update(new_data)

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
    productService = ProductService()
    productService.run()


if __name__ == "__main__":
    myclient = pymongo.MongoClient(MONGODB_URL)
    mydb = myclient["test"]
    mycol = mydb["products"]

    main()
