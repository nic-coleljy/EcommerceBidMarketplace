package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
)

// InitializeBiddingCoordinator : initializes the bidding coordinator
// allows for future configuration
func InitializeBiddingCoordinator() {}

func placeBid(bid *Bid) error {
	isBidAmountValidForUser, err := checkBidAmountValidForUser(bid)
	if err != nil {
		return err
	}

	if !isBidAmountValidForUser {
		log.Printf("Bid amount %v is not valid for user %v", bid.BidAmount, bid.UserID)
		return errors.New("bid amount is not valid")
	}

	// insert record into db
	err = database.InsertBid(bid)
	if err != nil {
		fmt.Println("Error while inserting bid ", err)
		return err
	}

	log.Println("Bid placed successfully")

	return nil
}

// check if this bid amount for the specified item is valid for the user
// i.e the bid amount must be higher than the previous amount the user has bid for the item
func checkBidAmountValidForUser(bid *Bid) (bool, error) {
	userPreviousBidsForItem, err := database.FindRelevantBids(&Bid{UserID: bid.UserID, ItemID: bid.ItemID})
	if err != nil {
		return false, err
	}

	if len(userPreviousBidsForItem) == 0 {
		return true, nil
	}

	return bid.BidAmount > userPreviousBidsForItem[0].BidAmount, nil
}

// returns the nth highest bid for the item
// only safe to call after the bidding event has closed
func getNthHighestBid(itemID string, n int) (*Bid, error) {
	itemBidEntries, err := database.FindRelevantBids(&Bid{ItemID: itemID})
	if err != nil {
		return nil, err
	}

	if len(itemBidEntries) == 0 {
		return nil, errors.New("no bids for this item")
	} else if n >= len(itemBidEntries) {
		return nil, errors.New("offset is greater than the number of bids for this item")
	}

	return itemBidEntries[n], nil
}

func getHighestBid(itemID string) (*Bid, error) {
	return getNthHighestBid(itemID, 1)
}

func getUserBidHistory(userID string) ([]*Bid, error) {
	userBidHistory, err := database.FindRelevantBids(&Bid{UserID: userID})
	if err != nil {
		return nil, err
	}
	return userBidHistory, nil
}

func getUserItemBidHistory(userID string, itemID string) ([]*Bid, error) {
	userItemBidHistory, err := database.FindRelevantBids(&Bid{UserID: userID, ItemID: itemID})
	if err != nil {
		return nil, err
	}
	return userItemBidHistory, nil
}

// CloseBidMessage : message sent to the message queue when a bid is closed
type CloseBidMessage struct {
	UserID    string `json:"email"`
	ItemID    string `json:"item_code"`
	BidID     string `json:"bid_id"`
	BidAmount string `json:"price"`
}

// sorts the item bids once the bidding event has closed,
// so we can have a deterministic order of bids for the item in desc order
func closeBid(itemID string) error {

	log.Println("Closing bid for item ", itemID)

	var highestRelevantBid *Bid
	// get the highest bid for that item
	bidDetails, err := database.FindRelevantBids(&Bid{ItemID: itemID})
	if err != nil {
		log.Println("Error while closing bid for item ", itemID, " ", err)
		return err
	}

	if len(bidDetails) != 0 {
		highestRelevantBid = bidDetails[0]
	} else {
		log.Println("No bids for item ", itemID)
		return nil
	}

	data, err := json.Marshal(&CloseBidMessage{ItemID: itemID, BidID: highestRelevantBid.BidID, UserID: highestRelevantBid.UserID, BidAmount: fmt.Sprintf("%v", highestRelevantBid.BidAmount)})
	if err != nil {
		log.Println("Error while closing bid for item ", itemID, " ", err)
		return err
	}

	// send message to message queue
	log.Println("Sending message to message queue ", string(data))

	return messageQueue.publishMessage(data)
}
