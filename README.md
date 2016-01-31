# node-gloves

Node REPL is interesting. You write JavaScript. REPL executes it and gives you a response.

```js
> var greeting = "hi there!"; greeting;
'hi there!'
> 2 * 2
4
```

It looks a lot like a command line but it doesn't behave like one.

```js
> console.log("hi there!") && 2*2
...
```

For one, you can't do two consecutive things unless you write it as a proper Javascript statement.

```js
> console.log( "hi there!" ); console.log( 2*2 );
'hi there!'
4
undefined
```

Yes, it'll always output the return statement, even if the return is undefined.

It's even worse when you start using the callstack.

```js
> setTimeout( function(){ console.log("hi there!") }, 10);
// prints object with lots of info relating to the timeout
> hi there!
_
```

Node REPL returned your prompt BEFORE the callstack cleared. When setTimeout was done, it hijacked your caret when it needed to output.
Even if you had started typing, it would just append the output to what you were already doing. Worse yet, it didn't make a clean prompt for you. No more caret :(

What if you could chain consecutive individual statements?

What if I could pipe results from one expression into the next?

What if the prompt understood the callstack and waited for it before returning?

What if it didn't mindlessly output undefined returns?

**What if Node REPL was more like the command line?**

# node-gloves

1. Consecutive Calls
===

Like a regular command line, you can make node-gloves do things sequentially.

```js
gloves > console.log("hi there!") && 2*2
'hi there!'
4
gloves > 
```

Even async things.

```js
gloves > setTimeout( function(){ console.log("hi there!"); }, 1000) && 2*2
'hi there!'
// prints object with lots of info relating to the timeout
4
gloves >
```

*sidenote: async calls can't steal your prompt*

2. Pipeable (*sorta*)
===

```js
gloves > 2*2 | console.log( "previous step returned " + res )
'previous step returned 4'
gloves >
```

*Notice it didn't print `console.log`'s return? Gloves won't print out an undefined response.*

`res` is a magic variable when using pipes. It contains the value the previous pipe step returned.

You can set `res` in callbacks to control what is passed on.

```js
gloves > setTimeout( function(){ res = 2*2 }, 1000) | res * res | res * res + ' bottles of beer on the wall ...'
'256 bottles of beer on the wall ...'
gloves >
```

3. Pluggable
===

In addition to npm packages which are available because node-gloves is node, there's support for a plugin system.

This means you can compose functionality and package them up for reuse in the gloves enviroment.

```js
gloves > disc-kv.set('greeting', 'hi there!') && disc-kv.get('greeting', function(v){ res = v }) | res.toUpperCase()
'greeting = hi there!'
'HI THERE!'
gloves >
```

`disc-kv` is a simple plugin that utilizies `require('fs')` to persist values to a json file. That way I can keep things even after I close node-gloves.

I stored a variable to my disc and in the next expression I fetch and pipe it to `console.log`.

# Installation

For now, clone this repository and run `npm install`.

# Start

`npm start`.

# FEEDBACK

Like it? Hate it? Think it's pointless? Wanna help make it better? Just wanna say hi?

twitter: @akamaozu

email: uzo@designbymobius.ca

carrier pidgeon: yellow and brown house somewhere in Lagos Nigeria.
