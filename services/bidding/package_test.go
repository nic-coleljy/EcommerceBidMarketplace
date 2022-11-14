package main

import (
	"github.com/google/uuid"
	"testing"
)

func TestMain(m *testing.M) {
	readFromConfig("config/settings.env")
	InitializeBiddingCoordinator()
	StartDBConnection()
	m.Run()
}

func TestAddBidsAndGetHighest(t *testing.T) {
	bidAmounts := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
	itemID := uuid.New().String()
	biddingUsers := []string{uuid.New().String(), uuid.New().String(), uuid.New().String(),
		uuid.New().String(), uuid.New().String()}

	// make the mock bids
	bids := make([]*Bid, len(bidAmounts))
	for i := 0; i < len(bidAmounts); i++ {
		bids[i] = &Bid{
			BidAmount: bidAmounts[i],
			ItemID:    itemID,
			UserID:    biddingUsers[i],
		}
	}

	// place all the bid
	for _, bid := range bids {
		err := placeBid(bid)
		if err != nil {
			t.Errorf("Error placing bid: %v", err)
		}
	}

	// get the highest bid in the system
	highestBid, err := getNthHighestBid(itemID, 0)
	if err != nil {
		t.Errorf("Error getting highest bid: %v", err)
	}

	// check that the highest bid is the highest bid
	if highestBid.BidAmount != 5.0 || highestBid.UserID != biddingUsers[4] {
		t.Errorf("Highest bid was not the highest bid")
	}

	// test has passed
}

func TestAddInvalidBid(t *testing.T) {

	itemID := uuid.New().String()
	userID := uuid.New().String()

	bid := &Bid{
		BidAmount: 5.0,
		ItemID:    itemID,
		UserID:    userID,
		BidID:     uuid.New().String(),
	}

	// place the bid
	err := placeBid(bid)
	if err != nil {
		t.Errorf("Error placing a first bid")
	}

	// place a bid that is lower than the bidder has placed before
	bid = &Bid{
		BidAmount: 4.0,
		ItemID:    itemID,
		UserID:    userID,
		BidID:     uuid.New().String(),
	}

	// place the bid
	err = placeBid(bid)
	if err == nil {
		t.Errorf("Expected error placing bid but got nil")
	}

	// test has passed
}

func TestGetHighestBidWhenThereAreNoBids(t *testing.T) {
	// get the highest bid in the system for an item that has no bids
	highestBid, err := getNthHighestBid(uuid.New().String(), 0)
	if err == nil {
		t.Errorf("Expected error getting highest bid when there are no bids but got error")
	}

	// check highest bid is nil
	if highestBid != nil {
		t.Errorf("Expected nil highest bid but got %v", highestBid)
	}

	// test has passed
}
