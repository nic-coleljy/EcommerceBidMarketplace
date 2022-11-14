package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"net/http"
)

// constants for the bidding endpoints paths
const (
	PlaceBidEndpoint = "http://bidding:8080/bid"       // endpoint + path to place bid
	CloseBidEndpoint = "http://bidding:8080/close-bid" // endpoint + path to close bid
)

// PlaceBidRequest is the request to place a bid
type PlaceBidRequest struct {
	ItemID    string  `json:"item_id"`
	BidAmount float64 `json:"bid_amount"`
	UserID    string  `json:"user_id"`
	BidID     string  `json:"bid_id"`
}

// CloseBidRequest is the request to close a bid
type CloseBidRequest struct {
	ItemID string `json:"item_id"`
}

func main() {
	// call the endpoint
	bid := &PlaceBidRequest{ItemID: uuid.New().String(), BidAmount: 1.0, UserID: uuid.New().String(), BidID: uuid.New().String()}
	body, _ := json.Marshal(bid)

	resp, err := http.Post(PlaceBidEndpoint, "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println("There was an error calling the endpoint", err)
		panic(err)
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Println("There was an error calling the endpoint", resp.StatusCode)
		panic(err)
	}

	fmt.Println("Successfully placed bid")

	// close bid
	closeBid := &CloseBidRequest{ItemID: bid.ItemID}
	body, _ = json.Marshal(closeBid)

	resp, err = http.Post(CloseBidEndpoint, "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println("There was an error calling the endpoint", err)
		panic(err)
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Println("There was an error calling the close bid endpoint", resp.StatusCode)
		panic(err)
	}

	fmt.Println("Successfully closed bid")

}
