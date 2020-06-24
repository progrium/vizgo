# vizgo

a visual golang software editor

## Prereqs

* go 1.14
* whatever is required for Cgo
* for dev:
    * [go-bindata](https://github.com/shuLhan/go-bindata) `go get -u github.com/shuLhan/go-bindata/...`
    * [hotweb](https://github.com/progrium/hotweb): `go install github.com/progrium/hotweb/cmd/...`
* for mac:
    * XCode Command Line Tools
* for linux:
    * gtk+3.0-dev
    * webkit2gtk-dev

## Dev Notes

Moving forward going to be less dependent on Makefile for developer oriented tasks and instead using shell functions in `.devrc` which you can manually source, or if you have zsh
you can install [this hook](https://gist.github.com/progrium/ea7cba82a90ac0d06fb2517e21761013) in your profile to have it automatically sourced.

## License

Not released under any license yet
