if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var fs = require('fs');
    var PEG = require('pegjs');
    var evalScheem = require('../scheem').evalScheem;
    var evalScheemString = require('../scheem').evalScheemString;
    var parse = PEG.generate(fs.readFileSync(
        'scheem.peg', 'utf-8')).parse;
    } else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
}
//var env = {dog:20,cat:24, a:2, b:3};
//var env = { a:2, b:3};

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [3,2,1]], {}),
            [3,2,1]
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});

suite('parse', function() {
    test('a number', function() {
        assert.deepEqual(
            parse('42'),
            42
        );
    });
    test('a negative number', function() {
        assert.deepEqual(
            parse('-42'),
            -42
        );
    });
    test('a decimal number', function() {
        assert.deepEqual(
            parse('4.2'),
            4.2
        );
    });
    test('a variable', function() {
        assert.deepEqual(
            parse('x'),
            'x'
        );
    });
    test('comments', function() {
        assert.deepEqual(
            parse(';;comment\n(+ 1 2)'),
            ["+", 1 , 2]
        );
    });
});


suite('if', function() {
    test('(if (= 1 1) 2 3) test', function() {
		assert.deepEqual(evalScheem(['if', ['=', 1, 1], 2, 3], {}), 
			2
		);
    });
    test('(if (= 1 0) 2 3) test', function() {
		assert.deepEqual(evalScheem(['if', ['=', 1, 0], 2, 3], {}), 
			3
		);
    });
    test('(if (= 1 1) a b) test', function() {
		assert.deepEqual(evalScheem(['if', ['=', 1, 1], "a", "b"], {bindings:{ a:2, b:3},outer:{}}), 
			2
		);
    });
 });
 suite('Functions', function() {
	 test('one expresion', function() {
        assert.deepEqual(
            evalScheem(["begin", ["+",1,2]], {}),
            3
        );
    });
    test('define', function() {
        assert.deepEqual(
            evalScheem(["begin", ["define", "x", 5],["+",1,"x"]], {bindings:{},outer:{}}),
            6
        );
    });
    test('cons', function() {
        assert.deepEqual(
            evalScheem(["begin", ["cons", 1, 5]], {}),
            [1,5]
        );
    });
    test('car', function() {
        assert.deepEqual(
            evalScheem(["begin", ["car", ["cons", 1, 5]]], {}),
            1
        );
    });
    test('cdr', function() {
        assert.deepEqual(
            evalScheem(["begin", ["cdr", ['quote', [3,2,1]]]], {}),
            [2,1]
        );
    });
    test('let-one', function() {
        assert.deepEqual(
            evalScheem(["let-one","x",5, ["+","x",2]], {}),
            7
        );
    });
    test('lambda-one', function() {
        assert.deepEqual(
            evalScheem([["lambda-one","x",["+","x",1]],5], {}),
            6
        );
    });
    test('lambda', function() {
        assert.deepEqual(
            evalScheem([["lambda",["x","y"],["+","x","y"]],5,6], {}),
            11
        );
    });
 });	 
 suite('Arithmetic', function() {
    test('two numbers - add', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 5], {}),
            8
        );
    });
     test('two numbers - mulitply', function() {
        assert.deepEqual(
            evalScheem(['*', 2, 5], {}),
            10
        );
    });
    test('two numbers - divide', function() {
        assert.deepEqual(
            evalScheem(['/', 10, 2], {}),
            5
        );
    });
    test('two numbers - divide by zero', function() {
        assert.deepEqual(
            evalScheem(['/', 10, 0], {}),
            Infinity
        );
    });
   
    test('negative numbers - add', function() {
        assert.deepEqual(
            evalScheem(['+', -3, 5], {}),
            2
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['+', 3, ['+', 2, 2]], {}),
            7
        );
    });
    test('two expressions', function() {
        assert.deepEqual(
            evalScheem(['+', ['*', 2, 5], ['+', 2, 2]], {}),
            14
        );
    });
    test('multiple expressions', function() {
        assert.deepEqual(
            evalScheem(['+', ['*', ['*', 2, 5], ['+', 2, 2]], ['+', 2, 2]], {}),
            44
        );
    });
    test('two numbers - quote', function() {
        assert.deepEqual(
            evalScheem(['+', ['quote', 3], ['quote', 5]], {}),
            8
        );
    });
    test('a dog and a cat', function() {
		assert.deepEqual(
			evalScheem(['+', 'dog', 'cat'], {bindings:{dog:20,cat:24, a:2},outer:{}}),
			44
		);
    });
});

suite('evalScheemString', function() {
    test('(if (= 1 1) 2 3) test', function() {
		assert.deepEqual(evalScheemString("(if (= 1 1) a b)", {bindings:{a:2, b:3},outer:{}}), 
			2
		);
    });
    test('(if (= 1 0) a b) test', function() {
		assert.deepEqual(evalScheemString("(if (= 1 0) 2 3)", {}), 
			3
		);
    });
    test('a number', function() {
       assert.deepEqual(evalScheemString("42", {}), 
			42
        );
	});
 });