package dataview

import (
	"path/filepath"
	"reflect"
	"strconv"
	"strings"

	"github.com/progrium/vizgo/pkg/jsonpointer"
)

type View struct {
	ptr interface{}
}

func New(p interface{}) *View {
	return &View{
		ptr: p,
	}
}

func (o *View) set(path string, v interface{}) {
	jsonpointer.SetReflect(o.ptr, path, v)
}

func (o *View) get(path string) reflect.Value {
	parts := strings.Split(strings.TrimLeft(path, "/"), "/")
	selection := reflect.ValueOf(o.ptr)
	for _, key := range parts {
		selection = prop(selection, key)
	}
	return selection
}

func (o *View) Select(path ...string) Cursor {
	normalpath := strings.Join(path, "/")
	return &cursor{
		view: o,
		path: normalpath,
	}
}

func (o *View) ValueTo(v interface{}) {
	rv := reflect.ValueOf(v)
	rv.Elem().Set(reflect.ValueOf(o.Value()))
}

func (o *View) Value() interface{} {
	return o.ptr
}

func (o *View) Path() string {
	return "/"
}

type cursor struct {
	view *View
	path string
}

func (c *cursor) Select(path ...string) Cursor {
	fullpath := filepath.Join(c.path, strings.Join(path, "/"))
	return c.view.Select(fullpath)
}

func (c *cursor) ValueTo(v interface{}) {
	rv := reflect.ValueOf(v)
	rv.Elem().Set(reflect.ValueOf(c.Value()))
}

func (c *cursor) Value() interface{} {
	return reflect.Indirect(c.view.get(c.path)).Interface()
}

func (c *cursor) Set(v interface{}) {
	c.view.set(c.path, v)
}

func (c *cursor) Unset() interface{} {
	// TODO
	return nil
}

func (c *cursor) Append(v interface{}) {
	rv := c.view.get(c.path)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		panic("cannot Append to non-slice and non-array value of kind: " + rv.Kind().String())
	}
	rv.Set(reflect.Append(rv, reflect.ValueOf(v)))
}

func (c *cursor) Insert(idx int, v interface{}) {
	rv := c.view.get(c.path)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		panic("cannot Insert to non-slice and non-array value of kind: " + rv.Kind().String())
	}
	if idx < 0 || idx >= rv.Len() {
		panic("index out of range for Insert")
	}
	nv := reflect.Append(rv, reflect.Zero(rv.Type().Elem()))
	reflect.Copy(nv.Slice(idx+1, nv.Len()), nv.Slice(idx, nv.Len()))
	nv.Index(idx).Set(reflect.ValueOf(v))
	rv.Set(nv)
}

func (c *cursor) Merge(v interface{}) {
	// TODO
}

func (c *cursor) Path() string {
	return c.path
}

func (c *cursor) Root() *View {
	return c.view
}

type Cursor interface {
	Select(path ...string) Cursor
	ValueTo(v interface{})
	Value() interface{}
	Set(v interface{})
	Unset() interface{}
	Append(v interface{})
	Insert(idx int, v interface{})
	Merge(v interface{})
	Path() string
	Root() *View
}

func prop(robj reflect.Value, key string) reflect.Value {
	rtyp := robj.Type()
	switch rtyp.Kind() {
	case reflect.Slice:
		idx, err := strconv.Atoi(key)
		if err != nil {
			panic("non-numeric index given for slice")
		}
		rval := robj.Index(idx)
		if rval.IsValid() {
			return rval
		}
	case reflect.Ptr:
		return prop(robj.Elem(), key)
	case reflect.Map:
		rval := robj.MapIndex(reflect.ValueOf(key))
		if rval.IsValid() {
			return rval
		}
	case reflect.Struct:
		rval := robj.FieldByName(key)
		if rval.IsValid() {
			return rval
		}
		for i := 0; i < rtyp.NumField(); i++ {
			field := rtyp.Field(i)
			tag := strings.Split(field.Tag.Get("json"), ",")
			if tag[0] == key || field.Name == key {
				return robj.FieldByName(field.Name)
			}
		}
	}
	panic("unexpected kind")
}
