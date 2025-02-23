package models

// The code defines a set of data structures for representing information about an Artist, Location, Date, and Relation in a Go application. 
//It uses Go structs to organize the data and JSON tags to specify how the fields should be serialized into JSON format.
type Artist struct {
	ID           int      `json:"id"`
	Name         string   `json:"name"`
	Image        string   `json:"image"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	LocationsURL string   `json:"locations"`
	DatesURL     string   `json:"concertDates"`
	RelationURL  string   `json:"relations"`
	Locations    []string `json:"locationsData"`
	Dates        []string `json:"datesData"`
	Relations    Relation `json:"relationsData"`
	
}

type Location struct {
	Locations []string `json:"locations"`
}

type Date struct {
	Dates []string `json:"dates"`
}

type Relation struct {
	DatesLocations map[string][]string `json:"datesLocations"`
}

