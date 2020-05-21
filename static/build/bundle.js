
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Components/Standings.svelte generated by Svelte v3.22.3 */

    const file = "src/Components/Standings.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (109:12) {#each StangingData.teams as team}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let div1;
    	let figure;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let h6;
    	let t1_value = /*team*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let td1;
    	let t3_value = /*team*/ ctx[1].played_matches + "";
    	let t3;
    	let t4;
    	let td2;
    	let t5_value = /*team*/ ctx[1].won_matches + "";
    	let t5;
    	let t6;
    	let td3;
    	let t7_value = /*team*/ ctx[1].tied_matches + "";
    	let t7;
    	let t8;
    	let td4;
    	let t9_value = /*team*/ ctx[1].lose_matches + "";
    	let t9;
    	let t10;
    	let td5;
    	let t11_value = /*team*/ ctx[1].points + "";
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			div1 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h6 = element("h6");
    			t1 = text(t1_value);
    			t2 = space();
    			td1 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			t5 = text(t5_value);
    			t6 = space();
    			td3 = element("td");
    			t7 = text(t7_value);
    			t8 = space();
    			td4 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			td5 = element("td");
    			t11 = text(t11_value);
    			t12 = space();
    			if (img.src !== (img_src_value = /*team*/ ctx[1].logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*team*/ ctx[1].logo_alt);
    			add_location(img, file, 113, 22, 2945);
    			attr_dev(figure, "class", "team-meta__logo");
    			add_location(figure, file, 112, 20, 2890);
    			attr_dev(h6, "class", "team-meta__name");
    			add_location(h6, file, 118, 22, 3139);
    			attr_dev(div0, "class", "team-meta__info");
    			add_location(div0, file, 117, 20, 3087);
    			attr_dev(div1, "class", "team-meta");
    			add_location(div1, file, 111, 18, 2846);
    			add_location(td0, file, 110, 16, 2823);
    			add_location(td1, file, 122, 16, 3274);
    			add_location(td2, file, 123, 16, 3321);
    			add_location(td3, file, 124, 16, 3365);
    			add_location(td4, file, 125, 16, 3410);
    			add_location(td5, file, 126, 16, 3455);
    			add_location(tr, file, 109, 14, 2802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, div1);
    			append_dev(div1, figure);
    			append_dev(figure, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(h6, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td3);
    			append_dev(td3, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td4);
    			append_dev(td4, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td5);
    			append_dev(td5, t11);
    			append_dev(tr, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(109:12) {#each StangingData.teams as team}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let aside;
    	let div0;
    	let h4;
    	let t1;
    	let a;
    	let t3;
    	let div2;
    	let div1;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t9;
    	let th3;
    	let t11;
    	let th4;
    	let t13;
    	let th5;
    	let t15;
    	let tbody;
    	let each_value = /*StangingData*/ ctx[0].teams;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			aside = element("aside");
    			div0 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Liga Lipangue - Senior Clausura 2019";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Estadísticas";
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Posición";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "J";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "G";
    			t9 = space();
    			th3 = element("th");
    			th3.textContent = "E";
    			t11 = space();
    			th4 = element("th");
    			th4.textContent = "P";
    			t13 = space();
    			th5 = element("th");
    			th5.textContent = "PTS";
    			t15 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h4, file, 87, 6, 2162);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "btn btn-default btn-outline btn-xs card-header__button");
    			add_location(a, file, 88, 6, 2214);
    			attr_dev(div0, "class", "widget__title card__header card__header--has-btn");
    			add_location(div0, file, 86, 4, 2093);
    			add_location(th0, file, 99, 14, 2541);
    			add_location(th1, file, 100, 14, 2573);
    			add_location(th2, file, 101, 14, 2598);
    			add_location(th3, file, 102, 14, 2623);
    			add_location(th4, file, 103, 14, 2648);
    			add_location(th5, file, 104, 14, 2673);
    			add_location(tr, file, 98, 12, 2522);
    			add_location(thead, file, 97, 10, 2502);
    			add_location(tbody, file, 107, 10, 2733);
    			attr_dev(table, "class", "table table-hover table-standings");
    			add_location(table, file, 96, 8, 2442);
    			attr_dev(div1, "class", "table-responsive");
    			add_location(div1, file, 95, 6, 2403);
    			attr_dev(div2, "class", "widget__content card__content");
    			add_location(div2, file, 94, 4, 2353);
    			attr_dev(aside, "class", "widget card widget--sidebar widget-standings");
    			add_location(aside, file, 85, 2, 2028);
    			attr_dev(div3, "class", "standings");
    			add_location(div3, file, 84, 0, 2002);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, aside);
    			append_dev(aside, div0);
    			append_dev(div0, h4);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(aside, t3);
    			append_dev(aside, div2);
    			append_dev(div2, div1);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(tr, t9);
    			append_dev(tr, th3);
    			append_dev(tr, t11);
    			append_dev(tr, th4);
    			append_dev(tr, t13);
    			append_dev(tr, th5);
    			append_dev(table, t15);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*StangingData*/ 1) {
    				each_value = /*StangingData*/ ctx[0].teams;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const StangingData = {
    		teams: [
    			{
    				name: "Flamigos",
    				description: "Description",
    				logo: "assets/images/logos/flamigos.png",
    				logo_alt: "Flamigos",
    				played_matches: 6,
    				won_matches: 5,
    				tied_matches: 0,
    				lose_matches: 1,
    				points: 15
    			},
    			{
    				name: "Scratch",
    				description: "Description",
    				logo: "assets/images/logos/scratch.png",
    				logo_alt: "Scratch",
    				played_matches: 6,
    				won_matches: 4,
    				tied_matches: 0,
    				lose_matches: 2,
    				points: 12
    			},
    			{
    				name: "TEI",
    				description: "Description",
    				logo: "assets/images/logos/tei.png",
    				logo_alt: "TEI",
    				played_matches: 6,
    				won_matches: 3,
    				tied_matches: 1,
    				lose_matches: 2,
    				points: 10
    			},
    			{
    				name: "Shangai NC",
    				description: "Description",
    				logo: "assets/images/logos/shangai.png",
    				logo_alt: "Shangai NC",
    				played_matches: 6,
    				won_matches: 3,
    				tied_matches: 1,
    				lose_matches: 2,
    				points: 10
    			},
    			{
    				name: "All In",
    				description: "Description",
    				logo: "assets/images/logos/allin.png",
    				logo_alt: "TEI",
    				played_matches: 6,
    				won_matches: 1,
    				tied_matches: 3,
    				lose_matches: 2,
    				points: 6
    			},
    			{
    				name: "Racing",
    				description: "Description",
    				logo: "assets/images/logos/racing.png",
    				logo_alt: "Racing",
    				played_matches: 6,
    				won_matches: 1,
    				tied_matches: 1,
    				lose_matches: 4,
    				points: 4
    			},
    			{
    				name: "Juventud Charrua",
    				description: "Description",
    				logo: "assets/images/logos/charrua.png",
    				logo_alt: "Juventud Charrua",
    				played_matches: 6,
    				won_matches: 1,
    				tied_matches: 0,
    				lose_matches: 5,
    				points: 3
    			}
    		]
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Standings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Standings", $$slots, []);
    	$$self.$capture_state = () => ({ StangingData });
    	return [StangingData];
    }

    class Standings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Standings",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* node_modules/svelte-images/src/Images/Image.svelte generated by Svelte v3.22.3 */

    const file$1 = "node_modules/svelte-images/src/Images/Image.svelte";

    function create_fragment$1(ctx) {
    	let img;
    	let load_action;
    	let dispose;
    	let img_levels = [/*imageProps*/ ctx[0], { alt: /*imageProps*/ ctx[0].alt || "" }];
    	let img_data = {};

    	for (let i = 0; i < img_levels.length; i += 1) {
    		img_data = assign(img_data, img_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_attributes(img, img_data);
    			toggle_class(img, "blur", !/*loaded*/ ctx[2]);
    			toggle_class(img, "after-load", /*afterLoad*/ ctx[3]);
    			toggle_class(img, "loaded", /*loaded*/ ctx[2]);
    			toggle_class(img, "svelte-1ayq9qu", true);
    			add_location(img, file$1, 29, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, img, anchor);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(
    					img,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				action_destroyer(load_action = /*load*/ ctx[4].call(null, img))
    			];
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			set_attributes(img, get_spread_update(img_levels, [
    				dirty & /*imageProps*/ 1 && /*imageProps*/ ctx[0],
    				dirty & /*imageProps*/ 1 && { alt: /*imageProps*/ ctx[0].alt || "" }
    			]));

    			toggle_class(img, "blur", !/*loaded*/ ctx[2]);
    			toggle_class(img, "after-load", /*afterLoad*/ ctx[3]);
    			toggle_class(img, "loaded", /*loaded*/ ctx[2]);
    			toggle_class(img, "svelte-1ayq9qu", true);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { lazy = true } = $$props;
    	let { imageProps = {} } = $$props;

    	let { onClick = () => {
    		
    	} } = $$props;

    	let className = "";
    	let loaded = !lazy;
    	let afterLoad = false;

    	function load(img) {
    		img.onload = () => {
    			$$invalidate(2, loaded = true);
    			setTimeout(() => $$invalidate(3, afterLoad = true), 1500);
    		};
    	}

    	const writable_props = ["lazy", "imageProps", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Image", $$slots, []);

    	$$self.$set = $$props => {
    		if ("lazy" in $$props) $$invalidate(5, lazy = $$props.lazy);
    		if ("imageProps" in $$props) $$invalidate(0, imageProps = $$props.imageProps);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		lazy,
    		imageProps,
    		onClick,
    		className,
    		loaded,
    		afterLoad,
    		load
    	});

    	$$self.$inject_state = $$props => {
    		if ("lazy" in $$props) $$invalidate(5, lazy = $$props.lazy);
    		if ("imageProps" in $$props) $$invalidate(0, imageProps = $$props.imageProps);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    		if ("className" in $$props) className = $$props.className;
    		if ("loaded" in $$props) $$invalidate(2, loaded = $$props.loaded);
    		if ("afterLoad" in $$props) $$invalidate(3, afterLoad = $$props.afterLoad);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageProps, onClick, loaded, afterLoad, load, lazy];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { lazy: 5, imageProps: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get lazy() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lazy(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageProps() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageProps(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let modalStore = writable({});
    const open = (Component, props) => {
      modalStore.set({ isOpen: true, Component, props });
    };
    const close = () => {
      modalStore.set({ isOpen: false, Component: null, props: {} });
    };

    /* node_modules/svelte-images/src/Images/Modal.svelte generated by Svelte v3.22.3 */
    const file$2 = "node_modules/svelte-images/src/Images/Modal.svelte";

    // (63:2) {#if isOpen}
    function create_if_block(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div1_transition;
    	let div2_transition;
    	let current;
    	let dispose;
    	const switch_instance_spread_levels = [/*props*/ ctx[1]];
    	var switch_value = /*Component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-rppnts");
    			add_location(div0, file$2, 72, 8, 1464);
    			attr_dev(div1, "class", "window-wrap svelte-rppnts");
    			add_location(div1, file$2, 68, 6, 1353);
    			attr_dev(div2, "class", "bg svelte-rppnts");
    			add_location(div2, file$2, 63, 4, 1219);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div1_binding*/ ctx[11](div1);
    			/*div2_binding*/ ctx[12](div2);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div2, "click", /*handleOuterClick*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 2)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[1])])
    			: {};

    			if (switch_value !== (switch_value = /*Component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 300 }, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 300 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 300 }, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 300 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[11](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[12](null);
    			if (detaching && div2_transition) div2_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:2) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t;
    	let current;
    	let dispose;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block(ctx);
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-rppnts");
    			add_location(div, file$2, 61, 0, 1194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[9], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let state = {};
    	let isOpen = false;
    	let props = null;
    	let Component = null;
    	let background;
    	let wrap;

    	const handleKeyup = ({ key }) => {
    		if (Component && key === "Escape") {
    			event.preventDefault();
    			close();
    		}
    	};

    	const handleOuterClick = event => {
    		if (event.target === background || event.target === wrap) {
    			event.preventDefault();
    			close();
    		}
    	};

    	const unsubscribe = modalStore.subscribe(value => {
    		$$invalidate(2, Component = value.Component);
    		$$invalidate(1, props = value.props);
    		$$invalidate(0, isOpen = value.isOpen);
    	});

    	onDestroy(unsubscribe);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, wrap = $$value);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, background = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		fade,
    		modalStore,
    		open,
    		close,
    		state,
    		isOpen,
    		props,
    		Component,
    		background,
    		wrap,
    		handleKeyup,
    		handleOuterClick,
    		unsubscribe
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) state = $$props.state;
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("Component" in $$props) $$invalidate(2, Component = $$props.Component);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(4, wrap = $$props.wrap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpen,
    		props,
    		Component,
    		background,
    		wrap,
    		handleKeyup,
    		handleOuterClick,
    		state,
    		unsubscribe,
    		$$scope,
    		$$slots,
    		div1_binding,
    		div2_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-images/src/Images/ClickOutside.svelte generated by Svelte v3.22.3 */
    const file$3 = "node_modules/svelte-images/src/Images/ClickOutside.svelte";

    function create_fragment$3(ctx) {
    	let t;
    	let div;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", /*className*/ ctx[0]);
    			add_location(div, file$3, 26, 0, 656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(document.body, "click", /*onClickOutside*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}

    			if (!current || dirty & /*className*/ 1) {
    				attr_dev(div, "class", /*className*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[8](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { exclude = [] } = $$props;
    	let { className } = $$props;
    	let child;
    	const dispatch = createEventDispatcher();

    	function isExcluded(target) {
    		var parent = target;

    		while (parent) {
    			if (exclude.indexOf(parent) >= 0 || parent === child) {
    				return true;
    			}

    			parent = parent.parentNode;
    		}

    		return false;
    	}

    	function onClickOutside(event) {
    		if (!isExcluded(event.target)) {
    			event.preventDefault();
    			dispatch("clickoutside");
    		}
    	}

    	const writable_props = ["exclude", "className"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClickOutside> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ClickOutside", $$slots, ['default']);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, child = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("exclude" in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		exclude,
    		className,
    		child,
    		dispatch,
    		isExcluded,
    		onClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ("exclude" in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("child" in $$props) $$invalidate(1, child = $$props.child);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		className,
    		child,
    		onClickOutside,
    		exclude,
    		dispatch,
    		isExcluded,
    		$$scope,
    		$$slots,
    		div_binding
    	];
    }

    class ClickOutside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { exclude: 3, className: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClickOutside",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*className*/ ctx[0] === undefined && !("className" in props)) {
    			console.warn("<ClickOutside> was created without expected prop 'className'");
    		}
    	}

    	get exclude() {
    		throw new Error("<ClickOutside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<ClickOutside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<ClickOutside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<ClickOutside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-images/src/Images/Carousel.svelte generated by Svelte v3.22.3 */

    const { window: window_1 } = globals;
    const file$4 = "node_modules/svelte-images/src/Images/Carousel.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (161:6) {#each images as image, i}
    function create_each_block$1(ctx) {
    	let div;
    	let i = /*i*/ ctx[18];
    	let t;
    	let current;
    	const assign_image = () => /*image_binding*/ ctx[15](image, i);
    	const unassign_image = () => /*image_binding*/ ctx[15](null, i);
    	let image_props = { imageProps: /*image*/ ctx[16] };
    	const image = new Image({ props: image_props, $$inline: true });
    	assign_image();

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(image.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "img-container svelte-m9pjbw");
    			add_location(div, file$4, 161, 8, 3610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(image, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (i !== /*i*/ ctx[18]) {
    				unassign_image();
    				i = /*i*/ ctx[18];
    				assign_image();
    			}

    			const image_changes = {};
    			if (dirty & /*images*/ 1) image_changes.imageProps = /*image*/ ctx[16];
    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			unassign_image();
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(161:6) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (157:4) <ClickOutside       className="click-outside-wrapper"       on:clickoutside={handleClose}       exclude={[left_nav_button, right_nav_button, ...image_elements]}>
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*images*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images, image_elements*/ 9) {
    				each_value = /*images*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(157:4) <ClickOutside       className=\\\"click-outside-wrapper\\\"       on:clickoutside={handleClose}       exclude={[left_nav_button, right_nav_button, ...image_elements]}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let button0;
    	let svg0;
    	let path0;
    	let t0;
    	let button1;
    	let svg1;
    	let path1;
    	let t1;
    	let div1;
    	let div1_style_value;
    	let current;
    	let dispose;

    	const clickoutside = new ClickOutside({
    			props: {
    				className: "click-outside-wrapper",
    				exclude: [
    					/*left_nav_button*/ ctx[1],
    					/*right_nav_button*/ ctx[2],
    					.../*image_elements*/ ctx[3]
    				],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	clickoutside.$on("clickoutside", /*handleClose*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			create_component(clickoutside.$$.fragment);
    			attr_dev(path0, "d", "M15.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.406-4.594 4.594z");
    			add_location(path0, file$4, 143, 8, 2980);
    			attr_dev(svg0, "role", "presentation");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "class", "svelte-m9pjbw");
    			add_location(svg0, file$4, 142, 6, 2926);
    			attr_dev(button0, "class", "svelte-m9pjbw");
    			add_location(button0, file$4, 141, 4, 2867);
    			attr_dev(path1, "d", "M9.984 6l6 6-6 6-1.406-1.406 4.594-4.594-4.594-4.594z");
    			add_location(path1, file$4, 149, 8, 3210);
    			attr_dev(svg1, "role", "presentation");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "class", "svelte-m9pjbw");
    			add_location(svg1, file$4, 148, 6, 3156);
    			attr_dev(button1, "class", "svelte-m9pjbw");
    			add_location(button1, file$4, 147, 4, 3095);
    			attr_dev(div0, "class", "nav svelte-m9pjbw");
    			add_location(div0, file$4, 140, 2, 2845);
    			attr_dev(div1, "class", "carousel svelte-m9pjbw");
    			attr_dev(div1, "style", div1_style_value = `transform: translate3d(${/*translateX*/ ctx[4]}px, 0, 0);`);
    			add_location(div1, file$4, 153, 2, 3315);
    			attr_dev(div2, "class", "container svelte-m9pjbw");
    			add_location(div2, file$4, 139, 0, 2819);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			/*button0_binding*/ ctx[13](button0);
    			append_dev(div0, t0);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			/*button1_binding*/ ctx[14](button1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(clickoutside, div1, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(window_1, "resize", /*updatePosition*/ ctx[7], false, false, false),
    				listen_dev(button0, "click", /*left*/ ctx[6], false, false, false),
    				listen_dev(button1, "click", /*right*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const clickoutside_changes = {};

    			if (dirty & /*left_nav_button, right_nav_button, image_elements*/ 14) clickoutside_changes.exclude = [
    				/*left_nav_button*/ ctx[1],
    				/*right_nav_button*/ ctx[2],
    				.../*image_elements*/ ctx[3]
    			];

    			if (dirty & /*$$scope, images, image_elements*/ 524297) {
    				clickoutside_changes.$$scope = { dirty, ctx };
    			}

    			clickoutside.$set(clickoutside_changes);

    			if (!current || dirty & /*translateX*/ 16 && div1_style_value !== (div1_style_value = `transform: translate3d(${/*translateX*/ ctx[4]}px, 0, 0);`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clickoutside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clickoutside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*button0_binding*/ ctx[13](null);
    			/*button1_binding*/ ctx[14](null);
    			destroy_component(clickoutside);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { images } = $$props;
    	let { curr_idx = 0 } = $$props;
    	let left_nav_button;
    	let right_nav_button;
    	const image_elements = new Array(images.length);
    	let translateX = -curr_idx * window.innerWidth;

    	function increment(num) {
    		return num >= images.length - 1 ? 0 : num + 1;
    	}

    	function decrement(num) {
    		return num == 0 ? images.length - 1 : num - 1;
    	}

    	function right() {
    		$$invalidate(9, curr_idx = increment(curr_idx));
    		updatePosition();
    	}

    	function left() {
    		$$invalidate(9, curr_idx = decrement(curr_idx));
    		updatePosition();
    	}

    	function updatePosition() {
    		$$invalidate(4, translateX = -curr_idx * window.innerWidth);
    	}

    	const debouncedClose = debounce(close, 100, true);

    	function handleClose() {
    		debouncedClose();
    	}

    	const writable_props = ["images", "curr_idx"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", $$slots, []);

    	function button0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, left_nav_button = $$value);
    		});
    	}

    	function button1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, right_nav_button = $$value);
    		});
    	}

    	function image_binding($$value, i) {
    		if (image_elements[i] === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			image_elements[i] = $$value;
    			$$invalidate(3, image_elements);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("curr_idx" in $$props) $$invalidate(9, curr_idx = $$props.curr_idx);
    	};

    	$$self.$capture_state = () => ({
    		Image,
    		fade,
    		close,
    		debounce,
    		ClickOutside,
    		images,
    		curr_idx,
    		left_nav_button,
    		right_nav_button,
    		image_elements,
    		translateX,
    		increment,
    		decrement,
    		right,
    		left,
    		updatePosition,
    		debouncedClose,
    		handleClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("curr_idx" in $$props) $$invalidate(9, curr_idx = $$props.curr_idx);
    		if ("left_nav_button" in $$props) $$invalidate(1, left_nav_button = $$props.left_nav_button);
    		if ("right_nav_button" in $$props) $$invalidate(2, right_nav_button = $$props.right_nav_button);
    		if ("translateX" in $$props) $$invalidate(4, translateX = $$props.translateX);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		images,
    		left_nav_button,
    		right_nav_button,
    		image_elements,
    		translateX,
    		right,
    		left,
    		updatePosition,
    		handleClose,
    		curr_idx,
    		increment,
    		decrement,
    		debouncedClose,
    		button0_binding,
    		button1_binding,
    		image_binding
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { images: 0, curr_idx: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*images*/ ctx[0] === undefined && !("images" in props)) {
    			console.warn("<Carousel> was created without expected prop 'images'");
    		}
    	}

    	get images() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get curr_idx() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set curr_idx(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const open$1 = (images, curr_idx) => {
      open(Carousel, { images, curr_idx });
    };
    const close$1 = close;

    /* node_modules/svelte-images/src/Images/Images.svelte generated by Svelte v3.22.3 */
    const file$5 = "node_modules/svelte-images/src/Images/Images.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (52:2) {#each images as image, i}
    function create_each_block$2(ctx) {
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[7](/*i*/ ctx[11], ...args);
    	}

    	const image = new Image({
    			props: {
    				imageProps: {
    					.../*image*/ ctx[9],
    					src: /*image*/ ctx[9].thumbnail || /*image*/ ctx[9].src,
    					alt: /*image*/ ctx[9].alt || "",
    					style: /*numCols*/ ctx[2] != undefined
    					? `width: ${100 / /*numCols*/ ctx[2] - 6}%;`
    					: "max-width: 200px;"
    				},
    				onClick: func
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(image.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(image, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const image_changes = {};

    			if (dirty & /*images, numCols*/ 5) image_changes.imageProps = {
    				.../*image*/ ctx[9],
    				src: /*image*/ ctx[9].thumbnail || /*image*/ ctx[9].src,
    				alt: /*image*/ ctx[9].alt || "",
    				style: /*numCols*/ ctx[2] != undefined
    				? `width: ${100 / /*numCols*/ ctx[2] - 6}%;`
    				: "max-width: 200px;"
    			};

    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(52:2) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (59:0) {#if showModal}
    function create_if_block$1(ctx) {
    	let current;
    	const modal = new Modal({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*images*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*showModal*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "svelte-images-gallery svelte-3owlk0");
    			set_style(div, "--gutter", /*gutter*/ ctx[1]);
    			add_location(div, file$5, 47, 0, 1024);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images, numCols, undefined, popModal*/ 37) {
    				each_value = /*images*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*gutter*/ 2) {
    				set_style(div, "--gutter", /*gutter*/ ctx[1]);
    			}

    			if (/*showModal*/ ctx[4]) {
    				if (if_block) {
    					if (dirty & /*showModal*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { images = [] } = $$props;
    	let { gutter = 2 } = $$props;
    	let { numCols } = $$props;

    	const popModal = idx => setTimeout(
    		() => {
    			open$1(images, idx);
    		},
    		0
    	);

    	let galleryElems;
    	let galleryElem;
    	let showModal;

    	onMount(() => {
    		galleryElems = document.getElementsByClassName("svelte-images-gallery");
    		const index = Array.prototype.findIndex.call(galleryElems, elem => elem === galleryElem);
    		$$invalidate(4, showModal = index === 0);
    	});

    	const writable_props = ["images", "gutter", "numCols"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Images> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Images", $$slots, []);
    	const func = i => popModal(i);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, galleryElem = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("gutter" in $$props) $$invalidate(1, gutter = $$props.gutter);
    		if ("numCols" in $$props) $$invalidate(2, numCols = $$props.numCols);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Image,
    		Modal,
    		open: open$1,
    		close: close$1,
    		images,
    		gutter,
    		numCols,
    		popModal,
    		galleryElems,
    		galleryElem,
    		showModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("gutter" in $$props) $$invalidate(1, gutter = $$props.gutter);
    		if ("numCols" in $$props) $$invalidate(2, numCols = $$props.numCols);
    		if ("galleryElems" in $$props) galleryElems = $$props.galleryElems;
    		if ("galleryElem" in $$props) $$invalidate(3, galleryElem = $$props.galleryElem);
    		if ("showModal" in $$props) $$invalidate(4, showModal = $$props.showModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		images,
    		gutter,
    		numCols,
    		galleryElem,
    		showModal,
    		popModal,
    		galleryElems,
    		func,
    		div_binding
    	];
    }

    class Images extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { images: 0, gutter: 1, numCols: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Images",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*numCols*/ ctx[2] === undefined && !("numCols" in props)) {
    			console.warn("<Images> was created without expected prop 'numCols'");
    		}
    	}

    	get images() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gutter() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gutter(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numCols() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numCols(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/News.svelte generated by Svelte v3.22.3 */
    const file$6 = "src/Components/News.svelte";

    function create_fragment$6(ctx) {
    	let div43;
    	let div42;
    	let div41;
    	let div40;
    	let div11;
    	let div10;
    	let header;
    	let h40;
    	let t1;
    	let ul0;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let a1;
    	let t5;
    	let li2;
    	let a2;
    	let t7;
    	let div0;
    	let t8;
    	let div9;
    	let div8;
    	let div7;
    	let a3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t9;
    	let div6;
    	let div2;
    	let span0;
    	let t11;
    	let h3;
    	let t12;
    	let span1;
    	let t14;
    	let t15;
    	let div5;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t16;
    	let div4;
    	let h41;
    	let t18;
    	let time;
    	let t20;
    	let div39;
    	let t21;
    	let div15;
    	let aside;
    	let a4;
    	let div12;
    	let i0;
    	let t22;
    	let h60;
    	let t24;
    	let span3;
    	let span2;
    	let t25;
    	let t26;
    	let span4;
    	let t27;
    	let a5;
    	let div13;
    	let i1;
    	let t28;
    	let h61;
    	let t30;
    	let span6;
    	let span5;
    	let t31;
    	let t32;
    	let span7;
    	let t33;
    	let a6;
    	let div14;
    	let i2;
    	let t34;
    	let h62;
    	let t36;
    	let span9;
    	let span8;
    	let t38;
    	let t39;
    	let span10;
    	let t40;
    	let div16;
    	let t41;
    	let div38;
    	let div37;
    	let div36;
    	let div17;
    	let button;
    	let span11;
    	let t43;
    	let div35;
    	let div34;
    	let div18;
    	let p;
    	let t44;
    	let a7;
    	let t46;
    	let t47;
    	let div33;
    	let div31;
    	let div24;
    	let form0;
    	let h50;
    	let t49;
    	let div19;
    	let input0;
    	let t50;
    	let div20;
    	let input1;
    	let t51;
    	let div21;
    	let label;
    	let input2;
    	let t52;
    	let span12;
    	let t53;
    	let a8;
    	let t55;
    	let div22;
    	let a9;
    	let t57;
    	let div23;
    	let h63;
    	let t59;
    	let ul1;
    	let li3;
    	let a10;
    	let i3;
    	let t60;
    	let li4;
    	let a11;
    	let i4;
    	let t61;
    	let li5;
    	let a12;
    	let i5;
    	let t62;
    	let div30;
    	let form1;
    	let h51;
    	let t64;
    	let div25;
    	let input3;
    	let t65;
    	let div26;
    	let input4;
    	let t66;
    	let div27;
    	let input5;
    	let t67;
    	let div28;
    	let a13;
    	let t69;
    	let div29;
    	let t71;
    	let div32;
    	let ul2;
    	let li6;
    	let a14;
    	let t73;
    	let li7;
    	let a15;
    	let current;

    	const images_1 = new Images({
    			props: { images: /*images*/ ctx[0], gutter: 5 },
    			$$inline: true
    		});

    	const standings = new Standings({ $$inline: true });

    	const block = {
    		c: function create() {
    			div43 = element("div");
    			div42 = element("div");
    			div41 = element("div");
    			div40 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			header = element("header");
    			h40 = element("h4");
    			h40.textContent = "Noticias";
    			t1 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Todas";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Nuestro Equipo";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "La Liga";
    			t7 = space();
    			div0 = element("div");
    			create_component(images_1.$$.fragment);
    			t8 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			a3 = element("a");
    			div1 = element("div");
    			img0 = element("img");
    			t9 = space();
    			div6 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "Nuestro Equipo";
    			t11 = space();
    			h3 = element("h3");
    			t12 = text("La Historia de\n                        ");
    			span1 = element("span");
    			span1.textContent = "Racing";
    			t14 = text("\n                        Dueños de una pasión");
    			t15 = space();
    			div5 = element("div");
    			div3 = element("div");
    			img1 = element("img");
    			t16 = space();
    			div4 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Nicolas Apraiz";
    			t18 = space();
    			time = element("time");
    			time.textContent = "30 de Junio, 2018";
    			t20 = space();
    			div39 = element("div");
    			create_component(standings.$$.fragment);
    			t21 = space();
    			div15 = element("div");
    			aside = element("aside");
    			a4 = element("a");
    			div12 = element("div");
    			i0 = element("i");
    			t22 = space();
    			h60 = element("h6");
    			h60.textContent = "Danos like en Facebook";
    			t24 = space();
    			span3 = element("span");
    			span2 = element("span");
    			t25 = text("\n                  Likes");
    			t26 = space();
    			span4 = element("span");
    			t27 = space();
    			a5 = element("a");
    			div13 = element("div");
    			i1 = element("i");
    			t28 = space();
    			h61 = element("h6");
    			h61.textContent = "Síguenos en Twitter";
    			t30 = space();
    			span6 = element("span");
    			span5 = element("span");
    			t31 = text("\n                  Seguidores");
    			t32 = space();
    			span7 = element("span");
    			t33 = space();
    			a6 = element("a");
    			div14 = element("div");
    			i2 = element("i");
    			t34 = space();
    			h62 = element("h6");
    			h62.textContent = "Sigue nuestras notícias";
    			t36 = space();
    			span9 = element("span");
    			span8 = element("span");
    			span8.textContent = "840";
    			t38 = text("\n                  Seguidores");
    			t39 = space();
    			span10 = element("span");
    			t40 = space();
    			div16 = element("div");
    			t41 = space();
    			div38 = element("div");
    			div37 = element("div");
    			div36 = element("div");
    			div17 = element("div");
    			button = element("button");
    			span11 = element("span");
    			span11.textContent = "×";
    			t43 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div18 = element("div");
    			p = element("p");
    			t44 = text("Don’t have an account?\n                        ");
    			a7 = element("a");
    			a7.textContent = "Register Now";
    			t46 = text("\n                        and enjoy all our benefits!");
    			t47 = space();
    			div33 = element("div");
    			div31 = element("div");
    			div24 = element("div");
    			form0 = element("form");
    			h50 = element("h5");
    			h50.textContent = "Login to your account";
    			t49 = space();
    			div19 = element("div");
    			input0 = element("input");
    			t50 = space();
    			div20 = element("div");
    			input1 = element("input");
    			t51 = space();
    			div21 = element("div");
    			label = element("label");
    			input2 = element("input");
    			t52 = text("\n                                Remember Me\n                                ");
    			span12 = element("span");
    			t53 = space();
    			a8 = element("a");
    			a8.textContent = "Forgot your password?";
    			t55 = space();
    			div22 = element("div");
    			a9 = element("a");
    			a9.textContent = "Enter to your account";
    			t57 = space();
    			div23 = element("div");
    			h63 = element("h6");
    			h63.textContent = "or Login with your social profile:";
    			t59 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a10 = element("a");
    			i3 = element("i");
    			t60 = space();
    			li4 = element("li");
    			a11 = element("a");
    			i4 = element("i");
    			t61 = space();
    			li5 = element("li");
    			a12 = element("a");
    			i5 = element("i");
    			t62 = space();
    			div30 = element("div");
    			form1 = element("form");
    			h51 = element("h5");
    			h51.textContent = "Register Now!";
    			t64 = space();
    			div25 = element("div");
    			input3 = element("input");
    			t65 = space();
    			div26 = element("div");
    			input4 = element("input");
    			t66 = space();
    			div27 = element("div");
    			input5 = element("input");
    			t67 = space();
    			div28 = element("div");
    			a13 = element("a");
    			a13.textContent = "Create Your Account";
    			t69 = space();
    			div29 = element("div");
    			div29.textContent = "You’ll receive a confirmation email in your inbox\n                              with a link to activate your account.";
    			t71 = space();
    			div32 = element("div");
    			ul2 = element("ul");
    			li6 = element("li");
    			a14 = element("a");
    			a14.textContent = "Login";
    			t73 = space();
    			li7 = element("li");
    			a15 = element("a");
    			a15.textContent = "Register";
    			add_location(h40, file$6, 39, 14, 812);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "category-filter__link category-filter__link--reset\n                    category-filter__link--active");
    			add_location(a0, file$6, 42, 18, 968);
    			attr_dev(li0, "class", "category-filter__item");
    			add_location(li0, file$6, 41, 16, 915);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "category-filter__link");
    			attr_dev(a1, "data-category", "posts__item--category-1");
    			add_location(a1, file$6, 50, 18, 1270);
    			attr_dev(li1, "class", "category-filter__item");
    			add_location(li1, file$6, 49, 16, 1217);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "category-filter__link");
    			attr_dev(a2, "data-category", "posts__item--category-3");
    			add_location(a2, file$6, 58, 18, 1562);
    			attr_dev(li2, "class", "category-filter__item");
    			add_location(li2, file$6, 57, 16, 1509);
    			attr_dev(ul0, "class", "category-filter category-filter--featured");
    			add_location(ul0, file$6, 40, 14, 844);
    			attr_dev(header, "class", "card__header card__header--has-filter");
    			add_location(header, file$6, 38, 12, 743);
    			attr_dev(div0, "class", "card__content");
    			add_location(div0, file$6, 67, 12, 1832);
    			if (img0.src !== (img0_src_value = "assets/images/soccer/samples/post-slide7.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$6, 77, 22, 2289);
    			attr_dev(div1, "class", "posts__thumb");
    			add_location(div1, file$6, 76, 20, 2240);
    			attr_dev(span0, "class", "label posts__cat-label");
    			add_location(span0, file$6, 83, 24, 2548);
    			attr_dev(div2, "class", "posts__cat");
    			add_location(div2, file$6, 82, 22, 2499);
    			attr_dev(span1, "class", "posts__title-higlight");
    			add_location(span1, file$6, 89, 24, 2799);
    			attr_dev(h3, "class", "posts__title");
    			add_location(h3, file$6, 87, 22, 2710);
    			if (img1.src !== (img1_src_value = "assets/images/samples/avatar-4.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Post Author Avatar");
    			add_location(img1, file$6, 94, 26, 3054);
    			attr_dev(div3, "class", "post-author__avatar");
    			add_location(div3, file$6, 93, 24, 2994);
    			attr_dev(h41, "class", "post-author__name");
    			add_location(h41, file$6, 99, 26, 3297);
    			attr_dev(time, "datetime", "2017-08-28");
    			attr_dev(time, "class", "posts__date");
    			add_location(time, file$6, 100, 26, 3373);
    			attr_dev(div4, "class", "post-author__info");
    			add_location(div4, file$6, 98, 24, 3239);
    			attr_dev(div5, "class", "post-author");
    			add_location(div5, file$6, 92, 22, 2944);
    			attr_dev(div6, "class", "posts__inner");
    			add_location(div6, file$6, 81, 20, 2450);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "posts__link-wrapper");
    			add_location(a3, file$6, 75, 18, 2179);
    			attr_dev(div7, "class", "posts__item posts__item--category-1");
    			add_location(div7, file$6, 74, 16, 2111);
    			attr_dev(div8, "class", "slick posts posts--slider-featured posts-slider\n                posts-slider--center");
    			add_location(div8, file$6, 71, 14, 1980);
    			attr_dev(div9, "class", "card__content");
    			add_location(div9, file$6, 70, 12, 1938);
    			attr_dev(div10, "class", "card card--clean");
    			add_location(div10, file$6, 37, 10, 700);
    			attr_dev(div11, "class", "content col-md-8");
    			add_location(div11, file$6, 36, 8, 659);
    			attr_dev(i0, "class", "fa fa-facebook");
    			add_location(i0, file$6, 123, 18, 4151);
    			attr_dev(div12, "class", "btn-social-counter__icon");
    			add_location(div12, file$6, 122, 16, 4094);
    			attr_dev(h60, "class", "btn-social-counter__title");
    			add_location(h60, file$6, 125, 16, 4219);
    			attr_dev(span2, "class", "btn-social-counter__count-num");
    			add_location(span2, file$6, 129, 18, 4396);
    			attr_dev(span3, "class", "btn-social-counter__count");
    			add_location(span3, file$6, 128, 16, 4337);
    			attr_dev(span4, "class", "btn-social-counter__add-icon");
    			add_location(span4, file$6, 132, 16, 4507);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "btn-social-counter btn-social-counter--fb");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$6, 118, 14, 3951);
    			attr_dev(i1, "class", "fa fa-twitter");
    			add_location(i1, file$6, 139, 18, 4791);
    			attr_dev(div13, "class", "btn-social-counter__icon");
    			add_location(div13, file$6, 138, 16, 4734);
    			attr_dev(h61, "class", "btn-social-counter__title");
    			add_location(h61, file$6, 141, 16, 4858);
    			attr_dev(span5, "class", "btn-social-counter__count-num");
    			add_location(span5, file$6, 143, 18, 4996);
    			attr_dev(span6, "class", "btn-social-counter__count");
    			add_location(span6, file$6, 142, 16, 4937);
    			attr_dev(span7, "class", "btn-social-counter__add-icon");
    			add_location(span7, file$6, 146, 16, 5112);
    			attr_dev(a5, "href", "#");
    			attr_dev(a5, "class", "btn-social-counter btn-social-counter--twitter");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$6, 134, 14, 4586);
    			attr_dev(i2, "class", "fa fa-rss");
    			add_location(i2, file$6, 153, 18, 5392);
    			attr_dev(div14, "class", "btn-social-counter__icon");
    			add_location(div14, file$6, 152, 16, 5335);
    			attr_dev(h62, "class", "btn-social-counter__title");
    			add_location(h62, file$6, 155, 16, 5455);
    			attr_dev(span8, "class", "btn-social-counter__count-num");
    			add_location(span8, file$6, 159, 18, 5633);
    			attr_dev(span9, "class", "btn-social-counter__count");
    			add_location(span9, file$6, 158, 16, 5574);
    			attr_dev(span10, "class", "btn-social-counter__add-icon");
    			add_location(span10, file$6, 162, 16, 5757);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "btn-social-counter btn-social-counter--rss");
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$6, 148, 14, 5191);
    			attr_dev(aside, "class", "widget widget--sidebar widget-social\n              widget-social--condensed");
    			add_location(aside, file$6, 115, 12, 3831);
    			attr_dev(div15, "class", "SocialLinks");
    			add_location(div15, file$6, 114, 10, 3793);
    			attr_dev(div16, "class", "next-match");
    			add_location(div16, file$6, 166, 10, 5870);
    			attr_dev(span11, "aria-hidden", "true");
    			add_location(span11, file$6, 182, 20, 6442);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "close");
    			attr_dev(button, "data-dismiss", "modal");
    			attr_dev(button, "aria-label", "Close");
    			add_location(button, file$6, 177, 18, 6265);
    			attr_dev(div17, "class", "modal-header");
    			add_location(div17, file$6, 176, 16, 6220);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$6, 190, 24, 6839);
    			attr_dev(p, "class", "modal-account__item-register-txt");
    			add_location(p, file$6, 188, 22, 6723);
    			attr_dev(div18, "class", "modal-account__item modal-account__item--logo");
    			add_location(div18, file$6, 187, 20, 6641);
    			add_location(h50, file$6, 201, 28, 7340);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "Enter your email address...");
    			add_location(input0, file$6, 203, 30, 7454);
    			attr_dev(div19, "class", "form-group");
    			add_location(div19, file$6, 202, 28, 7399);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "placeholder", "Enter your password...");
    			add_location(input1, file$6, 209, 30, 7754);
    			attr_dev(div20, "class", "form-group");
    			add_location(div20, file$6, 208, 28, 7699);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "id", "inlineCheckbox1");
    			input2.value = "option1";
    			input2.checked = "";
    			add_location(input2, file$6, 216, 32, 8151);
    			attr_dev(span12, "class", "checkbox-indicator");
    			add_location(span12, file$6, 222, 32, 8437);
    			attr_dev(label, "class", "checkbox checkbox-inline");
    			add_location(label, file$6, 215, 30, 8078);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$6, 224, 30, 8542);
    			attr_dev(div21, "class", "form-group form-group--pass-reminder");
    			add_location(div21, file$6, 214, 28, 7997);
    			attr_dev(a9, "href", "_soccer_shop-account.html");
    			attr_dev(a9, "class", "btn btn-primary-inverse btn-block");
    			add_location(a9, file$6, 227, 30, 8717);
    			attr_dev(div22, "class", "form-group form-group--submit");
    			add_location(div22, file$6, 226, 28, 8643);
    			add_location(h63, file$6, 234, 30, 9075);
    			attr_dev(i3, "class", "fa fa-facebook");
    			add_location(i3, file$6, 244, 36, 9633);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "social-links__link\n                                    social-links__link--lg\n                                    social-links__link--fb");
    			add_location(a10, file$6, 239, 34, 9367);
    			attr_dev(li3, "class", "social-links__item");
    			add_location(li3, file$6, 238, 32, 9301);
    			attr_dev(i4, "class", "fa fa-twitter");
    			add_location(i4, file$6, 253, 36, 10108);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "social-links__link\n                                    social-links__link--lg\n                                    social-links__link--twitter");
    			add_location(a11, file$6, 248, 34, 9837);
    			attr_dev(li4, "class", "social-links__item");
    			add_location(li4, file$6, 247, 32, 9771);
    			attr_dev(i5, "class", "fa fa-google-plus");
    			add_location(i5, file$6, 262, 36, 10580);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "social-links__link\n                                    social-links__link--lg\n                                    social-links__link--gplus");
    			add_location(a12, file$6, 257, 34, 10311);
    			attr_dev(li5, "class", "social-links__item");
    			add_location(li5, file$6, 256, 32, 10245);
    			attr_dev(ul1, "class", "social-links social-links--btn\n                                text-center");
    			add_location(ul1, file$6, 235, 30, 9149);
    			attr_dev(div23, "class", "modal-form--social");
    			add_location(div23, file$6, 233, 28, 9012);
    			attr_dev(form0, "action", "#");
    			attr_dev(form0, "class", "modal-form");
    			add_location(form0, file$6, 200, 26, 7275);
    			attr_dev(div24, "role", "tabpanel");
    			attr_dev(div24, "class", "tab-pane fade show active");
    			attr_dev(div24, "id", "tab-login");
    			add_location(div24, file$6, 196, 24, 7100);
    			add_location(h51, file$6, 274, 28, 11080);
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "class", "form-control");
    			attr_dev(input3, "placeholder", "Enter your email address...");
    			add_location(input3, file$6, 276, 30, 11186);
    			attr_dev(div25, "class", "form-group");
    			add_location(div25, file$6, 275, 28, 11131);
    			attr_dev(input4, "type", "password");
    			attr_dev(input4, "class", "form-control");
    			attr_dev(input4, "placeholder", "Enter your password...");
    			add_location(input4, file$6, 282, 30, 11486);
    			attr_dev(div26, "class", "form-group");
    			add_location(div26, file$6, 281, 28, 11431);
    			attr_dev(input5, "type", "password");
    			attr_dev(input5, "class", "form-control");
    			attr_dev(input5, "placeholder", "Repeat your password...");
    			add_location(input5, file$6, 288, 30, 11784);
    			attr_dev(div27, "class", "form-group");
    			add_location(div27, file$6, 287, 28, 11729);
    			attr_dev(a13, "href", "_soccer_shop-account.html");
    			attr_dev(a13, "class", "btn btn-success btn-block");
    			add_location(a13, file$6, 294, 30, 12102);
    			attr_dev(div28, "class", "form-group form-group--submit");
    			add_location(div28, file$6, 293, 28, 12028);
    			attr_dev(div29, "class", "modal-form--note");
    			add_location(div29, file$6, 300, 28, 12387);
    			attr_dev(form1, "action", "#");
    			attr_dev(form1, "class", "modal-form");
    			add_location(form1, file$6, 273, 26, 11015);
    			attr_dev(div30, "role", "tabpanel");
    			attr_dev(div30, "class", "tab-pane fade");
    			attr_dev(div30, "id", "tab-register");
    			add_location(div30, file$6, 269, 24, 10849);
    			attr_dev(div31, "class", "tab-content");
    			add_location(div31, file$6, 195, 22, 7050);
    			attr_dev(a14, "class", "nav-link active");
    			attr_dev(a14, "href", "#tab-login");
    			attr_dev(a14, "role", "tab");
    			attr_dev(a14, "data-toggle", "tab");
    			add_location(a14, file$6, 312, 28, 12977);
    			attr_dev(li6, "class", "nav-item");
    			add_location(li6, file$6, 311, 26, 12927);
    			attr_dev(a15, "class", "nav-link");
    			attr_dev(a15, "href", "#tab-register");
    			attr_dev(a15, "role", "tab");
    			attr_dev(a15, "data-toggle", "tab");
    			add_location(a15, file$6, 321, 28, 13349);
    			attr_dev(li7, "class", "nav-item");
    			add_location(li7, file$6, 320, 26, 13299);
    			attr_dev(ul2, "class", "nav nav-tabs nav-justified nav-tabs--login");
    			attr_dev(ul2, "role", "tablist");
    			add_location(ul2, file$6, 308, 24, 12778);
    			attr_dev(div32, "class", "nav-tabs-login-wrapper");
    			add_location(div32, file$6, 307, 22, 12717);
    			attr_dev(div33, "class", "modal-account__item");
    			add_location(div33, file$6, 194, 20, 6994);
    			attr_dev(div34, "class", "modal-account-holder");
    			add_location(div34, file$6, 186, 18, 6586);
    			attr_dev(div35, "class", "modal-body");
    			add_location(div35, file$6, 185, 16, 6543);
    			attr_dev(div36, "class", "modal-content");
    			add_location(div36, file$6, 175, 14, 6176);
    			attr_dev(div37, "class", "modal-dialog modal-lg modal--login modal--login-only");
    			attr_dev(div37, "role", "document");
    			add_location(div37, file$6, 172, 12, 6051);
    			attr_dev(div38, "class", "modal fade");
    			attr_dev(div38, "id", "modal-login-register-tabs");
    			attr_dev(div38, "tabindex", "-1");
    			attr_dev(div38, "role", "dialog");
    			add_location(div38, file$6, 167, 10, 5907);
    			attr_dev(div39, "id", "sidebar");
    			attr_dev(div39, "class", "sidebar col-md-4");
    			add_location(div39, file$6, 112, 8, 3715);
    			attr_dev(div40, "class", "row");
    			add_location(div40, file$6, 35, 6, 633);
    			attr_dev(div41, "class", "container");
    			add_location(div41, file$6, 34, 4, 603);
    			attr_dev(div42, "class", "site-content");
    			add_location(div42, file$6, 33, 2, 572);
    			attr_dev(div43, "class", "custom-content");
    			add_location(div43, file$6, 32, 0, 541);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div43, anchor);
    			append_dev(div43, div42);
    			append_dev(div42, div41);
    			append_dev(div41, div40);
    			append_dev(div40, div11);
    			append_dev(div11, div10);
    			append_dev(div10, header);
    			append_dev(header, h40);
    			append_dev(header, t1);
    			append_dev(header, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t5);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(div10, t7);
    			append_dev(div10, div0);
    			mount_component(images_1, div0, null);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, a3);
    			append_dev(a3, div1);
    			append_dev(div1, img0);
    			append_dev(a3, t9);
    			append_dev(a3, div6);
    			append_dev(div6, div2);
    			append_dev(div2, span0);
    			append_dev(div6, t11);
    			append_dev(div6, h3);
    			append_dev(h3, t12);
    			append_dev(h3, span1);
    			append_dev(h3, t14);
    			append_dev(div6, t15);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, img1);
    			append_dev(div5, t16);
    			append_dev(div5, div4);
    			append_dev(div4, h41);
    			append_dev(div4, t18);
    			append_dev(div4, time);
    			append_dev(div40, t20);
    			append_dev(div40, div39);
    			mount_component(standings, div39, null);
    			append_dev(div39, t21);
    			append_dev(div39, div15);
    			append_dev(div15, aside);
    			append_dev(aside, a4);
    			append_dev(a4, div12);
    			append_dev(div12, i0);
    			append_dev(a4, t22);
    			append_dev(a4, h60);
    			append_dev(a4, t24);
    			append_dev(a4, span3);
    			append_dev(span3, span2);
    			append_dev(span3, t25);
    			append_dev(a4, t26);
    			append_dev(a4, span4);
    			append_dev(aside, t27);
    			append_dev(aside, a5);
    			append_dev(a5, div13);
    			append_dev(div13, i1);
    			append_dev(a5, t28);
    			append_dev(a5, h61);
    			append_dev(a5, t30);
    			append_dev(a5, span6);
    			append_dev(span6, span5);
    			append_dev(span6, t31);
    			append_dev(a5, t32);
    			append_dev(a5, span7);
    			append_dev(aside, t33);
    			append_dev(aside, a6);
    			append_dev(a6, div14);
    			append_dev(div14, i2);
    			append_dev(a6, t34);
    			append_dev(a6, h62);
    			append_dev(a6, t36);
    			append_dev(a6, span9);
    			append_dev(span9, span8);
    			append_dev(span9, t38);
    			append_dev(a6, t39);
    			append_dev(a6, span10);
    			append_dev(div39, t40);
    			append_dev(div39, div16);
    			append_dev(div39, t41);
    			append_dev(div39, div38);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div17);
    			append_dev(div17, button);
    			append_dev(button, span11);
    			append_dev(div36, t43);
    			append_dev(div36, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div18);
    			append_dev(div18, p);
    			append_dev(p, t44);
    			append_dev(p, a7);
    			append_dev(p, t46);
    			append_dev(div34, t47);
    			append_dev(div34, div33);
    			append_dev(div33, div31);
    			append_dev(div31, div24);
    			append_dev(div24, form0);
    			append_dev(form0, h50);
    			append_dev(form0, t49);
    			append_dev(form0, div19);
    			append_dev(div19, input0);
    			append_dev(form0, t50);
    			append_dev(form0, div20);
    			append_dev(div20, input1);
    			append_dev(form0, t51);
    			append_dev(form0, div21);
    			append_dev(div21, label);
    			append_dev(label, input2);
    			append_dev(label, t52);
    			append_dev(label, span12);
    			append_dev(div21, t53);
    			append_dev(div21, a8);
    			append_dev(form0, t55);
    			append_dev(form0, div22);
    			append_dev(div22, a9);
    			append_dev(form0, t57);
    			append_dev(form0, div23);
    			append_dev(div23, h63);
    			append_dev(div23, t59);
    			append_dev(div23, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a10);
    			append_dev(a10, i3);
    			append_dev(ul1, t60);
    			append_dev(ul1, li4);
    			append_dev(li4, a11);
    			append_dev(a11, i4);
    			append_dev(ul1, t61);
    			append_dev(ul1, li5);
    			append_dev(li5, a12);
    			append_dev(a12, i5);
    			append_dev(div31, t62);
    			append_dev(div31, div30);
    			append_dev(div30, form1);
    			append_dev(form1, h51);
    			append_dev(form1, t64);
    			append_dev(form1, div25);
    			append_dev(div25, input3);
    			append_dev(form1, t65);
    			append_dev(form1, div26);
    			append_dev(div26, input4);
    			append_dev(form1, t66);
    			append_dev(form1, div27);
    			append_dev(div27, input5);
    			append_dev(form1, t67);
    			append_dev(form1, div28);
    			append_dev(div28, a13);
    			append_dev(form1, t69);
    			append_dev(form1, div29);
    			append_dev(div33, t71);
    			append_dev(div33, div32);
    			append_dev(div32, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, a14);
    			append_dev(ul2, t73);
    			append_dev(ul2, li7);
    			append_dev(li7, a15);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(images_1.$$.fragment, local);
    			transition_in(standings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(images_1.$$.fragment, local);
    			transition_out(standings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div43);
    			destroy_component(images_1);
    			destroy_component(standings);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const images = [
    		{ src: "assets/images/gallery/racing1.png" },
    		{ src: "assets/images/gallery/racing2.png" },
    		{ src: "assets/images/gallery/racing3.png" },
    		{ src: "assets/images/gallery/racing4.png" },
    		{ src: "assets/images/gallery/racing5.png" },
    		{ src: "assets/images/gallery/racing6.png" }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("News", $$slots, []);
    	$$self.$capture_state = () => ({ Standings, Images, images });
    	return [images];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Components/Footer.svelte generated by Svelte v3.22.3 */

    const file$7 = "src/Components/Footer.svelte";

    function create_fragment$7(ctx) {
    	let div26;
    	let div18;
    	let div17;
    	let div16;
    	let div15;
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let ul0;
    	let li0;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div12;
    	let div11;
    	let div10;
    	let h4;
    	let t2;
    	let div9;
    	let p;
    	let t4;
    	let form;
    	let div7;
    	let input;
    	let t5;
    	let div8;
    	let textarea;
    	let t6;
    	let button;
    	let t8;
    	let div13;
    	let t9;
    	let div14;
    	let t10;
    	let div25;
    	let div24;
    	let div23;
    	let div22;
    	let div20;
    	let div19;
    	let a1;
    	let t12;
    	let t13;
    	let div21;
    	let ul1;
    	let li1;
    	let a2;
    	let t15;
    	let li2;
    	let a3;
    	let t17;
    	let li3;
    	let a4;
    	let t19;
    	let li4;
    	let a5;
    	let t21;
    	let li5;
    	let a6;

    	const block = {
    		c: function create() {
    			div26 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Contáctanos";
    			t2 = space();
    			div9 = element("div");
    			p = element("p");
    			p.textContent = "Ponte en contacto con la gente de nuestro club a traves de\n                    este formulario.";
    			t4 = space();
    			form = element("form");
    			div7 = element("div");
    			input = element("input");
    			t5 = space();
    			div8 = element("div");
    			textarea = element("textarea");
    			t6 = space();
    			button = element("button");
    			button.textContent = "Envia tu mensaje";
    			t8 = space();
    			div13 = element("div");
    			t9 = space();
    			div14 = element("div");
    			t10 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			div22 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			a1 = element("a");
    			a1.textContent = "Racing";
    			t12 = text("\n              2018   |   Todos los derechos reservados");
    			t13 = space();
    			div21 = element("div");
    			ul1 = element("ul");
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Inicio";
    			t15 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Nuestro Equipo";
    			t17 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Estadísticas";
    			t19 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Programación";
    			t21 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Noticias";
    			if (img.src !== (img_src_value = "assets/images/soccer/logo-footer.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "srcset", "assets/images/soccer/logo-footer@2x.png\n                                2x");
    			attr_dev(img, "alt", "Racing");
    			attr_dev(img, "class", "footer-logo__img");
    			add_location(img, file$7, 15, 30, 766);
    			attr_dev(a0, "href", "index.html");
    			add_location(a0, file$7, 14, 28, 714);
    			attr_dev(div0, "class", "footer-logo footer-logo--has-txt");
    			add_location(div0, file$7, 13, 26, 639);
    			attr_dev(li0, "class", "social-links__item");
    			add_location(li0, file$7, 12, 24, 581);
    			attr_dev(ul0, "class", "social-links");
    			add_location(ul0, file$7, 11, 22, 531);
    			attr_dev(div1, "class", "info-block__item info-block__item--nopadding");
    			add_location(div1, file$7, 10, 20, 450);
    			attr_dev(div2, "class", "widget-contact-info__body info-block");
    			add_location(div2, file$7, 9, 18, 379);
    			attr_dev(div3, "class", "widget__content");
    			add_location(div3, file$7, 8, 16, 331);
    			attr_dev(div4, "class", "widget widget--footer widget-contact-info");
    			add_location(div4, file$7, 7, 14, 259);
    			attr_dev(div5, "class", "footer-col-inner");
    			add_location(div5, file$7, 6, 12, 214);
    			attr_dev(div6, "class", "col-sm-6 col-md-3");
    			add_location(div6, file$7, 5, 10, 170);
    			attr_dev(h4, "class", "widget__title");
    			add_location(h4, file$7, 34, 16, 1500);
    			add_location(p, file$7, 36, 18, 1607);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "class", "form-control input-sm");
    			attr_dev(input, "id", "contact-form-email");
    			attr_dev(input, "placeholder", "Tu dirección de correo...");
    			add_location(input, file$7, 42, 22, 1889);
    			attr_dev(div7, "class", "form-group form-group--xs");
    			add_location(div7, file$7, 41, 20, 1827);
    			attr_dev(textarea, "class", "form-control input-sm");
    			attr_dev(textarea, "name", "contact-form-message");
    			attr_dev(textarea, "rows", "4");
    			attr_dev(textarea, "placeholder", "Tu mensaje...");
    			add_location(textarea, file$7, 49, 22, 2211);
    			attr_dev(div8, "class", "form-group form-group--xs");
    			add_location(div8, file$7, 48, 20, 2149);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary-inverse btn-sm btn-block");
    			add_location(button, file$7, 55, 20, 2462);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "class", "contact-form");
    			add_location(form, file$7, 40, 18, 1768);
    			attr_dev(div9, "class", "widget__content");
    			add_location(div9, file$7, 35, 16, 1559);
    			attr_dev(div10, "class", "widget widget--footer widget-contact");
    			add_location(div10, file$7, 33, 14, 1433);
    			attr_dev(div11, "class", "footer-col-inner");
    			add_location(div11, file$7, 32, 12, 1388);
    			attr_dev(div12, "class", "col-sm-12 col-md-6");
    			add_location(div12, file$7, 31, 20, 1343);
    			attr_dev(div13, "class", "col-sm-6 col-md-3");
    			add_location(div13, file$7, 65, 10, 2763);
    			attr_dev(div14, "class", "clearfix visible-sm");
    			add_location(div14, file$7, 152, 10, 6598);
    			attr_dev(div15, "class", "row");
    			add_location(div15, file$7, 4, 8, 142);
    			attr_dev(div16, "class", "container");
    			add_location(div16, file$7, 3, 6, 110);
    			attr_dev(div17, "class", "footer-widgets__inner");
    			add_location(div17, file$7, 2, 4, 68);
    			attr_dev(div18, "class", "footer-widgets");
    			add_location(div18, file$7, 1, 2, 35);
    			attr_dev(a1, "href", "_soccer_index.html");
    			add_location(a1, file$7, 163, 14, 6903);
    			attr_dev(div19, "class", "footer-copyright");
    			add_location(div19, file$7, 162, 12, 6858);
    			attr_dev(div20, "class", "col-md-4");
    			add_location(div20, file$7, 161, 10, 6823);
    			attr_dev(a2, "href", "_soccer_index.html");
    			add_location(a2, file$7, 172, 16, 7256);
    			attr_dev(li1, "class", "footer-nav__item");
    			add_location(li1, file$7, 171, 14, 7210);
    			attr_dev(a3, "href", "_soccer_team-overview.html");
    			add_location(a3, file$7, 175, 16, 7376);
    			attr_dev(li2, "class", "footer-nav__item");
    			add_location(li2, file$7, 174, 14, 7330);
    			attr_dev(a4, "href", "_soccer_team-standings.html");
    			add_location(a4, file$7, 178, 16, 7512);
    			attr_dev(li3, "class", "footer-nav__item");
    			add_location(li3, file$7, 177, 14, 7466);
    			attr_dev(a5, "href", "_soccer_shop-grid.html");
    			add_location(a5, file$7, 181, 16, 7647);
    			attr_dev(li4, "class", "footer-nav__item");
    			add_location(li4, file$7, 180, 14, 7601);
    			attr_dev(a6, "href", "_soccer_blog-3.html");
    			add_location(a6, file$7, 184, 16, 7777);
    			attr_dev(li5, "class", "footer-nav__item");
    			add_location(li5, file$7, 183, 14, 7731);
    			attr_dev(ul1, "class", "footer-nav footer-nav--right footer-nav--condensed\n              footer-nav--sm");
    			add_location(ul1, file$7, 168, 12, 7089);
    			attr_dev(div21, "class", "col-md-8");
    			add_location(div21, file$7, 167, 10, 7054);
    			attr_dev(div22, "class", "row");
    			add_location(div22, file$7, 160, 8, 6795);
    			attr_dev(div23, "class", "footer-secondary__inner");
    			add_location(div23, file$7, 159, 6, 6749);
    			attr_dev(div24, "class", "container");
    			add_location(div24, file$7, 158, 4, 6719);
    			attr_dev(div25, "class", "footer-secondary");
    			add_location(div25, file$7, 157, 2, 6684);
    			attr_dev(div26, "id", "footer");
    			attr_dev(div26, "class", "footer");
    			add_location(div26, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div26, anchor);
    			append_dev(div26, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div15, t0);
    			append_dev(div15, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, h4);
    			append_dev(div10, t2);
    			append_dev(div10, div9);
    			append_dev(div9, p);
    			append_dev(div9, t4);
    			append_dev(div9, form);
    			append_dev(form, div7);
    			append_dev(div7, input);
    			append_dev(form, t5);
    			append_dev(form, div8);
    			append_dev(div8, textarea);
    			append_dev(form, t6);
    			append_dev(form, button);
    			append_dev(div15, t8);
    			append_dev(div15, div13);
    			append_dev(div15, t9);
    			append_dev(div15, div14);
    			append_dev(div26, t10);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div20, div19);
    			append_dev(div19, a1);
    			append_dev(div19, t12);
    			append_dev(div22, t13);
    			append_dev(div22, div21);
    			append_dev(div21, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, a2);
    			append_dev(ul1, t15);
    			append_dev(ul1, li2);
    			append_dev(li2, a3);
    			append_dev(ul1, t17);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(ul1, t19);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(ul1, t21);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div26);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Components/Header.svelte generated by Svelte v3.22.3 */

    const file$8 = "src/Components/Header.svelte";

    function create_fragment$8(ctx) {
    	let div12;
    	let div2;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let a1;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let header;
    	let div4;
    	let div3;
    	let ul0;
    	let li0;
    	let a2;
    	let t4;
    	let li1;
    	let a3;
    	let t5;
    	let span2;
    	let t7;
    	let li2;
    	let a4;
    	let t9;
    	let div7;
    	let div6;
    	let ul1;
    	let li3;
    	let svg;
    	let use0;
    	let t10;
    	let h60;
    	let t12;
    	let a5;
    	let t14;
    	let li4;
    	let a6;
    	let div5;
    	let use1;
    	let t15;
    	let h61;
    	let t17;
    	let span3;
    	let t19;
    	let div11;
    	let div10;
    	let div9;
    	let div8;
    	let a7;
    	let img1;
    	let img1_src_value;
    	let t20;
    	let nav;
    	let ul2;
    	let li5;
    	let a8;
    	let t22;
    	let li6;
    	let a9;
    	let t24;
    	let li7;
    	let a10;
    	let t26;
    	let li8;
    	let a11;
    	let t28;
    	let li9;
    	let a12;
    	let t30;
    	let ul3;
    	let li10;
    	let a13;
    	let i0;
    	let t31;
    	let li11;
    	let a14;
    	let i1;
    	let t32;
    	let a15;
    	let span4;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			a1 = element("a");
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			t2 = space();
    			header = element("header");
    			div4 = element("div");
    			div3 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a2 = element("a");
    			a2.textContent = "Tu Perfil";
    			t4 = space();
    			li1 = element("li");
    			a3 = element("a");
    			t5 = text("Mensajes\n              ");
    			span2 = element("span");
    			span2.textContent = "8";
    			t7 = space();
    			li2 = element("li");
    			a4 = element("a");
    			a4.textContent = "Salir";
    			t9 = space();
    			div7 = element("div");
    			div6 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			svg = svg_element("svg");
    			use0 = svg_element("use");
    			t10 = space();
    			h60 = element("h6");
    			h60.textContent = "Contáctanos";
    			t12 = space();
    			a5 = element("a");
    			a5.textContent = "info@racingfc.cl";
    			t14 = space();
    			li4 = element("li");
    			a6 = element("a");
    			div5 = element("div");
    			use1 = svg_element("use");
    			t15 = space();
    			h61 = element("h6");
    			h61.textContent = "Tus Cuotas";
    			t17 = space();
    			span3 = element("span");
    			span3.textContent = "$256,30";
    			t19 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			a7 = element("a");
    			img1 = element("img");
    			t20 = space();
    			nav = element("nav");
    			ul2 = element("ul");
    			li5 = element("li");
    			a8 = element("a");
    			a8.textContent = "Inicio";
    			t22 = space();
    			li6 = element("li");
    			a9 = element("a");
    			a9.textContent = "Nuestro Equipo";
    			t24 = space();
    			li7 = element("li");
    			a10 = element("a");
    			a10.textContent = "Estadísticas";
    			t26 = space();
    			li8 = element("li");
    			a11 = element("a");
    			a11.textContent = "Programación";
    			t28 = space();
    			li9 = element("li");
    			a12 = element("a");
    			a12.textContent = "Noticias";
    			t30 = space();
    			ul3 = element("ul");
    			li10 = element("li");
    			a13 = element("a");
    			i0 = element("i");
    			t31 = space();
    			li11 = element("li");
    			a14 = element("a");
    			i1 = element("i");
    			t32 = space();
    			a15 = element("a");
    			span4 = element("span");
    			if (img0.src !== (img0_src_value = "assets/images/soccer/logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "srcset", "assets/images/soccer/logo@2x.png 2x");
    			attr_dev(img0, "alt", "Alchemists");
    			attr_dev(img0, "class", "header-mobile__logo-img");
    			add_location(img0, file$8, 4, 8, 168);
    			attr_dev(a0, "href", "_soccer_index.html");
    			add_location(a0, file$8, 3, 6, 130);
    			attr_dev(div0, "class", "header-mobile__logo");
    			add_location(div0, file$8, 2, 4, 90);
    			attr_dev(span0, "class", "burger-menu-icon__line");
    			add_location(span0, file$8, 13, 8, 477);
    			attr_dev(a1, "id", "header-mobile__toggle");
    			attr_dev(a1, "class", "burger-menu-icon");
    			add_location(a1, file$8, 12, 6, 413);
    			attr_dev(span1, "class", "header-mobile__search-icon");
    			attr_dev(span1, "id", "header-mobile__search-icon");
    			add_location(span1, file$8, 15, 6, 534);
    			attr_dev(div1, "class", "header-mobile__inner");
    			add_location(div1, file$8, 11, 4, 372);
    			attr_dev(div2, "class", "header-mobile clearfix");
    			attr_dev(div2, "id", "header-mobile");
    			add_location(div2, file$8, 1, 2, 30);
    			attr_dev(a2, "data-toggle", "modal");
    			attr_dev(a2, "data-target", "#modal-login-register-tabs");
    			attr_dev(a2, "href", "/login");
    			add_location(a2, file$8, 26, 12, 838);
    			attr_dev(li0, "class", "nav-account__item");
    			add_location(li0, file$8, 25, 10, 795);
    			attr_dev(span2, "class", "highlight");
    			add_location(span2, file$8, 36, 14, 1176);
    			attr_dev(a3, "href", "_soccer_shop-wishlist.html");
    			add_location(a3, file$8, 34, 12, 1101);
    			attr_dev(li1, "class", "nav-account__item nav-account__item--wishlist");
    			add_location(li1, file$8, 33, 10, 1030);
    			attr_dev(a4, "href", "_soccer_shop-login.html");
    			add_location(a4, file$8, 40, 12, 1321);
    			attr_dev(li2, "class", "nav-account__item nav-account__item--logout");
    			add_location(li2, file$8, 39, 10, 1252);
    			attr_dev(ul0, "class", "nav-account");
    			add_location(ul0, file$8, 24, 10, 760);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$8, 23, 6, 726);
    			attr_dev(div4, "class", "header__top-bar clearfix");
    			add_location(div4, file$8, 22, 4, 681);
    			xlink_attr(use0, "xlink:href", "assets/images/icons-soccer.svg#soccer-ball");
    			add_location(use0, file$8, 51, 14, 1697);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "class", "df-icon df-icon--soccer-ball");
    			add_location(svg, file$8, 50, 12, 1629);
    			attr_dev(h60, "class", "info-block__heading");
    			add_location(h60, file$8, 53, 12, 1792);
    			attr_dev(a5, "class", "info-block__link");
    			attr_dev(a5, "href", "mailto:info@racingfc.cl");
    			add_location(a5, file$8, 54, 12, 1853);
    			attr_dev(li3, "class", "info-block__item info-block__item--contact-secondary");
    			add_location(li3, file$8, 49, 10, 1551);
    			xlink_attr(use1, "xlink:href", "assets/images/icons-basket.svg#bag");
    			add_location(use1, file$8, 61, 16, 2184);
    			attr_dev(div5, "class", "df-icon-stack df-icon-stack--bag");
    			add_location(div5, file$8, 60, 14, 2121);
    			attr_dev(h61, "class", "info-block__heading");
    			add_location(h61, file$8, 63, 14, 2275);
    			attr_dev(span3, "class", "info-block__cart-sum");
    			add_location(span3, file$8, 64, 14, 2337);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "info-block__link-wrapper");
    			add_location(a6, file$8, 59, 12, 2061);
    			attr_dev(li4, "class", "info-block__item info-block__item--shopping-cart");
    			add_location(li4, file$8, 58, 10, 1987);
    			attr_dev(ul1, "class", "info-block info-block--header");
    			add_location(ul1, file$8, 48, 8, 1498);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$8, 47, 6, 1466);
    			attr_dev(div7, "class", "header__secondary");
    			add_location(div7, file$8, 46, 4, 1428);
    			if (img1.src !== (img1_src_value = "assets/images/soccer/logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "srcset", "assets/images/soccer/logo@2x.png 2x");
    			attr_dev(img1, "alt", "Racing");
    			attr_dev(img1, "class", "header-logo__img");
    			add_location(img1, file$8, 75, 14, 2650);
    			attr_dev(a7, "href", "index.html");
    			add_location(a7, file$8, 74, 12, 2614);
    			attr_dev(div8, "class", "header-logo");
    			add_location(div8, file$8, 73, 10, 2576);
    			attr_dev(a8, "href", "/");
    			add_location(a8, file$8, 85, 16, 3007);
    			attr_dev(li5, "class", "active");
    			add_location(li5, file$8, 84, 14, 2971);
    			attr_dev(a9, "href", "/team");
    			add_location(a9, file$8, 88, 16, 3094);
    			attr_dev(li6, "class", "");
    			add_location(li6, file$8, 87, 14, 3064);
    			attr_dev(a10, "href", "_soccer_team-overview.html");
    			add_location(a10, file$8, 91, 16, 3193);
    			attr_dev(li7, "class", "");
    			add_location(li7, file$8, 90, 14, 3163);
    			attr_dev(a11, "href", "#");
    			add_location(a11, file$8, 162, 16, 6004);
    			attr_dev(li8, "class", "");
    			add_location(li8, file$8, 161, 14, 5974);
    			attr_dev(a12, "href", "#");
    			add_location(a12, file$8, 165, 16, 6097);
    			attr_dev(li9, "class", "");
    			add_location(li9, file$8, 164, 14, 6067);
    			attr_dev(ul2, "class", "main-nav__list");
    			add_location(ul2, file$8, 83, 12, 2929);
    			attr_dev(i0, "class", "fa fa fa-facebook");
    			add_location(i0, file$8, 178, 18, 6570);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "social-links__link");
    			attr_dev(a13, "data-toggle", "tooltip");
    			attr_dev(a13, "data-placement", "bottom");
    			attr_dev(a13, "title", "");
    			attr_dev(a13, "data-original-title", "Facebook");
    			add_location(a13, file$8, 171, 16, 6318);
    			attr_dev(li10, "class", "social-links__item");
    			add_location(li10, file$8, 170, 14, 6270);
    			attr_dev(i1, "class", "fa fa fa-twitter");
    			add_location(i1, file$8, 189, 18, 6956);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "social-links__link");
    			attr_dev(a14, "data-toggle", "tooltip");
    			attr_dev(a14, "data-placement", "bottom");
    			attr_dev(a14, "title", "");
    			attr_dev(a14, "data-original-title", "Twitter");
    			add_location(a14, file$8, 182, 16, 6705);
    			attr_dev(li11, "class", "social-links__item");
    			add_location(li11, file$8, 181, 14, 6657);
    			attr_dev(ul3, "class", "social-links social-links--inline social-links--main-nav");
    			add_location(ul3, file$8, 168, 12, 6172);
    			attr_dev(span4, "class", "pushy-panel__line");
    			add_location(span4, file$8, 194, 14, 7113);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "pushy-panel__toggle");
    			add_location(a15, file$8, 193, 12, 7058);
    			attr_dev(nav, "class", "main-nav clearfix");
    			add_location(nav, file$8, 82, 10, 2885);
    			attr_dev(div9, "class", "header__primary-inner");
    			add_location(div9, file$8, 72, 8, 2530);
    			attr_dev(div10, "class", "container");
    			add_location(div10, file$8, 71, 6, 2498);
    			attr_dev(div11, "class", "header__primary");
    			add_location(div11, file$8, 70, 4, 2462);
    			attr_dev(header, "class", "header");
    			add_location(header, file$8, 20, 2, 648);
    			attr_dev(div12, "class", "custom-header");
    			add_location(div12, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, span0);
    			append_dev(div1, t1);
    			append_dev(div1, span1);
    			append_dev(div12, t2);
    			append_dev(div12, header);
    			append_dev(header, div4);
    			append_dev(div4, div3);
    			append_dev(div3, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a2);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a3);
    			append_dev(a3, t5);
    			append_dev(a3, span2);
    			append_dev(ul0, t7);
    			append_dev(ul0, li2);
    			append_dev(li2, a4);
    			append_dev(header, t9);
    			append_dev(header, div7);
    			append_dev(div7, div6);
    			append_dev(div6, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, svg);
    			append_dev(svg, use0);
    			append_dev(li3, t10);
    			append_dev(li3, h60);
    			append_dev(li3, t12);
    			append_dev(li3, a5);
    			append_dev(ul1, t14);
    			append_dev(ul1, li4);
    			append_dev(li4, a6);
    			append_dev(a6, div5);
    			append_dev(div5, use1);
    			append_dev(a6, t15);
    			append_dev(a6, h61);
    			append_dev(a6, t17);
    			append_dev(a6, span3);
    			append_dev(header, t19);
    			append_dev(header, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, a7);
    			append_dev(a7, img1);
    			append_dev(div9, t20);
    			append_dev(div9, nav);
    			append_dev(nav, ul2);
    			append_dev(ul2, li5);
    			append_dev(li5, a8);
    			append_dev(ul2, t22);
    			append_dev(ul2, li6);
    			append_dev(li6, a9);
    			append_dev(ul2, t24);
    			append_dev(ul2, li7);
    			append_dev(li7, a10);
    			append_dev(ul2, t26);
    			append_dev(ul2, li8);
    			append_dev(li8, a11);
    			append_dev(ul2, t28);
    			append_dev(ul2, li9);
    			append_dev(li9, a12);
    			append_dev(nav, t30);
    			append_dev(nav, ul3);
    			append_dev(ul3, li10);
    			append_dev(li10, a13);
    			append_dev(a13, i0);
    			append_dev(ul3, t31);
    			append_dev(ul3, li11);
    			append_dev(li11, a14);
    			append_dev(a14, i1);
    			append_dev(nav, t32);
    			append_dev(nav, a15);
    			append_dev(a15, span4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Components/HeroSlider.svelte generated by Svelte v3.22.3 */

    const file$9 = "src/Components/HeroSlider.svelte";

    function create_fragment$9(ctx) {
    	let div18;
    	let div17;
    	let div13;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let div12;
    	let div11;
    	let div10;
    	let div9;
    	let div8;
    	let div5;
    	let span0;
    	let t2;
    	let h1;
    	let a0;
    	let t3;
    	let span1;
    	let t5;
    	let t6;
    	let ul;
    	let li0;
    	let time;
    	let t8;
    	let li1;
    	let t10;
    	let li2;
    	let a1;
    	let i;
    	let t11;
    	let t12;
    	let li3;
    	let a2;
    	let t14;
    	let div7;
    	let figure;
    	let img;
    	let img_src_value;
    	let t15;
    	let div6;
    	let h4;
    	let t17;
    	let span2;
    	let t19;
    	let div16;
    	let div15;
    	let div14;

    	const block = {
    		c: function create() {
    			div18 = element("div");
    			div17 = element("div");
    			div13 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			span0 = element("span");
    			span0.textContent = "Injuries";
    			t2 = space();
    			h1 = element("h1");
    			a0 = element("a");
    			t3 = text("Franklin Stevens has\n                    ");
    			span1 = element("span");
    			span1.textContent = "a knee fracture";
    			t5 = text("\n                    and is gona be out");
    			t6 = space();
    			ul = element("ul");
    			li0 = element("li");
    			time = element("time");
    			time.textContent = "August 28th, 2018";
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = "2369";
    			t10 = space();
    			li2 = element("li");
    			a1 = element("a");
    			i = element("i");
    			t11 = text("\n                      530");
    			t12 = space();
    			li3 = element("li");
    			a2 = element("a");
    			a2.textContent = "18";
    			t14 = space();
    			div7 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t15 = space();
    			div6 = element("div");
    			h4 = element("h4");
    			h4.textContent = "James Spiegel";
    			t17 = space();
    			span2 = element("span");
    			span2.textContent = "Racing Ninja";
    			t19 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			attr_dev(div0, "class", "post__meta-block post__meta-block--top");
    			add_location(div0, file$9, 7, 14, 310);
    			attr_dev(div1, "class", "col-md-8 offset-md-2");
    			add_location(div1, file$9, 6, 12, 261);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$9, 5, 10, 231);
    			attr_dev(div3, "class", "container hero-slider__item-container");
    			add_location(div3, file$9, 4, 8, 169);
    			attr_dev(div4, "class", "hero-slider__item hero-slider__item--img1");
    			add_location(div4, file$9, 3, 6, 105);
    			attr_dev(span0, "class", "label posts__cat-label");
    			add_location(span0, file$9, 18, 18, 756);
    			attr_dev(div5, "class", "post__category");
    			add_location(div5, file$9, 17, 16, 709);
    			attr_dev(span1, "class", "highlight");
    			add_location(span1, file$9, 23, 20, 996);
    			attr_dev(a0, "href", "_soccer_blog-post-1.html");
    			add_location(a0, file$9, 21, 18, 899);
    			attr_dev(h1, "class", "page-heading__title");
    			add_location(h1, file$9, 20, 16, 848);
    			attr_dev(time, "datetime", "2017-08-23");
    			add_location(time, file$9, 29, 20, 1251);
    			attr_dev(li0, "class", "meta__item meta__item--date");
    			add_location(li0, file$9, 28, 18, 1190);
    			attr_dev(li1, "class", "meta__item meta__item--views");
    			add_location(li1, file$9, 31, 18, 1346);
    			attr_dev(i, "class", "meta-like meta-like--active icon-heart");
    			add_location(i, file$9, 34, 22, 1512);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$9, 33, 20, 1477);
    			attr_dev(li2, "class", "meta__item meta__item--likes");
    			add_location(li2, file$9, 32, 18, 1415);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$9, 39, 20, 1723);
    			attr_dev(li3, "class", "meta__item meta__item--comments");
    			add_location(li3, file$9, 38, 18, 1658);
    			attr_dev(ul, "class", "post__meta meta");
    			add_location(ul, file$9, 27, 16, 1143);
    			if (img.src !== (img_src_value = "assets/images/samples/avatar-1.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Post Author Avatar");
    			add_location(img, file$9, 44, 20, 1905);
    			attr_dev(figure, "class", "post-author__avatar");
    			add_location(figure, file$9, 43, 18, 1848);
    			attr_dev(h4, "class", "post-author__name");
    			add_location(h4, file$9, 49, 20, 2121);
    			attr_dev(span2, "class", "post-author__slogan");
    			add_location(span2, file$9, 50, 20, 2190);
    			attr_dev(div6, "class", "post-author__info");
    			add_location(div6, file$9, 48, 18, 2069);
    			attr_dev(div7, "class", "post-author");
    			add_location(div7, file$9, 42, 16, 1804);
    			attr_dev(div8, "class", "post__meta-block post__meta-block--top");
    			add_location(div8, file$9, 16, 14, 640);
    			attr_dev(div9, "class", "col-md-8 offset-md-2");
    			add_location(div9, file$9, 15, 12, 591);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$9, 14, 10, 561);
    			attr_dev(div11, "class", "container hero-slider__item-container");
    			add_location(div11, file$9, 13, 8, 499);
    			attr_dev(div12, "class", "hero-slider__item hero-slider__item--img2");
    			add_location(div12, file$9, 12, 6, 435);
    			attr_dev(div13, "class", "hero-slider");
    			add_location(div13, file$9, 2, 4, 73);
    			attr_dev(div14, "class", "hero-slider-thumbs posts posts--simple-list");
    			add_location(div14, file$9, 61, 8, 2471);
    			attr_dev(div15, "class", "container");
    			add_location(div15, file$9, 60, 6, 2439);
    			attr_dev(div16, "class", "hero-slider-thumbs-wrapper");
    			add_location(div16, file$9, 59, 4, 2392);
    			attr_dev(div17, "class", "hero-slider-wrapper");
    			add_location(div17, file$9, 1, 2, 35);
    			attr_dev(div18, "class", "custom-hero-slider");
    			add_location(div18, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div17);
    			append_dev(div17, div13);
    			append_dev(div13, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div13, t0);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, span0);
    			append_dev(div8, t2);
    			append_dev(div8, h1);
    			append_dev(h1, a0);
    			append_dev(a0, t3);
    			append_dev(a0, span1);
    			append_dev(a0, t5);
    			append_dev(div8, t6);
    			append_dev(div8, ul);
    			append_dev(ul, li0);
    			append_dev(li0, time);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(li2, a1);
    			append_dev(a1, i);
    			append_dev(a1, t11);
    			append_dev(ul, t12);
    			append_dev(ul, li3);
    			append_dev(li3, a2);
    			append_dev(div8, t14);
    			append_dev(div8, div7);
    			append_dev(div7, figure);
    			append_dev(figure, img);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, h4);
    			append_dev(div6, t17);
    			append_dev(div6, span2);
    			append_dev(div17, t19);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div18);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeroSlider> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HeroSlider", $$slots, []);
    	return [];
    }

    class HeroSlider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroSlider",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Components/PushyPanel.svelte generated by Svelte v3.22.3 */

    const file$a = "src/Components/PushyPanel.svelte";

    function create_fragment$a(ctx) {
    	let div20;
    	let aside3;
    	let div19;
    	let header;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div18;
    	let aside0;
    	let div13;
    	let ul;
    	let li0;
    	let figure0;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div2;
    	let div1;
    	let span0;
    	let t3;
    	let h60;
    	let a2;
    	let time0;
    	let t6;
    	let div3;
    	let t8;
    	let li1;
    	let figure1;
    	let a3;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let div5;
    	let div4;
    	let span1;
    	let t11;
    	let h61;
    	let a4;
    	let time1;
    	let t14;
    	let div6;
    	let t16;
    	let li2;
    	let figure2;
    	let a5;
    	let img3;
    	let img3_src_value;
    	let t17;
    	let div8;
    	let div7;
    	let span2;
    	let t19;
    	let h62;
    	let a6;
    	let time2;
    	let t22;
    	let div9;
    	let t24;
    	let li3;
    	let figure3;
    	let a7;
    	let img4;
    	let img4_src_value;
    	let t25;
    	let div11;
    	let div10;
    	let span3;
    	let t27;
    	let h63;
    	let a8;
    	let time3;
    	let t30;
    	let div12;
    	let t32;
    	let aside1;
    	let div14;
    	let h4;
    	let t34;
    	let div16;
    	let div15;
    	let a9;
    	let a10;
    	let a11;
    	let a12;
    	let a13;
    	let a14;
    	let a15;
    	let a16;
    	let a17;
    	let a18;
    	let a19;
    	let a20;
    	let a21;
    	let a22;
    	let t49;
    	let aside2;
    	let div17;
    	let figure4;
    	let a23;
    	let img5;
    	let img5_src_value;
    	let t50;
    	let a24;

    	const block = {
    		c: function create() {
    			div20 = element("div");
    			aside3 = element("aside");
    			div19 = element("div");
    			header = element("header");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div18 = element("div");
    			aside0 = element("aside");
    			div13 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			figure0 = element("figure");
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "The Team";
    			t3 = space();
    			h60 = element("h6");
    			a2 = element("a");
    			a2.textContent = "The Team will make a small vacation to\n\t\t\t\t\t\t\t\t\t\t\t\t\tthe Caribbean";
    			time0 = element("time");
    			time0.textContent = "June 12th, 2018";
    			t6 = space();
    			div3 = element("div");
    			div3.textContent = "Lorem ipsum dolor sit amet, consectetur adipisi ng\n\t\t\t\t\t\t\t\t\t\t\telit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t8 = space();
    			li1 = element("li");
    			figure1 = element("figure");
    			a3 = element("a");
    			img2 = element("img");
    			t9 = space();
    			div5 = element("div");
    			div4 = element("div");
    			span1 = element("span");
    			span1.textContent = "Injuries";
    			t11 = space();
    			h61 = element("h6");
    			a4 = element("a");
    			a4.textContent = "Jenny Jackson won't be able to play the\n\t\t\t\t\t\t\t\t\t\t\t\t\tnext game";
    			time1 = element("time");
    			time1.textContent = "May 15th, 2018";
    			t14 = space();
    			div6 = element("div");
    			div6.textContent = "Lorem ipsum dolor sit amet, consectetur adipisi ng\n\t\t\t\t\t\t\t\t\t\t\telit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t16 = space();
    			li2 = element("li");
    			figure2 = element("figure");
    			a5 = element("a");
    			img3 = element("img");
    			t17 = space();
    			div8 = element("div");
    			div7 = element("div");
    			span2 = element("span");
    			span2.textContent = "The Team";
    			t19 = space();
    			h62 = element("h6");
    			a6 = element("a");
    			a6.textContent = "The team is starting a new power\n\t\t\t\t\t\t\t\t\t\t\t\t\tbreakfast regimen";
    			time2 = element("time");
    			time2.textContent = "March 16th, 2018";
    			t22 = space();
    			div9 = element("div");
    			div9.textContent = "Lorem ipsum dolor sit amet, consectetur adipisi ng\n\t\t\t\t\t\t\t\t\t\t\telit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t24 = space();
    			li3 = element("li");
    			figure3 = element("figure");
    			a7 = element("a");
    			img4 = element("img");
    			t25 = space();
    			div11 = element("div");
    			div10 = element("div");
    			span3 = element("span");
    			span3.textContent = "The\n\t\t\t\t\t\t\t\t\t\t\t\t\tLeague";
    			t27 = space();
    			h63 = element("h6");
    			a8 = element("a");
    			a8.textContent = "Racing need two win the next two\n\t\t\t\t\t\t\t\t\t\t\t\t\tgames";
    			time3 = element("time");
    			time3.textContent = "February 8th, 2018";
    			t30 = space();
    			div12 = element("div");
    			div12.textContent = "Lorem ipsum dolor sit amet, consectetur adipisi ng\n\t\t\t\t\t\t\t\t\t\t\telit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t32 = space();
    			aside1 = element("aside");
    			div14 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Popular Tags";
    			t34 = space();
    			div16 = element("div");
    			div15 = element("div");
    			a9 = element("a");
    			a9.textContent = "PLAYOFFS";
    			a10 = element("a");
    			a10.textContent = "ALCHEMISTS";
    			a11 = element("a");
    			a11.textContent = "INJURIES";
    			a12 = element("a");
    			a12.textContent = "TEAM";
    			a13 = element("a");
    			a13.textContent = "INCORPORATIONS";
    			a14 = element("a");
    			a14.textContent = "UNIFORMS";
    			a15 = element("a");
    			a15.textContent = "CHAMPIONS";
    			a16 = element("a");
    			a16.textContent = "PROFESSIONAL";
    			a17 = element("a");
    			a17.textContent = "COACH";
    			a18 = element("a");
    			a18.textContent = "STADIUM";
    			a19 = element("a");
    			a19.textContent = "NEWS";
    			a20 = element("a");
    			a20.textContent = "PLAYERS";
    			a21 = element("a");
    			a21.textContent = "WOMEN DIVISION";
    			a22 = element("a");
    			a22.textContent = "AWARDS";
    			t49 = space();
    			aside2 = element("aside");
    			div17 = element("div");
    			figure4 = element("figure");
    			a23 = element("a");
    			img5 = element("img");
    			t50 = space();
    			a24 = element("a");
    			if (img0.src !== (img0_src_value = "assets/images/soccer/logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "srcset", "assets/images/soccer/logo@2x.png 2x");
    			attr_dev(img0, "alt", "Racing");
    			add_location(img0, file$a, 4, 66, 227);
    			attr_dev(a0, "href", "_soccer_index.html");
    			add_location(a0, file$a, 4, 37, 198);
    			attr_dev(div0, "class", "pushy-panel__logo");
    			add_location(div0, file$a, 4, 6, 167);
    			attr_dev(header, "class", "pushy-panel__header");
    			add_location(header, file$a, 3, 5, 124);
    			if (img1.src !== (img1_src_value = "assets/images/samples/post-img19-xs.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$a, 13, 51, 671);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$a, 13, 39, 659);
    			attr_dev(figure0, "class", "posts__thumb");
    			add_location(figure0, file$a, 13, 10, 630);
    			attr_dev(span0, "class", "label posts__cat-label");
    			add_location(span0, file$a, 16, 35, 828);
    			attr_dev(div1, "class", "posts__cat");
    			add_location(div1, file$a, 16, 11, 804);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$a, 18, 36, 935);
    			attr_dev(h60, "class", "posts__title");
    			add_location(h60, file$a, 18, 11, 910);
    			attr_dev(time0, "datetime", "2016-08-23");
    			attr_dev(time0, "class", "posts__date");
    			add_location(time0, file$a, 19, 35, 1021);
    			attr_dev(div2, "class", "posts__inner");
    			add_location(div2, file$a, 15, 10, 766);
    			attr_dev(div3, "class", "posts__excerpt");
    			add_location(div3, file$a, 22, 10, 1131);
    			attr_dev(li0, "class", "posts__item posts__item--category-1");
    			add_location(li0, file$a, 12, 9, 571);
    			if (img2.src !== (img2_src_value = "assets/images/samples/post-img18-xs.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$a, 27, 51, 1435);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$a, 27, 39, 1423);
    			attr_dev(figure1, "class", "posts__thumb");
    			add_location(figure1, file$a, 27, 10, 1394);
    			attr_dev(span1, "class", "label posts__cat-label");
    			add_location(span1, file$a, 30, 35, 1592);
    			attr_dev(div4, "class", "posts__cat");
    			add_location(div4, file$a, 30, 11, 1568);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$a, 32, 36, 1699);
    			attr_dev(h61, "class", "posts__title");
    			add_location(h61, file$a, 32, 11, 1674);
    			attr_dev(time1, "datetime", "2016-08-23");
    			attr_dev(time1, "class", "posts__date");
    			add_location(time1, file$a, 33, 31, 1782);
    			attr_dev(div5, "class", "posts__inner");
    			add_location(div5, file$a, 29, 10, 1530);
    			attr_dev(div6, "class", "posts__excerpt");
    			add_location(div6, file$a, 36, 10, 1891);
    			attr_dev(li1, "class", "posts__item posts__item--category-2");
    			add_location(li1, file$a, 26, 9, 1335);
    			if (img3.src !== (img3_src_value = "assets/images/samples/post-img8-xs.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$a, 41, 51, 2195);
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$a, 41, 39, 2183);
    			attr_dev(figure2, "class", "posts__thumb");
    			add_location(figure2, file$a, 41, 10, 2154);
    			attr_dev(span2, "class", "label posts__cat-label");
    			add_location(span2, file$a, 44, 35, 2351);
    			attr_dev(div7, "class", "posts__cat");
    			add_location(div7, file$a, 44, 11, 2327);
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$a, 46, 36, 2458);
    			attr_dev(h62, "class", "posts__title");
    			add_location(h62, file$a, 46, 11, 2433);
    			attr_dev(time2, "datetime", "2016-08-23");
    			attr_dev(time2, "class", "posts__date");
    			add_location(time2, file$a, 47, 39, 2542);
    			attr_dev(div8, "class", "posts__inner");
    			add_location(div8, file$a, 43, 10, 2289);
    			attr_dev(div9, "class", "posts__excerpt");
    			add_location(div9, file$a, 50, 10, 2653);
    			attr_dev(li2, "class", "posts__item posts__item--category-1");
    			add_location(li2, file$a, 40, 9, 2095);
    			if (img4.src !== (img4_src_value = "assets/images/samples/post-img20-xs.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$a, 55, 51, 2957);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$a, 55, 39, 2945);
    			attr_dev(figure3, "class", "posts__thumb");
    			add_location(figure3, file$a, 55, 10, 2916);
    			attr_dev(span3, "class", "label posts__cat-label");
    			add_location(span3, file$a, 58, 35, 3114);
    			attr_dev(div10, "class", "posts__cat");
    			add_location(div10, file$a, 58, 11, 3090);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$a, 60, 36, 3224);
    			attr_dev(h63, "class", "posts__title");
    			add_location(h63, file$a, 60, 11, 3199);
    			attr_dev(time3, "datetime", "2016-08-23");
    			attr_dev(time3, "class", "posts__date");
    			add_location(time3, file$a, 61, 27, 3296);
    			attr_dev(div11, "class", "posts__inner");
    			add_location(div11, file$a, 57, 10, 3052);
    			attr_dev(div12, "class", "posts__excerpt");
    			add_location(div12, file$a, 64, 10, 3409);
    			attr_dev(li3, "class", "posts__item posts__item--category-3");
    			add_location(li3, file$a, 54, 9, 2857);
    			attr_dev(ul, "class", "posts posts--simple-list");
    			add_location(ul, file$a, 11, 8, 524);
    			attr_dev(div13, "class", "widget__content");
    			add_location(div13, file$a, 10, 7, 486);
    			attr_dev(aside0, "class", "widget widget-popular-posts widget--side-panel");
    			add_location(aside0, file$a, 9, 6, 416);
    			add_location(h4, file$a, 73, 8, 3754);
    			attr_dev(div14, "class", "widget__title");
    			add_location(div14, file$a, 72, 7, 3718);
    			attr_dev(a9, "href", "#");
    			attr_dev(a9, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a9, file$a, 76, 30, 3857);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a10, file$a, 77, 72, 3941);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a11, file$a, 78, 74, 4027);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a12, file$a, 79, 72, 4111);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a13, file$a, 80, 68, 4191);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a14, file$a, 81, 78, 4281);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a15, file$a, 82, 72, 4365);
    			attr_dev(a16, "href", "#");
    			attr_dev(a16, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a16, file$a, 83, 73, 4450);
    			attr_dev(a17, "href", "#");
    			attr_dev(a17, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a17, file$a, 84, 76, 4538);
    			attr_dev(a18, "href", "#");
    			attr_dev(a18, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a18, file$a, 85, 69, 4619);
    			attr_dev(a19, "href", "#");
    			attr_dev(a19, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a19, file$a, 86, 71, 4702);
    			attr_dev(a20, "href", "#");
    			attr_dev(a20, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a20, file$a, 87, 68, 4782);
    			attr_dev(a21, "href", "#");
    			attr_dev(a21, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a21, file$a, 88, 71, 4865);
    			attr_dev(a22, "href", "#");
    			attr_dev(a22, "class", "btn btn-primary btn-xs btn-outline btn-sm");
    			add_location(a22, file$a, 89, 78, 4955);
    			attr_dev(div15, "class", "tagcloud");
    			add_location(div15, file$a, 76, 8, 3835);
    			attr_dev(div16, "class", "widget__content");
    			add_location(div16, file$a, 75, 7, 3797);
    			attr_dev(aside1, "class", "widget widget--side-panel widget-tagcloud");
    			add_location(aside1, file$a, 71, 6, 3653);
    			if (img5.src !== (img5_src_value = "assets/images/samples/banner.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Banner");
    			add_location(img5, file$a, 95, 55, 5227);
    			attr_dev(a23, "href", "#");
    			add_location(a23, file$a, 95, 43, 5215);
    			attr_dev(figure4, "class", "widget-banner__img");
    			add_location(figure4, file$a, 95, 8, 5180);
    			attr_dev(div17, "class", "widget__content");
    			add_location(div17, file$a, 94, 7, 5142);
    			attr_dev(aside2, "class", "widget widget--side-panel widget-banner");
    			add_location(aside2, file$a, 93, 6, 5079);
    			attr_dev(div18, "class", "pushy-panel__content");
    			add_location(div18, file$a, 8, 5, 375);
    			attr_dev(a24, "href", "#");
    			attr_dev(a24, "class", "pushy-panel__back-btn");
    			add_location(a24, file$a, 99, 11, 5349);
    			attr_dev(div19, "class", "pushy-panel__inner");
    			add_location(div19, file$a, 2, 4, 86);
    			attr_dev(aside3, "class", "pushy-panel pushy-panel--dark");
    			add_location(aside3, file$a, 1, 3, 36);
    			attr_dev(div20, "class", "custom-pushy-panel");
    			add_location(div20, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div20, anchor);
    			append_dev(div20, aside3);
    			append_dev(aside3, div19);
    			append_dev(div19, header);
    			append_dev(header, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div19, t0);
    			append_dev(div19, div18);
    			append_dev(div18, aside0);
    			append_dev(aside0, div13);
    			append_dev(div13, ul);
    			append_dev(ul, li0);
    			append_dev(li0, figure0);
    			append_dev(figure0, a1);
    			append_dev(a1, img1);
    			append_dev(li0, t1);
    			append_dev(li0, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div2, t3);
    			append_dev(div2, h60);
    			append_dev(h60, a2);
    			append_dev(div2, time0);
    			append_dev(li0, t6);
    			append_dev(li0, div3);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(li1, figure1);
    			append_dev(figure1, a3);
    			append_dev(a3, img2);
    			append_dev(li1, t9);
    			append_dev(li1, div5);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(div5, t11);
    			append_dev(div5, h61);
    			append_dev(h61, a4);
    			append_dev(div5, time1);
    			append_dev(li1, t14);
    			append_dev(li1, div6);
    			append_dev(ul, t16);
    			append_dev(ul, li2);
    			append_dev(li2, figure2);
    			append_dev(figure2, a5);
    			append_dev(a5, img3);
    			append_dev(li2, t17);
    			append_dev(li2, div8);
    			append_dev(div8, div7);
    			append_dev(div7, span2);
    			append_dev(div8, t19);
    			append_dev(div8, h62);
    			append_dev(h62, a6);
    			append_dev(div8, time2);
    			append_dev(li2, t22);
    			append_dev(li2, div9);
    			append_dev(ul, t24);
    			append_dev(ul, li3);
    			append_dev(li3, figure3);
    			append_dev(figure3, a7);
    			append_dev(a7, img4);
    			append_dev(li3, t25);
    			append_dev(li3, div11);
    			append_dev(div11, div10);
    			append_dev(div10, span3);
    			append_dev(div11, t27);
    			append_dev(div11, h63);
    			append_dev(h63, a8);
    			append_dev(div11, time3);
    			append_dev(li3, t30);
    			append_dev(li3, div12);
    			append_dev(div18, t32);
    			append_dev(div18, aside1);
    			append_dev(aside1, div14);
    			append_dev(div14, h4);
    			append_dev(aside1, t34);
    			append_dev(aside1, div16);
    			append_dev(div16, div15);
    			append_dev(div15, a9);
    			append_dev(div15, a10);
    			append_dev(div15, a11);
    			append_dev(div15, a12);
    			append_dev(div15, a13);
    			append_dev(div15, a14);
    			append_dev(div15, a15);
    			append_dev(div15, a16);
    			append_dev(div15, a17);
    			append_dev(div15, a18);
    			append_dev(div15, a19);
    			append_dev(div15, a20);
    			append_dev(div15, a21);
    			append_dev(div15, a22);
    			append_dev(div18, t49);
    			append_dev(div18, aside2);
    			append_dev(aside2, div17);
    			append_dev(div17, figure4);
    			append_dev(figure4, a23);
    			append_dev(a23, img5);
    			append_dev(div18, t50);
    			append_dev(div19, a24);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div20);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PushyPanel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PushyPanel", $$slots, []);
    	return [];
    }

    class PushyPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PushyPanel",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Components/ModalLogin.svelte generated by Svelte v3.22.3 */

    const file$b = "src/Components/ModalLogin.svelte";

    function create_fragment$b(ctx) {
    	let div0;
    	let t0;
    	let div21;
    	let div20;
    	let div1;
    	let button;
    	let span0;
    	let t2;
    	let div19;
    	let div18;
    	let div2;
    	let p;
    	let t3;
    	let a0;
    	let t5;
    	let t6;
    	let div17;
    	let div15;
    	let div8;
    	let form0;
    	let h50;
    	let t8;
    	let div3;
    	let input0;
    	let t9;
    	let div4;
    	let input1;
    	let t10;
    	let div5;
    	let label;
    	let input2;
    	let t11;
    	let span1;
    	let t12;
    	let a1;
    	let t14;
    	let div6;
    	let a2;
    	let t16;
    	let div7;
    	let h6;
    	let t18;
    	let ul0;
    	let li0;
    	let a3;
    	let i0;
    	let t19;
    	let li1;
    	let a4;
    	let i1;
    	let t20;
    	let li2;
    	let a5;
    	let i2;
    	let t21;
    	let div14;
    	let form1;
    	let h51;
    	let t23;
    	let div9;
    	let input3;
    	let t24;
    	let div10;
    	let input4;
    	let t25;
    	let div11;
    	let input5;
    	let t26;
    	let div12;
    	let a6;
    	let t28;
    	let div13;
    	let t30;
    	let div16;
    	let ul1;
    	let li3;
    	let a7;
    	let t32;
    	let li4;
    	let a8;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div1 = element("div");
    			button = element("button");
    			span0 = element("span");
    			span0.textContent = "×";
    			t2 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div2 = element("div");
    			p = element("p");
    			t3 = text("Don’t have an account?\n            ");
    			a0 = element("a");
    			a0.textContent = "Register Now";
    			t5 = text("\n            and enjoy all our benefits!");
    			t6 = space();
    			div17 = element("div");
    			div15 = element("div");
    			div8 = element("div");
    			form0 = element("form");
    			h50 = element("h5");
    			h50.textContent = "Login to your account";
    			t8 = space();
    			div3 = element("div");
    			input0 = element("input");
    			t9 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t10 = space();
    			div5 = element("div");
    			label = element("label");
    			input2 = element("input");
    			t11 = text("\n                    Remember Me\n                    ");
    			span1 = element("span");
    			t12 = space();
    			a1 = element("a");
    			a1.textContent = "Forgot your password?";
    			t14 = space();
    			div6 = element("div");
    			a2 = element("a");
    			a2.textContent = "Enter to your account";
    			t16 = space();
    			div7 = element("div");
    			h6 = element("h6");
    			h6.textContent = "or Login with your social profile:";
    			t18 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a3 = element("a");
    			i0 = element("i");
    			t19 = space();
    			li1 = element("li");
    			a4 = element("a");
    			i1 = element("i");
    			t20 = space();
    			li2 = element("li");
    			a5 = element("a");
    			i2 = element("i");
    			t21 = space();
    			div14 = element("div");
    			form1 = element("form");
    			h51 = element("h5");
    			h51.textContent = "Register Now!";
    			t23 = space();
    			div9 = element("div");
    			input3 = element("input");
    			t24 = space();
    			div10 = element("div");
    			input4 = element("input");
    			t25 = space();
    			div11 = element("div");
    			input5 = element("input");
    			t26 = space();
    			div12 = element("div");
    			a6 = element("a");
    			a6.textContent = "Create Your Account";
    			t28 = space();
    			div13 = element("div");
    			div13.textContent = "You’ll receive a confirmation email in your inbox with a link\n                  to activate your account.";
    			t30 = space();
    			div16 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			a7 = element("a");
    			a7.textContent = "Login";
    			t32 = space();
    			li4 = element("li");
    			a8 = element("a");
    			a8.textContent = "Register";
    			attr_dev(div0, "class", "modal fade");
    			attr_dev(div0, "id", "modal-login-register-tabs");
    			attr_dev(div0, "tabindex", "-1");
    			attr_dev(div0, "role", "dialog");
    			add_location(div0, file$b, 0, 0, 0);
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file$b, 15, 8, 365);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "close");
    			attr_dev(button, "data-dismiss", "modal");
    			attr_dev(button, "aria-label", "Close");
    			add_location(button, file$b, 10, 6, 248);
    			attr_dev(div1, "class", "modal-header");
    			add_location(div1, file$b, 9, 4, 215);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$b, 23, 12, 666);
    			attr_dev(p, "class", "modal-account__item-register-txt");
    			add_location(p, file$b, 21, 10, 574);
    			attr_dev(div2, "class", "modal-account__item modal-account__item--logo");
    			add_location(div2, file$b, 20, 8, 504);
    			add_location(h50, file$b, 34, 16, 1035);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "Enter your email address...");
    			add_location(input0, file$b, 36, 18, 1125);
    			attr_dev(div3, "class", "form-group");
    			add_location(div3, file$b, 35, 16, 1082);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "placeholder", "Enter your password...");
    			add_location(input1, file$b, 42, 18, 1353);
    			attr_dev(div4, "class", "form-group");
    			add_location(div4, file$b, 41, 16, 1310);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "id", "inlineCheckbox1");
    			input2.value = "option1";
    			input2.checked = "checked";
    			add_location(input2, file$b, 49, 20, 1666);
    			attr_dev(span1, "class", "checkbox-indicator");
    			add_location(span1, file$b, 55, 20, 1887);
    			attr_dev(label, "class", "checkbox checkbox-inline");
    			add_location(label, file$b, 48, 18, 1605);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$b, 57, 18, 1968);
    			attr_dev(div5, "class", "form-group form-group--pass-reminder");
    			add_location(div5, file$b, 47, 16, 1536);
    			attr_dev(a2, "href", "_soccer_shop-account.html");
    			attr_dev(a2, "class", "btn btn-primary-inverse btn-block");
    			add_location(a2, file$b, 60, 18, 2107);
    			attr_dev(div6, "class", "form-group form-group--submit");
    			add_location(div6, file$b, 59, 16, 2045);
    			add_location(h6, file$b, 67, 18, 2381);
    			attr_dev(i0, "class", "fa fa-facebook");
    			add_location(i0, file$b, 74, 24, 2755);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "social-links__link social-links__link--lg\n                        social-links__link--fb");
    			add_location(a3, file$b, 70, 22, 2573);
    			attr_dev(li0, "class", "social-links__item");
    			add_location(li0, file$b, 69, 20, 2519);
    			attr_dev(i1, "class", "fa fa-twitter");
    			add_location(i1, file$b, 82, 24, 3098);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "social-links__link social-links__link--lg\n                        social-links__link--twitter");
    			add_location(a4, file$b, 78, 22, 2911);
    			attr_dev(li1, "class", "social-links__item");
    			add_location(li1, file$b, 77, 20, 2857);
    			attr_dev(i2, "class", "fa fa-google-plus");
    			add_location(i2, file$b, 90, 24, 3438);
    			attr_dev(a5, "href", "#");
    			attr_dev(a5, "class", "social-links__link social-links__link--lg\n                        social-links__link--gplus");
    			add_location(a5, file$b, 86, 22, 3253);
    			attr_dev(li2, "class", "social-links__item");
    			add_location(li2, file$b, 85, 20, 3199);
    			attr_dev(ul0, "class", "social-links social-links--btn text-center");
    			add_location(ul0, file$b, 68, 18, 2443);
    			attr_dev(div7, "class", "modal-form--social");
    			add_location(div7, file$b, 66, 16, 2330);
    			attr_dev(form0, "action", "#");
    			attr_dev(form0, "class", "modal-form");
    			add_location(form0, file$b, 33, 14, 982);
    			attr_dev(div8, "role", "tabpanel");
    			attr_dev(div8, "class", "tab-pane fade show active");
    			attr_dev(div8, "id", "tab-login");
    			add_location(div8, file$b, 29, 12, 855);
    			add_location(h51, file$b, 99, 16, 3752);
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "class", "form-control");
    			attr_dev(input3, "placeholder", "Enter your email address...");
    			add_location(input3, file$b, 101, 18, 3834);
    			attr_dev(div9, "class", "form-group");
    			add_location(div9, file$b, 100, 16, 3791);
    			attr_dev(input4, "type", "password");
    			attr_dev(input4, "class", "form-control");
    			attr_dev(input4, "placeholder", "Enter your password...");
    			add_location(input4, file$b, 107, 18, 4062);
    			attr_dev(div10, "class", "form-group");
    			add_location(div10, file$b, 106, 16, 4019);
    			attr_dev(input5, "type", "password");
    			attr_dev(input5, "class", "form-control");
    			attr_dev(input5, "placeholder", "Repeat your password...");
    			add_location(input5, file$b, 113, 18, 4288);
    			attr_dev(div11, "class", "form-group");
    			add_location(div11, file$b, 112, 16, 4245);
    			attr_dev(a6, "href", "_soccer_shop-account.html");
    			attr_dev(a6, "class", "btn btn-success btn-block");
    			add_location(a6, file$b, 119, 18, 4534);
    			attr_dev(div12, "class", "form-group form-group--submit");
    			add_location(div12, file$b, 118, 16, 4472);
    			attr_dev(div13, "class", "modal-form--note");
    			add_location(div13, file$b, 125, 16, 4747);
    			attr_dev(form1, "action", "#");
    			attr_dev(form1, "class", "modal-form");
    			add_location(form1, file$b, 98, 14, 3699);
    			attr_dev(div14, "role", "tabpanel");
    			attr_dev(div14, "class", "tab-pane fade");
    			attr_dev(div14, "id", "tab-register");
    			add_location(div14, file$b, 97, 12, 3623);
    			attr_dev(div15, "class", "tab-content");
    			add_location(div15, file$b, 28, 10, 817);
    			attr_dev(a7, "class", "nav-link active");
    			attr_dev(a7, "href", "#tab-login");
    			attr_dev(a7, "role", "tab");
    			attr_dev(a7, "data-toggle", "tab");
    			add_location(a7, file$b, 137, 16, 5193);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file$b, 136, 14, 5155);
    			attr_dev(a8, "class", "nav-link");
    			attr_dev(a8, "href", "#tab-register");
    			attr_dev(a8, "role", "tab");
    			attr_dev(a8, "data-toggle", "tab");
    			add_location(a8, file$b, 146, 16, 5457);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file$b, 145, 14, 5419);
    			attr_dev(ul1, "class", "nav nav-tabs nav-justified nav-tabs--login");
    			attr_dev(ul1, "role", "tablist");
    			add_location(ul1, file$b, 133, 12, 5042);
    			attr_dev(div16, "class", "nav-tabs-login-wrapper");
    			add_location(div16, file$b, 132, 10, 4993);
    			attr_dev(div17, "class", "modal-account__item");
    			add_location(div17, file$b, 27, 8, 773);
    			attr_dev(div18, "class", "modal-account-holder");
    			add_location(div18, file$b, 19, 6, 461);
    			attr_dev(div19, "class", "modal-body");
    			add_location(div19, file$b, 18, 4, 430);
    			attr_dev(div20, "class", "modal-content");
    			add_location(div20, file$b, 8, 2, 183);
    			attr_dev(div21, "class", "modal-dialog modal-lg modal--login modal--login-only");
    			attr_dev(div21, "role", "document");
    			add_location(div21, file$b, 5, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div21, anchor);
    			append_dev(div21, div20);
    			append_dev(div20, div1);
    			append_dev(div1, button);
    			append_dev(button, span0);
    			append_dev(div20, t2);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			append_dev(p, a0);
    			append_dev(p, t5);
    			append_dev(div18, t6);
    			append_dev(div18, div17);
    			append_dev(div17, div15);
    			append_dev(div15, div8);
    			append_dev(div8, form0);
    			append_dev(form0, h50);
    			append_dev(form0, t8);
    			append_dev(form0, div3);
    			append_dev(div3, input0);
    			append_dev(form0, t9);
    			append_dev(form0, div4);
    			append_dev(div4, input1);
    			append_dev(form0, t10);
    			append_dev(form0, div5);
    			append_dev(div5, label);
    			append_dev(label, input2);
    			append_dev(label, t11);
    			append_dev(label, span1);
    			append_dev(div5, t12);
    			append_dev(div5, a1);
    			append_dev(form0, t14);
    			append_dev(form0, div6);
    			append_dev(div6, a2);
    			append_dev(form0, t16);
    			append_dev(form0, div7);
    			append_dev(div7, h6);
    			append_dev(div7, t18);
    			append_dev(div7, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a3);
    			append_dev(a3, i0);
    			append_dev(ul0, t19);
    			append_dev(ul0, li1);
    			append_dev(li1, a4);
    			append_dev(a4, i1);
    			append_dev(ul0, t20);
    			append_dev(ul0, li2);
    			append_dev(li2, a5);
    			append_dev(a5, i2);
    			append_dev(div15, t21);
    			append_dev(div15, div14);
    			append_dev(div14, form1);
    			append_dev(form1, h51);
    			append_dev(form1, t23);
    			append_dev(form1, div9);
    			append_dev(div9, input3);
    			append_dev(form1, t24);
    			append_dev(form1, div10);
    			append_dev(div10, input4);
    			append_dev(form1, t25);
    			append_dev(form1, div11);
    			append_dev(div11, input5);
    			append_dev(form1, t26);
    			append_dev(form1, div12);
    			append_dev(div12, a6);
    			append_dev(form1, t28);
    			append_dev(form1, div13);
    			append_dev(div17, t30);
    			append_dev(div17, div16);
    			append_dev(div16, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a7);
    			append_dev(ul1, t32);
    			append_dev(ul1, li4);
    			append_dev(li4, a8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div21);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ModalLogin> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ModalLogin", $$slots, []);
    	return [];
    }

    class ModalLogin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalLogin",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Components/Login.svelte generated by Svelte v3.22.3 */
    const file$c = "src/Components/Login.svelte";

    function create_fragment$c(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	const header = new Header({ $$inline: true });
    	const pushypanel = new PushyPanel({ $$inline: true });
    	const heroslider = new HeroSlider({ $$inline: true });
    	const news = new News({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(pushypanel.$$.fragment);
    			t2 = space();
    			create_component(heroslider.$$.fragment);
    			t3 = space();
    			create_component(news.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "site-overlay");
    			add_location(div0, file$c, 10, 2, 318);
    			attr_dev(div1, "id", "home");
    			add_location(div1, file$c, 12, 4, 369);
    			attr_dev(div2, "id", "root");
    			add_location(div2, file$c, 11, 2, 349);
    			attr_dev(div3, "class", "site-wrapper clearfix");
    			add_location(div3, file$c, 9, 0, 280);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(header, div1, null);
    			append_dev(div1, t1);
    			mount_component(pushypanel, div1, null);
    			append_dev(div1, t2);
    			mount_component(heroslider, div1, null);
    			append_dev(div1, t3);
    			mount_component(news, div1, null);
    			append_dev(div1, t4);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(pushypanel.$$.fragment, local);
    			transition_in(heroslider.$$.fragment, local);
    			transition_in(news.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(pushypanel.$$.fragment, local);
    			transition_out(heroslider.$$.fragment, local);
    			transition_out(news.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(header);
    			destroy_component(pushypanel);
    			destroy_component(heroslider);
    			destroy_component(news);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);

    	$$self.$capture_state = () => ({
    		News,
    		Footer,
    		Header,
    		HeroSlider,
    		PushyPanel,
    		ModalLogin
    	});

    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.22.3 */

    function create_fragment$d(ctx) {
    	let current;
    	const login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Login });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
