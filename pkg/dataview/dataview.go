package dataview

import (
	"path/filepath"
	"reflect"
	"strconv"
	"strings"

	"github.com/progrium/vizgo/pkg/jsonpointer"
)

type View struct {
	root  interface{}
	rroot reflect.Value
}

func New(v interface{}) *View {
	return &View{
		root:  v,
		rroot: reflect.ValueOf(v),
	}
}

func (t *View) set(path string, v interface{}) {
	jsonpointer.SetReflect(t.root, path, v)
}

func (t *View) get(path string) interface{} {
	parts := strings.Split(strings.TrimLeft(path, "/"), "/")
	selection := t.root
	for _, key := range parts {
		selection = prop(selection, key)
	}
	return selection
}

func (t *View) Select(path ...string) Cursor {
	normalpath := strings.Join(path, "/")
	return &cursor{
		root: t,
		path: normalpath,
	}
}

func (t *View) ValueTo(v interface{}) {
	rv := reflect.ValueOf(v)
	rv.Elem().Set(reflect.ValueOf(t.Value()))
}

func (t *View) Value() interface{} {
	return t.root
}

func (t *View) Path() string {
	return "/"
}

type cursor struct {
	root *View
	path string
}

func (c *cursor) Select(path ...string) Cursor {
	fullpath := filepath.Join(c.path, strings.Join(path, "/"))
	return c.root.Select(fullpath)
}

func (c *cursor) ValueTo(v interface{}) {
	rv := reflect.ValueOf(v)
	rv.Elem().Set(reflect.ValueOf(c.Value()))
}

func (c *cursor) Value() interface{} {
	return c.root.get(c.path)
}

func (c *cursor) Set(v interface{}) {
	c.root.set(c.path, v)
}

func (c *cursor) Unset() {

}

func (c *cursor) Path() string {
	return c.path
}

func (c *cursor) Root() *View {
	return c.root
}

type Cursor interface {
	Select(path ...string) Cursor
	ValueTo(v interface{})
	Value() interface{}
	Set(v interface{})
	Unset()
	Path() string
	Root() *View
}

func prop(obj interface{}, key string) interface{} {
	robj := reflect.ValueOf(obj)
	rtyp := reflect.TypeOf(obj)
	switch rtyp.Kind() {
	case reflect.Slice:
		idx, err := strconv.Atoi(key)
		if err != nil {
			panic("non-numeric index given for slice")
		}
		rval := robj.Index(idx)
		if rval.IsValid() {
			return rval.Interface()
		}
	case reflect.Ptr:
		return prop(robj.Elem().Interface(), key)
	case reflect.Map:
		rval := robj.MapIndex(reflect.ValueOf(key))
		if rval.IsValid() {
			return rval.Interface()
		}
	case reflect.Struct:
		rval := robj.FieldByName(key)
		if rval.IsValid() {
			return rval.Interface()
		}
		for i := 0; i < rtyp.NumField(); i++ {
			field := rtyp.Field(i)
			tag := strings.Split(field.Tag.Get("json"), ",")
			if tag[0] == key || field.Name == key {
				return robj.FieldByName(field.Name).Interface()
			}
		}
	}
	panic("unexpected kind")
}
