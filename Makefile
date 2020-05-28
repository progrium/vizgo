
build:
	mkdir -p local/bin
	go-bindata -pkg ui -o pkg/data/ui/bindata.go ./ui/...
	go build -o local/bin/vizgo ./cmd/vizgo

dev:
	UI_DIR=./ui go run cmd/vizgo/main.go