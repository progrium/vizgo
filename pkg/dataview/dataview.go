package dataview

import (
	"path/filepath"
	"reflect"
	"sort"
	"strconv"
	"strings"

	"github.com/davecgh/go-spew/spew"
)

type Cursor interface {
	Select(path ...string) Cursor
	ValueTo(v interface{})
	Value() interface{}
	Set(v interface{})
	Unset() interface{}
	Append(v interface{})
	Insert(idx int, v interface{})
	Merge(v interface{})
	Keys() []string
	Path() string
	Root() *View
	Observe(fn func(Cursor))
	Unobserve(fn func(Cursor))
}

type observer struct {
	path string
	fn   func(Cursor)
}

type View struct {
	*cursor

	ptr       interface{}
	observers []*observer
}

func New(p interface{}) *View {
	v := &View{
		ptr:    p,
		cursor: &cursor{},
	}
	v.cursor.view = v
	return v
}

func (o *View) set(c *cursor, v interface{}) {
	SetReflect(o.ptr, c.path, v)
	o.notify(c.path, c)
}

func (o *View) unset(c *cursor) interface{} {
	SetReflect(o.ptr, c.path, nil)
	o.notify(c.path, c)
	return nil
}

func (o *View) append(c *cursor, v interface{}) {
	rv := o.get(c)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		panic("cannot Append to non-slice and non-array value of kind: " + rv.Kind().String())
	}
	rv.Set(reflect.Append(rv, reflect.ValueOf(v)))
	o.notify(c.path, c)
}

func (o *View) insert(c *cursor, idx int, v interface{}) {
	rv := o.get(c)
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
	o.notify(c.path, c)
}

func (o *View) merge(c *cursor, v interface{}) {
	// TODO
	o.notify(c.path, c)
}

func (o *View) get(c *cursor) reflect.Value {
	parts := strings.Split(c.path, "/")
	selection := reflect.ValueOf(o.ptr)
	for _, key := range parts {
		if key == "" {
			continue
		}
		selection = prop(selection, key)
	}
	return selection
}

func (o *View) keys(c *cursor) []string {
	return keys(o.get(c))
}

func (o *View) sel(path ...string) Cursor {
	normalpath := strings.TrimLeft(strings.Join(path, "/"), "/")
	return &cursor{
		view: o,
		path: normalpath,
	}
}

func (v *View) observe(o *observer) {
	v.observers = append(v.observers, o)
}

func (v *View) unobserve(o *observer) {
	tmp := v.observers[:0]
	for _, obs := range v.observers {
		if obs != o {
			tmp = append(tmp, obs)
		}
	}
	v.observers = tmp
}

func (v *View) notify(path string, cur Cursor) {
	for _, o := range v.observers {
		if strings.HasPrefix(path, o.path) {
			o.fn(cur)
		}
	}
}

type cursor struct {
	view *View
	path string
}

func (c *cursor) Observe(fn func(Cursor)) {
	c.view.observe(&observer{
		path: c.path,
		fn:   fn,
	})
}

func (c *cursor) Unobserve(fn func(Cursor)) {
	c.view.unobserve(&observer{
		path: c.path,
		fn:   fn,
	})
}

func (c *cursor) Select(path ...string) Cursor {
	fullpath := filepath.Join(c.path, strings.Join(path, "/"))
	return c.view.sel(fullpath)
}

func (c *cursor) ValueTo(v interface{}) {
	rv := reflect.ValueOf(v)
	rv.Elem().Set(reflect.Indirect(reflect.ValueOf(c.Value())))
}

func (c *cursor) Value() interface{} {
	return reflect.Indirect(c.view.get(c)).Interface()
}

func (c *cursor) Set(v interface{}) {
	c.view.set(c, v)
}

func (c *cursor) Unset() interface{} {
	return c.view.unset(c)
}

func (c *cursor) Append(v interface{}) {
	c.view.append(c, v)
}

func (c *cursor) Insert(idx int, v interface{}) {
	c.view.insert(c, idx, v)
}

func (c *cursor) Merge(v interface{}) {
	c.view.merge(c, v)
}

func (c *cursor) Keys() []string {
	return c.view.keys(c)
}

func (c *cursor) Path() string {
	return c.path
}

func (c *cursor) Root() *View {
	return c.view
}

type PropGetter interface {
	Prop(key string) reflect.Value
}

var propGetterType = reflect.TypeOf((*PropGetter)(nil)).Elem()

func prop(robj reflect.Value, key string) reflect.Value {
	rtyp := robj.Type()
	if rtyp.Implements(propGetterType) {
		args := []reflect.Value{reflect.ValueOf(key)}
		return robj.MethodByName("Prop").Call(args)[0].Interface().(reflect.Value)
	}
	switch rtyp.Kind() {
	case reflect.Slice, reflect.Array:
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
	spew.Dump(robj, key)
	panic("unexpected kind: " + rtyp.Kind().String())
}

func keys(v reflect.Value) []string {
	switch v.Type().Kind() {
	case reflect.Map:
		var keys []string
		for _, key := range v.MapKeys() {
			k, ok := key.Interface().(string)
			if !ok {
				continue
			}
			keys = append(keys, k)
		}
		sort.Sort(sort.StringSlice(keys))
		return keys
	case reflect.Struct:
		t := v.Type()
		var f []string
		for i := 0; i < t.NumField(); i++ {
			name := t.Field(i).Name
			// first letter capitalized means exported
			if name[0] == strings.ToUpper(name)[0] {
				f = append(f, name)
			}
		}
		return f
	default:
		return []string{}
	}
}
