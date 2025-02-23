package utils

import "strings"

// JoinStrings joins an array of strings with a given separator
func JoinStrings(a []string, sep string) string {
	return strings.Join(a, sep)
}
