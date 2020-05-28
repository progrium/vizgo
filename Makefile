
build:
	mkdir -p local/bin
	go build -o local/bin/vizgo ./cmd/vizgo

dev:
	cd cmd/vizgo;\
	go run main.go