package vizgo

import (
	"crypto/rand"
	"encoding/binary"
	"fmt"
	"time"
)

func uid() string {
	t := time.Now().Unix()
	buf := make([]byte, binary.MaxVarintLen64)
	binary.PutVarint(buf, t)
	token := make([]byte, 4)
	rand.Read(token)
	return fmt.Sprintf("B%x", append(buf[:4], token...))
}
