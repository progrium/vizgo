package dataview

import (
	"path/filepath"
	"reflect"
	"testing"
)

type testData struct {
	StringValue string
	IntValue    int
	BoolValue   bool
	MapValue    map[string]string
	SliceValue  []string
}

type testStructure struct {
	MapValue    map[string]*testData
	SliceValue  []testData
	StructValue testData
	PtrValue    *testData
}

func newTestStructure() testStructure {
	ptr := newTestData("qux")
	return testStructure{
		MapValue: map[string]*testData{
			"one": newTestData("foo"),
			"two": newTestData("bar"),
		},
		SliceValue: []testData{
			*newTestData("one"),
			*newTestData("two"),
		},
		StructValue: *newTestData("foobar"),
		PtrValue:    ptr,
	}
}

func newTestData(s string) *testData {
	return &testData{
		StringValue: s,
		IntValue:    100,
		BoolValue:   true,
		MapValue: map[string]string{
			"one": s,
			"two": s,
		},
		SliceValue: []string{"one", "two"},
	}
}

func TestCursorValue(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	for _, tt := range []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", "foobar"},
		{"PtrValue/StringValue", "qux"},
		{"MapValue/one/StringValue", "foo"},
	} {
		t.Run(tt.in, func(t *testing.T) {
			got := view.Select(tt.in).Value().(string)

			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

}

func TestCursorValueTo(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	// STRINGS

	for _, tt := range []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", "foobar"},
		{"PtrValue/StringValue", "qux"},
		{"MapValue/one/StringValue", "foo"},
	} {
		t.Run(tt.in, func(t *testing.T) {
			var got string
			view.Select(tt.in).ValueTo(&got)

			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

	// MAPS

	for _, tt := range []struct {
		in  string
		out string
	}{
		{"StructValue/MapValue", "foobar"},
		{"PtrValue/MapValue", "qux"},
		{"MapValue/one/MapValue", "foo"},
	} {
		t.Run(tt.in, func(t *testing.T) {
			var got map[string]string
			view.Select(tt.in).ValueTo(&got)

			if got["one"] != tt.out || got["two"] != tt.out {
				t.Fatalf("expected values '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

}

func TestCursorSet(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	// strings

	for _, tt := range []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", "foobar2"},
		{"SliceValue/0/StringValue", "foobar2"},
		{"MapValue/one/StringValue", "foobar2"},
	} {
		t.Run(tt.in, func(t *testing.T) {
			cur := view.Select(tt.in)
			cur.Set(tt.out)
			got := cur.Value().(string)

			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

	// maps

	for _, tt := range []struct {
		in  string
		out interface{}
	}{
		{"MapValue/one", newTestData("one")},
		{"StructValue/MapValue/two", "test"},
	} {
		t.Run(tt.in, func(t *testing.T) {
			cur := view.Select(tt.in)
			cur.Set(tt.out)
			got := cur.Value()

			if !reflect.DeepEqual(got, New(tt.out).Value()) {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

}

func TestCursorUnset(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	// strings

	for _, tt := range []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", ""},
		{"SliceValue/0/StringValue", ""},
	} {
		t.Run(tt.in, func(t *testing.T) {
			cur := view.Select(tt.in)
			cur.Unset()
			got := cur.Value().(string)

			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

	// maps

	for _, tt := range []struct {
		in  string
		out []string
	}{
		{"MapValue/one", []string{"two"}},
		{"StructValue/MapValue/two", []string{"one"}},
	} {
		t.Run(tt.in, func(t *testing.T) {
			cur := view.Select(filepath.Dir(tt.in))
			cur.Select(filepath.Base(tt.in)).Unset()
			got := cur.Keys()

			if !reflect.DeepEqual(got, tt.out) {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

}

func TestCursorAppend(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	for _, tt := range []struct {
		in  string
		out []string
	}{
		{"StructValue/SliceValue", []string{"one", "two", "three", "four"}},
	} {
		t.Run(tt.in, func(t *testing.T) {
			cur := view.Select(tt.in)
			cur.Append("three")
			cur.Append("four")
			got := cur.Value().([]string)

			if !reflect.DeepEqual(got, tt.out) {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}
}

func TestCursorInsert(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	for _, tt := range []struct {
		in  string
		out []string
	}{
		{"StructValue/SliceValue", []string{"one", "one-half", "two"}},
	} {
		t.Run(tt.in, func(t *testing.T) {
			cur := view.Select(tt.in)
			cur.Insert(1, "one-half")
			got := cur.Value().([]string)

			if !reflect.DeepEqual(got, tt.out) {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}
}

func TestObservers(t *testing.T) {
	data := newTestStructure()
	view := New(&data)

	var rootTriggers = 0
	view.Observe(func(c Cursor) {
		rootTriggers++
	})
	var curTriggers = 0
	view.Select("StructValue").Observe(func(c Cursor) {
		curTriggers++
	})

	for _, tt := range []struct {
		in     string
		rcount int
		ccount int
	}{
		{"PtrValue/StringValue", 1, 0},
		{"StructValue/StringValue", 2, 1},
	} {
		t.Run(tt.in, func(t *testing.T) {
			view.Select(tt.in).Set("new")

			if rootTriggers != tt.rcount {
				t.Fatalf("expected '%#v' but got '%#v'", tt.rcount, rootTriggers)
			}
			if curTriggers != tt.ccount {
				t.Fatalf("expected '%#v' but got '%#v'", tt.ccount, curTriggers)
			}
		})
	}
}
