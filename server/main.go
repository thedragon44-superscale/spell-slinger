package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("❌ WebSocket Upgrade Error:", err)
		return
	}
	defer conn.Close()

	log.Println("🔌 Client connected successfully!")

	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("❌ Client disconnected:", err)
			break
		}

		// Handle incoming binary frames from the client
		if messageType == websocket.BinaryMessage {
			log.Printf("📦 Received binary packet: %d bytes", len(msg))
			// TODO: Pass bytes to binary input decoder
		} else {
			log.Printf("📥 Received text message: %s", string(msg))
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	log.Println("🚀 Spell Slinger Server running on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
