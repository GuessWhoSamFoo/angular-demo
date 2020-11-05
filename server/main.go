package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.ListenAndServe(":8080", http.FileServer(http.Dir("../demo/dist/")))
	fmt.Println("hello world")
}


