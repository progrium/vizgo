package dataview

import "testing"

type testStructure struct {
	MapValue    map[string]testData
	SliceValue  []testData
	StructValue testData
	PtrValue    *testData
}

type testData struct {
	StringValue string
	IntValue    int
	BoolValue   bool
	MapValue    map[string]string
	SliceValue  []string
}

func newTestData(s string) testData {
	return testData{
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

func newTestStructure() testStructure {
	ptr := newTestData("qux")
	return testStructure{
		MapValue: map[string]testData{
			"one": newTestData("foo"),
			"two": newTestData("bar"),
		},
		SliceValue: []testData{
			newTestData("one"),
			newTestData("two"),
		},
		StructValue: newTestData("foobar"),
		PtrValue:    &ptr,
	}
}

func TestCursorValue(t *testing.T) {
	view := New(newTestStructure())

	var tests = []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", "foobar"},
		{"PtrValue/StringValue", "qux"},
		{"MapValue/one/StringValue", "foo"},
	}

	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got := view.Select(tt.in).Value().(string)
			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

}

func TestCursorValueTo(t *testing.T) {
	view := New(newTestStructure())

	var stringTests = []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", "foobar"},
		{"PtrValue/StringValue", "qux"},
		{"MapValue/one/StringValue", "foo"},
	}

	for _, tt := range stringTests {
		t.Run(tt.in, func(t *testing.T) {
			var got string
			view.Select(tt.in).ValueTo(&got)
			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

	var mapTests = []struct {
		in  string
		out string
	}{
		{"StructValue/MapValue", "foobar"},
		{"PtrValue/MapValue", "qux"},
		{"MapValue/one/MapValue", "foo"},
	}

	for _, tt := range mapTests {
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

	var tests = []struct {
		in  string
		out string
	}{
		{"StructValue/StringValue", "foobar2"},
		// {"MapValue/one/StringValue", "foobar2"},
		{"SliceValue/0/StringValue", "foobar2"},
	}

	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			view.Select(tt.in).Set(tt.out)
			got := view.Select(tt.in).Value().(string)
			if got != tt.out {
				t.Fatalf("expected '%#v' but got '%#v'", tt.out, got)
			}
		})
	}

}
