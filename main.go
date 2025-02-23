package main

import (
	"Groupie_Tracker/handlers"
	"log"
	"net/http"
)

func main() {
	// Create a new ServeMux
	mux := http.NewServeMux()

	// Handle favicon request
	mux.HandleFunc("/favicon.ico", handlers.HandleFavicon)

	// Main handler
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			handlers.Handle404(w, r)
			return
		}
		handlers.HandleArtists(w, r)
	})

	// Serve about us page
	mux.HandleFunc("/aboutus", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "templates/aboutus.html")
	})

	//Search Bar
	mux.HandleFunc("/search", handlers.HandleSearch)

	// Handle 404 error
	mux.HandleFunc("/404", handlers.Handle404)

	// Serve static files
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Start the server with mux as the handler
	log.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux)) // Pass mux here
}
