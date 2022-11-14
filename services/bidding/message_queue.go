package main

import (
	"context"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/spf13/viper"
	"log"
	"os"
	"time"
)

var messageQueue *MessageQueue

// MessageQueue : MessageQueue struct
type MessageQueue struct {
	channel *amqp.Channel
	queue   *amqp.Queue
	conn    *amqp.Connection
}

// constants for the message queue settings
const (
	ExchangeName              = "process-engine.topic"    // exchange name
	QueueName                 = "Process_Engine_Response" // queue name
	QueueKey                  = "status.#"                // routing key for queue
	MessageKey                = "status.bidding.new"      // routing key for message
	MaxRetriesForMQConnection = 5                         // max number of retries
)

// ConnectToMessageQueue : connect to the message queue and set the package variables
func ConnectToMessageQueue() {
	retries := 0

	err := ConfigureToMessageQueue()
	for err != nil && retries < MaxRetriesForMQConnection {
		retries++
		log.Println("There was an error connecting to the message queue", err)
		time.Sleep(5 * time.Second)
		err = ConfigureToMessageQueue()
	}

}

// ConfigureToMessageQueue : connect to the message queue and set the package variables
// establish exchange, queue and bind exchange to queue
func ConfigureToMessageQueue() error {
	var amqpURI string
	amqpURI = os.Getenv("AMQP_URI")

	if amqpURI == "" {
		amqpURI = viper.GetString("AMQP_URI")
	}

	log.Println("AMQP_URI: ", amqpURI)

	conn, err := amqp.Dial(amqpURI)
	if err != nil {
		return err
	}

	c, err := conn.Channel()
	if err != nil {
		return err
	}

	err = c.ExchangeDeclare(
		ExchangeName, // name
		"topic",      // type
		true,         // durable
		false,        // auto-deleted
		false,        // internal
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		return err
	}

	q, err := c.QueueDeclare(
		QueueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return err
	}

	err = c.QueueBind(
		q.Name,       // queue name
		QueueKey,     // routing key
		ExchangeName, // exchange
		false,
		nil)
	if err != nil {
		return err
	}

	messageQueue = &MessageQueue{channel: c, queue: &q, conn: conn}
	return nil
}

func (q *MessageQueue) disconnect() {
	if q.channel != nil {
		// close the amqp connection
		q.channel.Close()
		q.conn.Close()
	} else {
		log.Println("Channel is nil")
	}
}

func (q *MessageQueue) checkConnection() {
	if q.channel == nil || q.channel.IsClosed() {
		ConfigureToMessageQueue()
	}
}

func (q *MessageQueue) publishMessage(body []byte) error {
	q.checkConnection()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := q.channel.PublishWithContext(ctx,
		ExchangeName, // exchange
		MessageKey,   // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        body,
		})
	if err != nil {
		return err
	}

	log.Printf(" [x] Sent %s", body)
	return nil
}
