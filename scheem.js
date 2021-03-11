if (typeof module !== 'undefined') {
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.generate(fs.readFileSync(
            'scheem.peg',
            'utf-8'
        )).parse;
}

var env = {
    bindings: {"always3": function (x) { return 3; },
               'identity': function (x) { return x; },
               'addition':function (x,y,z) {return x + y+z;},
               'plusone': function (x) { return x + 1; },
               'sin': function (x) { return Math.sin(x); },
               'cos': function (x) { return Math.cos(x); }
               },
    outer: { }};

var lookup = function (env, v) {
    if (!(env.hasOwnProperty('bindings')))
        throw new Error(v + " not found");
    if (env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    return lookup(env.outer, v);
};


var add_binding = function (env, v, val) {
    env.bindings[v] = val;
    return env;
};

var update = function (env, v, val) {
    if(env.bindings[v]){
        env.bindings[v]= val;
    }else
    {
      update(env.outer, v, val);
        
    }
};

var evalScheemString = function(teststring , env){
	var parsed = parse(teststring);
	return evalScheem(parsed, env);
	
};

var evalScheem = function (expr, env) {
    "use strict";
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }   
     // Strings are variable references
    if (typeof expr === 'string') {
        return lookup(env , expr);
        //return "dude";
        }   
    
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case '-':
            return evalScheem(expr[1], env) -
                   evalScheem(expr[2], env);
        case '*':
            return evalScheem(expr[1], env) *
                   evalScheem(expr[2], env);
        case '/':
			if(evalScheem(expr[2], env) === 0)
				throw new Error("division by zero");
            return evalScheem(expr[1], env) /
                   evalScheem(expr[2], env);
        case 'define':
            //env.bindings[expr[1]] = evalScheem(expr[2], env);
            add_binding(env,expr[1],evalScheem(expr[2], env));
            return 0;
         case 'set!':
            //env[expr[1]] = evalScheem(expr[2], env);
            update(env , expr[1],expr[2]);
            return 0;              
        case 'quote':
            return expr[1];
        case 'begin':
            var temp = '';          
            for(var i = 1; i < expr.length; ++i){
             temp =  evalScheem(expr[i] , env);
            }
            return temp;
        case 'lambda':
			//(lambda (_vars...) _body)
			
				var lambda = function(arg){
					var bnd = { };
					for(var i = 0; i < expr[1].length;++i){ 
					bnd[expr[1][i]] = arguments[i];  
					}  
					var tempenv = { bindings: bnd, outer: env };
					return evalScheem(expr[2], tempenv); 
				};
			return lambda;
			
        case 'lambda-one':
			//Syntax: (lambda-one _var _body)
			//Example: (define plusone (lambda-one x (+ x 1)))
			//			(plusone 5)
            return function(arg) {
                 var bnd = { };
                 bnd[expr[1]] = arg;    
                 var tempenv = { bindings: bnd, outer: env };
                 return evalScheem(expr[2], tempenv); 
			};
		case '=':
            var eq = (evalScheem(expr[1], env) === evalScheem(expr[2], env));
            if (eq){
				return '#t';
			} else 
			{
				return '#f';
			}
        case 'cons':
            return [evalScheem(expr[1],env)].concat(evalScheem(expr[2],env));
        case 'car':
            return evalScheem(expr[1], env)[0];
        case 'cdr' :
            return evalScheem(expr[1], env).slice(1);
        case 'if':
			
            var tempif = evalScheem(expr[1], env);
            
            if(tempif === "#t"){
                return evalScheem(expr[2], env);
            }else{
                return evalScheem(expr[3], env);
               
            } 
         case 'let-one':
          //Syntax: (let-one _var _expr _body)
          //Example (let-one x 2 (+ x 1))
            var tempEnv = {};
            tempEnv.bindings = {};
            tempEnv.bindings[expr[1]]=expr[2];
            tempEnv.outer=env;
            return evalScheem(expr[3],tempEnv); 
          case 'let': 
          //syntax:(let (_bindings...) _body)
          //each binding has the form (_var _expr)
          var tempEnv = {};
          tempEnv.bindings = {};
          var _bindings = expr[1];
          for(var l = 0; l < _bindings.length;++l){
			  tempEnv.bindings[_bindings[l][0]]=_bindings[l][1];
		  } 
		  tempEnv.outer=env;
          return evalScheem(expr[2],tempEnv);
          
          default:
            // New stuff here
            var func = evalScheem(expr[0], env);
            var args = expr.slice(1, expr.length);
            var arg =[];
            for(i=0;i<args.length;++i){
				arg.push(evalScheem(args[i], env));
			}
			//arg = evalScheem(arg, env);
            var result = func.apply(null,arg);
             
            return result;                
    }
    return env;
};


// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}
