package main

// A Bid is something placed by the user on an item in the auction system.
type Bid struct {
	BidAmount float64 `json:"bid_amount" bson:"bid_amount,omitempty"`
	UserID    string  `json:"user_id" bson:"user_id,omitempty"`
	ItemID    string  `json:"item_id" bson:"item_id,omitempty"`
	BidID     string  `json:"bid_id" bson:"_id,omitempty"`
}
