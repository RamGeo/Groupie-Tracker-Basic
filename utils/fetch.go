package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// FetchData makes an HTTP GET request to the given URL and decodes the JSON response into target.
func FetchData(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to fetch data: %w", err)
	}
	defer resp.Body.Close()

	//This makes error messages clearer by adding the HTTP status text 
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d %s", resp.StatusCode, http.StatusText(resp.StatusCode))
	}

	// Directly decode JSON into the target struct - this also reducing memory usage! And removes extra err declarations and makes the function cleaner!
	if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
		return fmt.Errorf("failed to decode JSON: %w", err)
	}

	return nil
}
