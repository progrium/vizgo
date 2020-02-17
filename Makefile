
dev:
	hotweb -dir=./ui -ignore=/vnd

app:
	go run ./cmd/constructor/main.go