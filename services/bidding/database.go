package main

import (
	"context"
	"fmt"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"log"
	"os"
	"time"
)

// Database : Database struct
type Database struct {
	client     *mongo.Client
	collection *mongo.Collection
}

var database *Database

// MaxRetriesForDBConnection : max retries for db connection
const MaxRetriesForDBConnection = 5

// StartDBConnection : start a connection to the mongo database
// if path variable is not set, read from config file
func StartDBConnection() {
	var mongoURI string
	mongoURI = os.Getenv("MONGO_URI")

	if mongoURI == "" {
		mongoURI = viper.GetString("MONGO_URI")
	}

	fmt.Println("MONGO_URI: ", mongoURI)

	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetServerAPIOptions(serverAPIOptions)

	ctx, cancel := context.WithTimeout(context.Background(), MaxRetriesForDBConnection*10*time.Second)
	defer cancel()

	retries := 0
	client, err := mongo.Connect(ctx, clientOptions)
	for err != nil && retries < MaxRetriesForDBConnection {
		retries++
		log.Println("Error connecting to database: ", err)
		time.Sleep(5 * time.Second)
		client, err = mongo.Connect(ctx, clientOptions)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		panic(err)
	}

	collection := client.Database("test").Collection("bidding")
	setIndex(ctx, collection, "bid_amount", bson.D{{"item_id", 1}, {"bid_amount", -1}}, true)

	database = &Database{client: client, collection: collection}
}

func setIndex(ctx context.Context, collection *mongo.Collection, indexName string, keys bson.D, unique bool) {
	indexView := collection.Indexes()
	indexOptions := options.Index()
	indexOptions.SetUnique(unique)
	indexOptions.SetName(indexName)
	indexView.CreateOne(ctx, mongo.IndexModel{Keys: keys, Options: indexOptions})
}

// InsertBid : insert a bid
func (db *Database) InsertBid(bid *Bid) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.collection.InsertOne(ctx, bid)
	if err != nil {
		return err
	}
	return nil
}

// UpdateBid : update a bid
func (db *Database) UpdateBid(oldBidDetails, newBidDetails *Bid) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.collection.UpdateOne(ctx, oldBidDetails, newBidDetails)
	if err != nil {
		return err
	}
	return nil
}

// DeleteBid : delete a bid
func (db *Database) DeleteBid(bid *Bid) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.collection.DeleteOne(ctx, bid)
	if err != nil {
		return err
	}
	return nil
}

// FindRelevantBids : find all bids that are relevant to the given bid
func (db *Database) FindRelevantBids(filter *Bid) ([]*Bid, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var relevantBids []*Bid
	cursor, err := db.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	if err = cursor.All(ctx, &relevantBids); err != nil {
		return nil, err
	}

	return relevantBids, nil
}
