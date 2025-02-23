package handlers

import (
	"Groupie_Tracker/models"
	"Groupie_Tracker/utils"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

// Convert data to JSON string
func toJSON(data interface{}) (string, error) {
	bytes, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// Rendering Templates
var templates *template.Template
var templateErr error

func init() {
	templates, templateErr = template.New("").Funcs(template.FuncMap{
		"join": utils.JoinStrings,
		"json": toJSON,
	}).ParseFiles("templates/index.html")

	if templateErr != nil {
		log.Printf("Error parsing templates: %v", templateErr)
	}
}

// Handling error 404 - Page Not Found
func Handle404(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("X-Error-Message", "Page not found")
	w.WriteHeader(http.StatusNotFound)

	http.ServeFile(w, r, "templates/404.html")
}

// Handling error 500 - Internal Server Error
func Handle500(w http.ResponseWriter, r *http.Request, err error) {
	if r.URL.Path == "/favicon.ico" {
		HandleFavicon(w, r)
		return
	}

	// Set headers and serve the error page
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("X-Error-Message", err.Error())
	w.WriteHeader(http.StatusInternalServerError)

	http.ServeFile(w, r, "templates/500.html")
}

func HandleArtists(w http.ResponseWriter, r *http.Request) {
	if templateErr != nil {
		Handle500(w, r, templateErr)
		return
	}

	// Fetch artists data
	var artists []models.Artist
	err := utils.FetchData("https://groupietrackers.herokuapp.com/api/artists", &artists)
	if err != nil {
		Handle500(w, r, err)
		return
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	var fetchErr error

	for i := range artists {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()

			var locations models.Location
			var dates models.Date
			var relations models.Relation

			// Fetch locations
			if err := utils.FetchData(artists[i].LocationsURL, &locations); err != nil {
				mu.Lock()
				fetchErr = err
				mu.Unlock()
				return
			}

			// Fetch dates
			if err := utils.FetchData(artists[i].DatesURL, &dates); err != nil {
				mu.Lock()
				fetchErr = err
				mu.Unlock()
				return
			}

			// Fetch relations
			if err := utils.FetchData(artists[i].RelationURL, &relations); err != nil {
				mu.Lock()
				fetchErr = err
				mu.Unlock()
				return
			}

			// Store the fetched data
			mu.Lock()
			artists[i].Locations = locations.Locations
			artists[i].Dates = dates.Dates
			artists[i].Relations = relations
			mu.Unlock()
		}(i)
	}
	//It is used to wait for all concurrent goroutines to finish before continuing
	wg.Wait()
	//This checks if any error occurred while fetching the data for the artists
	if fetchErr != nil {
		Handle500(w, r, fetchErr)
		return
	}
	//Renders the index.html template and writes the result to the HTTP response.
	err = templates.ExecuteTemplate(w, "index.html", artists)
	if err != nil {
		Handle500(w, r, err)
	}
}

// Handling favicon.ico not found
func HandleFavicon(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("X-Error-Message", "Favicon not found")
	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte("404 Favicon not found"))
}

// Handle Search Request
var cachedArtists []models.Artist
var cacheMutex sync.Mutex

func HandleSearch(w http.ResponseWriter, r *http.Request) {
    searchTerm := r.URL.Query().Get("query")

    if searchTerm == "" {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]interface{}{})
        return
    }

    cacheMutex.Lock()
    if cachedArtists == nil {
        // Fetch artists data if not cached
        err := utils.FetchData("https://groupietrackers.herokuapp.com/api/artists", &cachedArtists)
        if err != nil {
            Handle500(w, r, err)
            cacheMutex.Unlock()
            return
        }
    }
    cacheMutex.Unlock()

    var wg sync.WaitGroup
    var mu sync.Mutex
    var artistSuggestions, memberSuggestions, locationSuggestions, firstAlbumSuggestions, creationDateSuggestions, concertDateSuggestions, concertLocationSuggestions []map[string]string
    searchTermLower := strings.ToLower(searchTerm)

    for _, artist := range cachedArtists {
        wg.Add(1)
        go func(artist models.Artist) {
            defer wg.Done()

            // Fetch locations for the artist
            var locations models.Location
            err := utils.FetchData(artist.LocationsURL, &locations)
            if err != nil {
                log.Printf("Error fetching locations for artist %s: %v", artist.Name, err)
                return
            }

            // Fetch concert dates for the artist
            var dates models.Date
            err = utils.FetchData(artist.DatesURL, &dates)
            if err != nil {
                log.Printf("Error fetching dates for artist %s: %v", artist.Name, err)
                return
            }

            // Check artist name
            if strings.HasPrefix(strings.ToLower(artist.Name), searchTermLower) {
                mu.Lock()
                artistSuggestions = append(artistSuggestions, map[string]string{
                    "label": artist.Name,
                    "type":  "Artist",
                })
                mu.Unlock()
            }

            // Check members
            for _, member := range artist.Members {
                if strings.HasPrefix(strings.ToLower(member), searchTermLower) {
                    mu.Lock()
                    memberSuggestions = append(memberSuggestions, map[string]string{
                        "label": artist.Name,
                        "type":  "Member: " + member,
                    })
                    mu.Unlock()
                }
            }

            // Check creation date
            creationDate := strconv.Itoa(artist.CreationDate)
            if strings.HasPrefix(creationDate, searchTermLower) {
                mu.Lock()
                creationDateSuggestions = append(creationDateSuggestions, map[string]string{
                    "label": artist.Name,
                    "type":  "Created in " + creationDate,
                })
                mu.Unlock()
            }

            // Check first album date
            if strings.HasPrefix(strings.ToLower(artist.FirstAlbum), searchTermLower) {
                mu.Lock()
                firstAlbumSuggestions = append(firstAlbumSuggestions, map[string]string{
                    "label": artist.Name,
                    "type":  "First Album: " + artist.FirstAlbum,
                })
                mu.Unlock()
            }

            // Check locations
            for _, location := range locations.Locations {
                if strings.HasPrefix(strings.ToLower(location), searchTermLower) {
                    mu.Lock()
                    locationSuggestions = append(locationSuggestions, map[string]string{
                        "label": artist.Name,
                        "type":  "Location: " + formatLocation(location),
                    })
                    mu.Unlock()
                }
            }

            // Check concert dates
            for _, date := range dates.Dates {
                if strings.HasPrefix(strings.ToLower(date), searchTermLower) {
                    mu.Lock()
                    concertDateSuggestions = append(concertDateSuggestions, map[string]string{
                        "label": artist.Name,
                        "type":  "Concert Date: " + date,
                    })
                    mu.Unlock()
                }
            }

            // Check concert locations (e.g., "Greece")
            for _, location := range locations.Locations {
                if strings.Contains(strings.ToLower(location), searchTermLower) {
                    mu.Lock()
                    concertLocationSuggestions = append(concertLocationSuggestions, map[string]string{
                        "label": artist.Name,
                        "type":  "Concert Location: " + formatLocation(location),
                    })
                    mu.Unlock()
                }
            }
        }(artist)
    }

    // Wait for all goroutines to finish
    wg.Wait()

    // Combine all suggestions in the desired order
    suggestions := append(artistSuggestions, memberSuggestions...)
    suggestions = append(suggestions, locationSuggestions...)
    suggestions = append(suggestions, firstAlbumSuggestions...)
    suggestions = append(suggestions, creationDateSuggestions...)
    suggestions = append(suggestions, concertDateSuggestions...)
    suggestions = append(suggestions, concertLocationSuggestions...) // Concert locations have the lowest priority

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(suggestions)
}

// Helper function to format location (capitalize cities and countries)
func formatLocation(location string) string {
    // Replace underscores with spaces
    formattedLocation := strings.ReplaceAll(location, "_", " ")

    // Remove asterisks
    formattedLocation = strings.ReplaceAll(formattedLocation, "*", "")

    // Split into parts (city and country)
    parts := strings.Split(formattedLocation, "-")

    // Capitalize each word in the city and country
    for i, part := range parts {
        words := strings.Split(part, " ")
        for j, word := range words {
            // Skip capitalization for 'usa' and 'uk' (already handled)
            if strings.ToLower(word) == "usa" || strings.ToLower(word) == "uk" {
                words[j] = strings.ToUpper(word)
            } else {
                // Capitalize the first letter of each word
                words[j] = strings.Title(strings.ToLower(word))
            }
        }
        parts[i] = strings.Join(words, " ")
    }

    // Join city and country with a hyphen
    formattedLocation = strings.Join(parts, "-")

    return formattedLocation
}

// Helper function to check if any member exactly matches the search term
func containsExactMember(members []string, searchTerm string) bool {
	for _, member := range members {
		if strings.EqualFold(member, searchTerm) {
			return true
		}
	}
	return false
}
