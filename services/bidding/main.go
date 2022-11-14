package main

import (
	"encoding/json"
	_ "encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/spf13/viper"
	"log"
	"net/http"
)

// PathToConfig : path to the config file
const PathToConfig = "config/settings.env"

func main() {
	readFromConfig(PathToConfig)
	InitializeBiddingCoordinator()

	StartDBConnection()

	ConnectToMessageQueue()
	defer messageQueue.disconnect()

	// set up the handlers
	r := mux.NewRouter()

	r.HandleFunc("/bid/health", HealthHandler).Methods("GET")
	r.HandleFunc("/bid", PlaceBidHandler).Methods("POST")
	r.HandleFunc("/close-bid", CloseBidHandler).Methods("POST")
	r.HandleFunc("/bid/top", GetHighestNthBidHandler).Methods("POST")
	r.HandleFunc("/bid/user", GetUserBidHistoryHandler).Methods("POST")
	r.HandleFunc("/bid/user-item", GetUserItemBidHistoryHandler).Methods("POST")
	r.HandleFunc("/bid/user-item/top", GetTopUserItemBidHandler).Methods("POST")
	http.Handle("/", r)

	r.Methods("OPTIONS").HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			enableCORS(&w)
			w.WriteHeader(http.StatusOK)
		})

	// handler func
	fmt.Println("Starting server on port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Println("There was an error listening on port :8080", err)
	}
}

func readFromConfig(file string) {
	viper.SetConfigFile(file)
	err := viper.ReadInConfig()
	if err != nil {
		log.Println("There was an error reading the config file", err)
	}
	log.Printf("Using config file: %s", viper.ConfigFileUsed())
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "*")
	(*w).Header().Set("Access-Control-Allow-Headers", "*")
}

// HealthHandler : handler for the health endpoint
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Health check")
	w.WriteHeader(http.StatusOK)
}

// PlaceBidRequest : request for placing a bid
type PlaceBidRequest struct {
	UserID    string  `json:"user_id"`
	ItemID    string  `json:"item_id"`
	BidAmount float64 `json:"bid_amount"`
}

// PlaceBidHandler : handler for the place bid endpoint
func PlaceBidHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)

	// get the token from the request
	var req PlaceBidRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	bid := &Bid{req.BidAmount,
		req.UserID,
		req.ItemID,
		uuid.New().String(),
	}

	// place the bid
	if err := placeBid(bid); err != nil {
		log.Println("There was an error placing the bid", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
}

// GetHighestNthBidRequest : request for getting the highest bid for an item with offset
type GetHighestNthBidRequest struct {
	ItemID string `json:"item_id"`
	N      int    `json:"offset"`
}

// GetHighestNthBidResponse : response for getting the highest bid for an item with offset
type GetHighestNthBidResponse struct {
	Bid *Bid `json:"bid"`
}

// GetHighestNthBidHandler : request for getting the highest bid for an item with offset
func GetHighestNthBidHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)

	// get the token from the request
	var req GetHighestNthBidRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	// get the bid
	bid, err := getNthHighestBid(req.ItemID, req.N)
	if err != nil {
		log.Println("There was an error getting the bid", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	resp := GetHighestNthBidResponse{bid}
	json.NewEncoder(w).Encode(resp)
}

// GetUserBidHistoryRequest : request for getting the bid history for a user
type GetUserBidHistoryRequest struct {
	UserID string `json:"user_id"`
}

// GetUserBidHistoryResponse : response for getting the bid history for a user
type GetUserBidHistoryResponse struct {
	BidHistory []*Bid `json:"user_bid_history"`
}

// GetUserBidHistoryHandler : request for getting the bid history for a user
func GetUserBidHistoryHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)

	// get the token from the request
	var req GetUserBidHistoryRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	// get the bid
	bidHistory, err := getUserBidHistory(req.UserID)
	if err != nil {
		log.Println("There was an error getting the bid", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	resp := GetUserBidHistoryResponse{bidHistory}
	json.NewEncoder(w).Encode(resp)
}

// GetUserItemBidHistoryRequest : request for getting the bid history for a user-item pair
type GetUserItemBidHistoryRequest struct {
	UserID string `json:"user_id"`
	ItemID string `json:"item_id"`
}

// GetUserItemBidHistoryResponse : response for getting the bid history for a user-item pair
type GetUserItemBidHistoryResponse struct {
	ItemBidHistory []*Bid `json:"user_item_bid_history"`
}

// GetUserItemBidHistoryHandler : request for getting the bid history for a user-item pair
func GetUserItemBidHistoryHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)

	// get the token from the request
	var req GetUserItemBidHistoryRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	// get the bid
	bidHistory, err := getUserItemBidHistory(req.UserID, req.ItemID)
	if err != nil {
		log.Println("There was an error getting the bid", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	resp := GetUserItemBidHistoryResponse{bidHistory}
	json.NewEncoder(w).Encode(resp)
}

// GetTopUserItemBidRequest : request for getting the top bid for a user-item pair
type GetTopUserItemBidRequest struct {
	UserID string `json:"user_id"`
	ItemID string `json:"item_id"`
}

// GetTopUserItemBidResponse : response for getting the top bid for a user-item pair
type GetTopUserItemBidResponse struct {
	Bid *Bid `json:"bid"`
}

// GetTopUserItemBidHandler : request for getting the top bid for a user-item pair
func GetTopUserItemBidHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)

	// get the token from the request
	var req GetTopUserItemBidRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	// get the bid
	bidHistory, err := getUserItemBidHistory(req.UserID, req.ItemID)
	if err != nil {
		log.Println("There was an error getting the bid", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	resp := GetTopUserItemBidResponse{bidHistory[len(bidHistory)-1]}
	json.NewEncoder(w).Encode(resp)
}

// CloseBidRequest : request for closing a bid
type CloseBidRequest struct {
	ItemID string `json:"item_id"`
}

// CloseBidHandler : request for closing a bid
func CloseBidHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)

	// get the token from the request
	var req CloseBidRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println("There was an error decoding the request", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}

	// close the bid
	err = closeBid(req.ItemID)
	if err != nil {
		log.Println("There was an error closing the bid", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
}
