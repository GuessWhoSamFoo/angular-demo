package main

import (
	"net/http"
)

func main() {
	http.HandleFunc("/v1/api", apiHandler)
	http.ListenAndServe(":8080", nil)
}

func apiHandler(res http.ResponseWriter, req *http.Request) {
	data := []byte("{\"api\":\"v1\"}")
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(200)
	res.Write(data)
}
